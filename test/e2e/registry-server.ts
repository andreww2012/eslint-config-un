import crypto from 'node:crypto';
import http from 'node:http';
import https from 'node:https';
import {pipeline} from 'node:stream/promises';

const UPSTREAM_REGISTRY_URL = 'https://registry.npmjs.org';

// Package managers wait much longer before retrying a stalled download
const UPSTREAM_IDLE_TIMEOUT_MS = 30_000;

// Old enough to pass the minimum release age that some package managers enforce by default
const PUBLISH_TIME = new Date(0).toISOString();

// These describe a single connection, so forwarding them would break the other one
const HOP_BY_HOP_HEADERS = new Set(['connection', 'host', 'keep-alive', 'transfer-encoding']);

const omitHopByHopHeaders = (headers: http.IncomingHttpHeaders) =>
  Object.fromEntries(Object.entries(headers).filter(([name]) => !HOP_BY_HOP_HEADERS.has(name)));

/**
 * Serves a single package version from the given tarball and proxies every other request to the
 * npm registry
 */
export const startRegistry = async ({
  name,
  version,
  manifest,
  tarball,
}: {
  name: string;
  version: string;
  manifest: Record<string, unknown>;
  tarball: Buffer;
}) => {
  const tarballPath = `/${name}/-/${name}-${version}.tgz`;
  const dist = {
    // eslint-disable-next-line sonar/hashing -- the packument format requires SHA-1 alongside SHA-512
    shasum: crypto.createHash('sha1').update(tarball).digest('hex'),
    integrity: `sha512-${crypto.createHash('sha512').update(tarball).digest('base64')}`,
  };

  // Package managers request hundreds of packages at once, a TLS handshake for each is slow
  const upstreamAgent = new https.Agent({keepAlive: true});

  const server = http.createServer((request, response) => {
    const {pathname} = new URL(request.url || '/', 'http://localhost');

    if (pathname === `/${name}`) {
      const packument = {
        name,
        'dist-tags': {latest: version},
        time: {created: PUBLISH_TIME, modified: PUBLISH_TIME, [version]: PUBLISH_TIME},
        versions: {
          [version]: {
            ...manifest,
            name,
            version,
            _id: `${name}@${version}`,
            dist: {...dist, tarball: `http://${request.headers.host}${tarballPath}`},
          },
        },
      };
      response.writeHead(200, {'content-type': 'application/json'}).end(JSON.stringify(packument));
      return;
    }

    if (pathname === tarballPath) {
      response.writeHead(200, {'content-type': 'application/octet-stream'}).end(tarball);
      return;
    }

    const upstreamRequest = https.request(
      `${UPSTREAM_REGISTRY_URL}${request.url}`,
      {
        method: request.method,
        headers: omitHopByHopHeaders(request.headers),
        agent: upstreamAgent,
        timeout: UPSTREAM_IDLE_TIMEOUT_MS,
      },
      (upstreamResponse) => {
        response.writeHead(
          upstreamResponse.statusCode || 502,
          omitHopByHopHeaders(upstreamResponse.headers),
        );
        // Destroys both sides when either fails, so a broken download is retried instead of awaited
        pipeline(upstreamResponse, response).catch(() => null);
      },
    );
    upstreamRequest.on('timeout', () => {
      upstreamRequest.destroy(new Error('Upstream registry stopped responding'));
    });
    upstreamRequest.on('error', () => {
      if (response.headersSent) {
        response.destroy();
      } else {
        response.writeHead(502).end();
      }
    });
    request.pipe(upstreamRequest);
  });

  await new Promise<void>((resolve) => {
    server.listen(0, resolve);
  });

  const address = server.address();
  if (address == null || typeof address === 'string') {
    throw new Error('Registry server is not listening on a TCP port');
  }

  return {
    url: `http://localhost:${address.port}/`,
    close: () =>
      new Promise<void>((resolve) => {
        server.closeAllConnections();
        upstreamAgent.destroy();
        server.close(() => {
          resolve();
        });
      }),
  };
};
