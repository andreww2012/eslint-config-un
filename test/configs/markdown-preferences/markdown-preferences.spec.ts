import {GLOB_MARKDOWN} from '../../../src/constants';

const FIXTURES = {
  headingWithNonSentenceCase: 'heading-non-sentence-case.md',
  nonCanonicalCodeBlockLanguage: 'non-canonical-code-block-language.md',
  vitepressCustomContainerWithoutSpaceInHeader:
    'vitepress-custom-container-without-space-in-header.md',
} as const;

describe('basic tests', async () => {
  const configResult = await computeEslintConfig('markdownPreferences');

  it('loads `markdown-preferences` plugin if used', () => {
    expect(configResult.getLoadedPlugin('markdown-preferences')).toBeDefined();
  });

  it('creates `markdown-preferences` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeDefined();
  });

  describe('mode: all configs are disabled', () => {
    it('does not create `markdown-preferences` eslint config', async () => {
      const configResult = await computeEslintConfig({});

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeUndefined();
    });

    it('creates `markdown-preferences` eslint config if explicitly enabled', async () => {
      const configResult = await computeEslintConfig('markdownPreferences');

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeDefined();
    });
  });

  describe('mode: all configs are not explicitly enabled or disabled', () => {
    it('creates `markdown-preferences` eslint config', async () => {
      const configResult = await computeEslintConfig({}, {reset: true});

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeDefined();
    });

    it('creates `markdown-preferences` eslint config and prints a warning if explicitly enabled', async () => {
      using stderrSpy = vi.spyOn(process.stderr, 'write');

      await computeEslintConfig('markdownPreferences', {reset: true});

      expect(
        String(stderrSpy.mock.calls[0]?.[0]).startsWith(
          `[warn] [eslint-config-un] There is no need to enable \`markdownPreferences\` config because this is the default`,
        ),
      ).toBe(true);
    });

    it('does not create `markdown-preferences` eslint config if explicitly disabled', async () => {
      const configResult = await computeEslintConfig({markdownPreferences: false}, {reset: true});

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeUndefined();
    });
  });

  describe('mode: misc configs are enabled', () => {
    it('creates `markdown-preferences` eslint config', async () => {
      const configResult = await computeEslintConfig(
        {},
        {reset: true, un: {defaultConfigsStatus: 'misc-enabled'}},
      );

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeDefined();
    });
  });

  it('has default `files` in `markdown-preferences` eslint config', () => {
    expect(configResult.getConfigByUnPostfix('markdown-preferences')?.files).toMatchInlineSnapshot(
      `["**/*.md"]`,
    );
  });

  it('has default `ignores` in `markdown-preferences` eslint config (does not ignore .md files)', () => {
    const ignores = configResult.getConfigByUnPostfix('markdown-preferences')?.ignores;

    expect(ignores?.length).toBeGreaterThan(0);
    expect(ignores).not.to.include.members([GLOB_MARKDOWN]);
  });
});

describe('rules', async () => {
  const configResult = await computeEslintConfig('markdownPreferences');

  it('enables `markdown-preferences/canonical-code-block-language` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'markdown-preferences',
        'markdown-preferences/canonical-code-block-language',
      ),
    ).toBe(2);
  });

  it('disables `markdown-preferences/emoji-notation` rule by default', () => {
    expect(
      configResult.getRuleEntrySeverity(
        'markdown-preferences',
        'markdown-preferences/emoji-notation',
      ),
    ).toBe(0);
  });

  it('`markdown-preferences/canonical-code-block-language` rule fires on a markdown file with a non-canonical code block language', async () => {
    const results = await testEslintConfig(
      'markdownPreferences',
      FIXTURES.nonCanonicalCodeBlockLanguage,
      import.meta.dirname,
    );

    const error = findLintMessageFromLintResults(
      results,
      FIXTURES.nonCanonicalCodeBlockLanguage,
      'markdown-preferences/canonical-code-block-language',
    );

    expect(error?.message).toMatchInlineSnapshot(
      `"Use canonical language name "js" instead of "javascript"."`,
    );
  });
});

describe('un options', () => {
  describe('option: `files`', () => {
    it('uses user-provided `files` in `markdown-preferences` eslint config', async () => {
      const FILES = ['docs/**/*.md'];
      const configResult = await computeEslintConfig({
        markdownPreferences: {files: FILES},
      });

      expect(configResult.getConfigByUnPostfix('markdown-preferences')?.files).toStrictEqual(FILES);
    });

    it('disables `markdown-preferences` eslint config when `files` is empty array', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {files: []},
      });

      expect(configResult.getConfigByUnPostfix('markdown-preferences')).toBeUndefined();
    });
  });

  describe('option: `ignores`', () => {
    it('uses user-provided `ignores` in `markdown-preferences` eslint config and merges them with defaults', async () => {
      const IGNORES = ['**/fixtures/**'];
      const configResult = await computeEslintConfig({
        markdownPreferences: {ignores: IGNORES},
      });

      const ignores = configResult.getConfigByUnPostfix('markdown-preferences')?.ignores;

      expect(ignores).to.include.members(IGNORES);
      expect(ignores?.length).toBeGreaterThan(IGNORES.length);
    });
  });

  it('respects `overrides` and `overridesAny` in `markdown-preferences` eslint config', async () => {
    const configResult = await computeEslintConfig({
      markdownPreferences: {
        overrides: {'markdown-preferences/canonical-code-block-language': 0},
        overridesAny: {'no-console': 0},
      },
    });

    expect(
      configResult.getRuleEntrySeverity(
        'markdown-preferences',
        'markdown-preferences/canonical-code-block-language',
      ),
    ).toBe(0);

    expect(configResult.getRuleEntrySeverity('markdown-preferences', 'no-console')).toBe(0);
  });

  describe('option: `forceSeverity`', () => {
    it('respects `forceSeverity` set to `error` in `markdown-preferences` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {forceSeverity: 'error'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('markdown-preferences'),
          (ruleName) => ruleName.startsWith('markdown-preferences/'),
        ),
      ).toStrictEqual([2]);
    });

    it('respects `forceSeverity` set to `warn` in `markdown-preferences` eslint config', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {forceSeverity: 'warn'},
      });

      expect(
        getAllRulesSeverities(
          configResult.getConfigByUnPostfix('markdown-preferences'),
          (ruleName) => ruleName.startsWith('markdown-preferences/'),
        ),
      ).toStrictEqual([1]);
    });
  });
});

describe('options', () => {
  describe('option: `extendedMarkdownSyntax`', () => {
    it('sets `language` to `markdown/commonmark` by default (not enabled)', async () => {
      const configResult = await computeEslintConfig('markdownPreferences');

      expect(configResult.getConfigByUnPostfix('markdown-preferences')?.language).toBe(
        'markdown/commonmark',
      );
    });

    it('`markdown-preferences/heading-casing` rule fires on a markdown heading that violates sentence case when `extendedMarkdownSyntax` is `false`', async () => {
      const results = await testEslintConfig(
        {markdownPreferences: {extendedMarkdownSyntax: false}},
        FIXTURES.headingWithNonSentenceCase,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.headingWithNonSentenceCase,
        'markdown-preferences/heading-casing',
      );

      expect(results[0]?.fatalErrorCount).toBe(0);
      expect(error?.message).toMatchInlineSnapshot(
        `"Expected "World" to be "world" (Sentence case)."`,
      );
    });

    it('`markdown-preferences/custom-container-marker-spacing` rule fires on a custom container with no space between marker and info string when `extendedMarkdownSyntax` is `true`', async () => {
      const results = await testEslintConfig(
        {markdownPreferences: {extendedMarkdownSyntax: true}},
        FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
        'markdown-preferences/custom-container-marker-spacing',
      );

      expect(results[0]?.fatalErrorCount).toBe(0);
      expect(error?.message).toMatchInlineSnapshot(
        `"Expected a space between opening custom container marker and info."`,
      );
    });

    it('parses markdown files with extended syntax language if `markdown` config is enabled', async () => {
      const results = await testEslintConfig(
        {markdownPreferences: {extendedMarkdownSyntax: true}, markdown: true},
        FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
        import.meta.dirname,
      );

      const error = findLintMessageFromLintResults(
        results,
        FIXTURES.vitepressCustomContainerWithoutSpaceInHeader,
        'markdown-preferences/custom-container-marker-spacing',
      );

      expect(results[0]?.fatalErrorCount).toBe(0);
      expect(error?.message).toMatchInlineSnapshot(
        `"Expected a space between opening custom container marker and info."`,
      );
    });
  });

  describe('option: `delimitersStyle`', () => {
    describe('`emphasis` sub-option', () => {
      it('uses `*` emphasis style by default', async () => {
        const configResult = await computeEslintConfig('markdownPreferences');

        expect(
          configResult.getRuleEntry(
            'markdown-preferences',
            'markdown-preferences/emphasis-delimiters-style',
          ),
        ).toMatchInlineSnapshot(`[2, {"emphasis": "*", "strong": "**"}]`);
      });

      it("uses `_` emphasis style when `emphasis` is `'_'`", async () => {
        const configResult = await computeEslintConfig({
          markdownPreferences: {delimitersStyle: {emphasis: '_'}},
        });

        expect(
          configResult.getRuleEntry(
            'markdown-preferences',
            'markdown-preferences/emphasis-delimiters-style',
          ),
        ).toMatchInlineSnapshot(`[2, {"emphasis": "_", "strong": "__"}]`);
      });

      it('disables `emphasis-delimiters-style` rule when `emphasis` is `false`', async () => {
        const configResult = await computeEslintConfig({
          markdownPreferences: {delimitersStyle: {emphasis: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'markdown-preferences',
            'markdown-preferences/emphasis-delimiters-style',
          ),
        ).toBe(0);
      });

      it('uses options directly provided to `emphasis` on `emphasis-delimiters-style` rule', async () => {
        const configResult = await computeEslintConfig({
          markdownPreferences: {
            delimitersStyle: {emphasis: {emphasis: '_', strong: '**', strongEmphasis: '***'}},
          },
        });

        expect(
          configResult.getRuleEntry(
            'markdown-preferences',
            'markdown-preferences/emphasis-delimiters-style',
          ),
        ).toMatchInlineSnapshot(`[2, {"emphasis": "_", "strong": "**", "strongEmphasis": "***"}]`);
      });
    });

    describe('`strikethrough` sub-option', () => {
      it('uses `~~` strikethrough style by default', async () => {
        const configResult = await computeEslintConfig('markdownPreferences');

        expect(
          configResult.getRuleEntry(
            'markdown-preferences',
            'markdown-preferences/strikethrough-delimiters-style',
          ),
        ).toMatchInlineSnapshot(`[2, {"delimiter": "~~"}]`);
      });

      it("uses `~` strikethrough style when `strikethrough` is `'~'`", async () => {
        const configResult = await computeEslintConfig({
          markdownPreferences: {delimitersStyle: {strikethrough: '~'}},
        });

        expect(
          configResult.getRuleEntry(
            'markdown-preferences',
            'markdown-preferences/strikethrough-delimiters-style',
          ),
        ).toMatchInlineSnapshot(`[2, {"delimiter": "~"}]`);
      });

      it('disables `strikethrough-delimiters-style` rule when `strikethrough` is `false`', async () => {
        const configResult = await computeEslintConfig({
          markdownPreferences: {delimitersStyle: {strikethrough: false}},
        });

        expect(
          configResult.getRuleEntrySeverity(
            'markdown-preferences',
            'markdown-preferences/strikethrough-delimiters-style',
          ),
        ).toBe(0);
      });
    });

    it('disables both `emphasis-delimiters-style` and `strikethrough-delimiters-style` rules when `delimitersStyle` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {delimitersStyle: false},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/emphasis-delimiters-style',
        ),
      ).toBe(0);

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/strikethrough-delimiters-style',
        ),
      ).toBe(0);
    });
  });

  describe('option: `enforceCasing`', () => {
    it('enforces sentence case in headings and table headers by default', async () => {
      const configResult = await computeEslintConfig('markdownPreferences');

      expect(
        configResult.getRuleEntry('markdown-preferences', 'markdown-preferences/heading-casing'),
      ).toMatchInlineSnapshot(
        `[2, {"ignorePatterns": ["/^v\\d+/u", "/\\w+\\.[a-z\\d]+$/u", "/\\w+(?:API|Api)$/u", "/\\w+(?:SDK|Sdk)$/u", "/\\w+(?:CLI|Cli)$/u"], "preserveWords": ["JavaScript", "TypeScript", "ECMAScript", "ES6", "ES2015", "ES2016", "ES2017", "ES2018", "ES2019", "ES2020", "ES2021", "ES2022", "ES2023", "ES2024", "ES2025", "ES2026", "ES2027", "ES2028", "ES2029", "PHP", "Python", "Java", "C#", "C++", "Rust", "Go", "go", "Swift", "Kotlin", "Dart", "Ruby", "Scala", "Perl", "R", "MATLAB", "Lua", "Haskell", "Elixir", "Clojure", "F#", "OCaml", "Zig", "V", "Nim", "Crystal", "Gleam", "Odin", "Carbon", "HTML", "CSS", "Sass", "SCSS", "Less", "Stylus", "JSON", "XML", "PDF", "CSV", "YAML", "TOML", "Markdown", "LaTeX", "Parquet", "Avro", "Protobuf", "MessagePack", "BSON", "HDF5", "Apache Arrow", "ORC", "SQL", "GraphQL", "React", "Vue", "Angular", "Redux", "Svelte", "SvelteKit", "Preact", "Solid", "Alpine.js", "Lit", "Stencil", "Ember.js", "Backbone.js", "jQuery", "D3.js", "Three.js", "Chart.js", "Plotly", "Astro", "Remix", "Qwik", "SolidJS", "Vike", "Node.js", "Deno", "Bun", "Electron", "Tauri", "Next.js", "Nuxt.js", "Gatsby", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Ruby on Rails", "Spring Boot", "Laravel", "Phoenix", "Actix", "Axum", "Rocket", "Flutter", "React Native", "Ionic", "Xamarin", "Expo", "Unity", "Unreal Engine", "ESLint", "Prettier", "Biome", "oxc", "swc", "markdownlint", "Webpack", "Vite", "Babel", "Workbox", "Rollup", "Parcel", "esbuild", "Turbo", "Turborepo", "Nx", "Lerna", "Rush", "npm", "yarn", "pnpm", "bun", "bower", "composer", "pip", "conda", "Maven", "Gradle", "SBT", "Cargo", "homebrew", "chocolatey", "CocoaPods", "Carthage", "Swift Package Manager", "VS Code", "Visual Studio Code", "Vim", "Neovim", "Emacs", "Sublime Text", "Atom", "Brackets", "brackets", "Visual Studio", "IntelliJ IDEA", "WebStorm", "PHPStorm", "PyCharm", "Android Studio", "Xcode", "Docker", "Kubernetes", "Helm", "CI / CD", "DevOps", "GitOps", "IaC", "Infrastructure as Code", "SaaS", "PaaS", "IaaS", "CDN", "Load Balancer", "API Gateway", "Microservices", "Serverless", "Lambda", "Cloud Functions", "Container Registry", "Prometheus", "Grafana", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Azure DevOps", "TeamCity", "Bamboo", "Buildkite", "Drone CI", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Heroku", "Vercel", "Netlify", "Railway", "Render", "Fly.io", "Cloudflare", "DigitalOcean", "API", "APIs", "REST", "RESTful", "gRPC", "HTTP", "HTTPS", "WebSocket", "SOAP", "XML-RPC", "JSON-RPC", "CLI", "SDK", "URL", "URI", "UUID", "GUID", "CRUD", "ACID", "BASE", "CAP Theorem", "JWT", "OAuth", "OAuth2", "OpenID Connect", "SAML", "SSO", "MFA", "2FA", "CORS", "CSRF", "XSS", "SSH", "FTP", "SFTP", "SMTP", "IMAP", "POP3", "TCP", "UDP", "IP", "IPv4", "IPv6", "DNS", "DHCP", "VPN", "SSL", "TLS", "LDAP", "PostgreSQL", "MySQL", "SQLite", "MariaDB", "Oracle", "SQL Server", "CockroachDB", "PlanetScale", "Neon", "NoSQL", "MongoDB", "DynamoDB", "Cassandra", "CouchDB", "Neo4j", "ArangoDB", "FaunaDB", "Firebase", "Supabase", "Redis", "ElasticSearch", "Solr", "InfluxDB", "TimescaleDB", "Prisma", "TypeORM", "Sequelize", "Mongoose", "Drizzle", "Knex.js", "Objection.js", "Bookshelf.js", "QA", "QC", "TDD", "BDD", "E2E", "Unit Testing", "Integration Testing", "Jest", "Mocha", "Chai", "Jasmine", "Karma", "Vitest", "Ava", "Tape", "Cypress", "Playwright", "Selenium", "Puppeteer", "WebDriver", "TestCafe", "SonarQube", "Husky", "lint-staged", "commitizen", "semantic-release", "Codecov", "CodeClimate", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Hugging Face", "LangChain", "OpenAI", "Anthropic", "Jupyter", "MLflow", "Weights & Biases", "CUDA", "ONNX", "GPT", "BERT", "Transformer", "Claude", "Gemini", "LLaMA", "Stable Diffusion", "DALL-E", "Midjourney", "AutoML", "ETL", "ELT", "Big Data", "Data Lake", "Data Warehouse", "OLAP", "OLTP", "Apache Spark", "Apache Kafka", "Apache Airflow", "Hadoop", "Snowflake", "Databricks", "Tableau", "Power BI", "Looker", "OWASP", "SAST", "DAST", "IAST", "SCA", "Penetration Testing", "Vulnerability Assessment", "RBAC", "ABAC", "Zero Trust", "PKI", "HSM", "WAF", "DDoS", "PWA", "SPA", "SSR", "SSG", "CSR", "JAMstack", "Headless CMS", "Edge Computing", "WebAssembly", "WASM", "Service Worker", "Web Components", "Micro Frontends", "BFF", "Backend for Frontend", "tRPC", "gRPC-Web", "WebRTC", "WebGL", "WebGPU", "Material UI", "Ant Design", "Chakra UI", "React Bootstrap", "Semantic UI React", "Blueprint", "Mantine", "NextUI", "Arco Design", "Tailwind CSS", "Bootstrap", "Bulma", "Foundation", "Semantic UI", "Materialize", "Spectre.css", "Tachyons", "PureCSS", "styled-components", "CSS-in-JS", "Emotion", "JSS", "Styled System", "Stitches", "Vanilla Extract", "Linaria", "Aphrodite", "Glamorous", "Radium", "Git", "Mercurial", "SVN", "GitHub", "GitLab", "Bitbucket", "Pull Request", "Merge Request", "Code Review", "Pair Programming", "Mob Programming", "Docusaurus", "GitBook", "VitePress", "VuePress", "Docsify", "MkDocs", "Sphinx", "Jekyll", "Hugo", "Eleventy", "Hexo", "Zola", "Swagger", "OpenAPI", "Postman", "Insomnia", "Redoc", "Stoplight", "MIT", "GPL", "AGPL", "LGPL", "CC0", "FAQ", "YouTube"], "style": "Sentence case"}]`,
      );

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toMatchInlineSnapshot(
        `[2, {"ignorePatterns": ["/^v\\d+/u", "/\\w+\\.[a-z\\d]+$/u", "/\\w+(?:API|Api)$/u", "/\\w+(?:SDK|Sdk)$/u", "/\\w+(?:CLI|Cli)$/u"], "preserveWords": ["JavaScript", "TypeScript", "ECMAScript", "ES6", "ES2015", "ES2016", "ES2017", "ES2018", "ES2019", "ES2020", "ES2021", "ES2022", "ES2023", "ES2024", "ES2025", "ES2026", "ES2027", "ES2028", "ES2029", "PHP", "Python", "Java", "C#", "C++", "Rust", "Go", "go", "Swift", "Kotlin", "Dart", "Ruby", "Scala", "Perl", "R", "MATLAB", "Lua", "Haskell", "Elixir", "Clojure", "F#", "OCaml", "Zig", "V", "Nim", "Crystal", "Gleam", "Odin", "Carbon", "HTML", "CSS", "Sass", "SCSS", "Less", "Stylus", "JSON", "XML", "PDF", "CSV", "YAML", "TOML", "Markdown", "LaTeX", "Parquet", "Avro", "Protobuf", "MessagePack", "BSON", "HDF5", "Apache Arrow", "ORC", "SQL", "GraphQL", "React", "Vue", "Angular", "Redux", "Svelte", "SvelteKit", "Preact", "Solid", "Alpine.js", "Lit", "Stencil", "Ember.js", "Backbone.js", "jQuery", "D3.js", "Three.js", "Chart.js", "Plotly", "Astro", "Remix", "Qwik", "SolidJS", "Vike", "Node.js", "Deno", "Bun", "Electron", "Tauri", "Next.js", "Nuxt.js", "Gatsby", "Express.js", "NestJS", "FastAPI", "Django", "Flask", "Ruby on Rails", "Spring Boot", "Laravel", "Phoenix", "Actix", "Axum", "Rocket", "Flutter", "React Native", "Ionic", "Xamarin", "Expo", "Unity", "Unreal Engine", "ESLint", "Prettier", "Biome", "oxc", "swc", "markdownlint", "Webpack", "Vite", "Babel", "Workbox", "Rollup", "Parcel", "esbuild", "Turbo", "Turborepo", "Nx", "Lerna", "Rush", "npm", "yarn", "pnpm", "bun", "bower", "composer", "pip", "conda", "Maven", "Gradle", "SBT", "Cargo", "homebrew", "chocolatey", "CocoaPods", "Carthage", "Swift Package Manager", "VS Code", "Visual Studio Code", "Vim", "Neovim", "Emacs", "Sublime Text", "Atom", "Brackets", "brackets", "Visual Studio", "IntelliJ IDEA", "WebStorm", "PHPStorm", "PyCharm", "Android Studio", "Xcode", "Docker", "Kubernetes", "Helm", "CI / CD", "DevOps", "GitOps", "IaC", "Infrastructure as Code", "SaaS", "PaaS", "IaaS", "CDN", "Load Balancer", "API Gateway", "Microservices", "Serverless", "Lambda", "Cloud Functions", "Container Registry", "Prometheus", "Grafana", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Azure DevOps", "TeamCity", "Bamboo", "Buildkite", "Drone CI", "AWS", "Amazon Web Services", "Azure", "GCP", "Google Cloud Platform", "Heroku", "Vercel", "Netlify", "Railway", "Render", "Fly.io", "Cloudflare", "DigitalOcean", "API", "APIs", "REST", "RESTful", "gRPC", "HTTP", "HTTPS", "WebSocket", "SOAP", "XML-RPC", "JSON-RPC", "CLI", "SDK", "URL", "URI", "UUID", "GUID", "CRUD", "ACID", "BASE", "CAP Theorem", "JWT", "OAuth", "OAuth2", "OpenID Connect", "SAML", "SSO", "MFA", "2FA", "CORS", "CSRF", "XSS", "SSH", "FTP", "SFTP", "SMTP", "IMAP", "POP3", "TCP", "UDP", "IP", "IPv4", "IPv6", "DNS", "DHCP", "VPN", "SSL", "TLS", "LDAP", "PostgreSQL", "MySQL", "SQLite", "MariaDB", "Oracle", "SQL Server", "CockroachDB", "PlanetScale", "Neon", "NoSQL", "MongoDB", "DynamoDB", "Cassandra", "CouchDB", "Neo4j", "ArangoDB", "FaunaDB", "Firebase", "Supabase", "Redis", "ElasticSearch", "Solr", "InfluxDB", "TimescaleDB", "Prisma", "TypeORM", "Sequelize", "Mongoose", "Drizzle", "Knex.js", "Objection.js", "Bookshelf.js", "QA", "QC", "TDD", "BDD", "E2E", "Unit Testing", "Integration Testing", "Jest", "Mocha", "Chai", "Jasmine", "Karma", "Vitest", "Ava", "Tape", "Cypress", "Playwright", "Selenium", "Puppeteer", "WebDriver", "TestCafe", "SonarQube", "Husky", "lint-staged", "commitizen", "semantic-release", "Codecov", "CodeClimate", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Hugging Face", "LangChain", "OpenAI", "Anthropic", "Jupyter", "MLflow", "Weights & Biases", "CUDA", "ONNX", "GPT", "BERT", "Transformer", "Claude", "Gemini", "LLaMA", "Stable Diffusion", "DALL-E", "Midjourney", "AutoML", "ETL", "ELT", "Big Data", "Data Lake", "Data Warehouse", "OLAP", "OLTP", "Apache Spark", "Apache Kafka", "Apache Airflow", "Hadoop", "Snowflake", "Databricks", "Tableau", "Power BI", "Looker", "OWASP", "SAST", "DAST", "IAST", "SCA", "Penetration Testing", "Vulnerability Assessment", "RBAC", "ABAC", "Zero Trust", "PKI", "HSM", "WAF", "DDoS", "PWA", "SPA", "SSR", "SSG", "CSR", "JAMstack", "Headless CMS", "Edge Computing", "WebAssembly", "WASM", "Service Worker", "Web Components", "Micro Frontends", "BFF", "Backend for Frontend", "tRPC", "gRPC-Web", "WebRTC", "WebGL", "WebGPU", "Material UI", "Ant Design", "Chakra UI", "React Bootstrap", "Semantic UI React", "Blueprint", "Mantine", "NextUI", "Arco Design", "Tailwind CSS", "Bootstrap", "Bulma", "Foundation", "Semantic UI", "Materialize", "Spectre.css", "Tachyons", "PureCSS", "styled-components", "CSS-in-JS", "Emotion", "JSS", "Styled System", "Stitches", "Vanilla Extract", "Linaria", "Aphrodite", "Glamorous", "Radium", "Git", "Mercurial", "SVN", "GitHub", "GitLab", "Bitbucket", "Pull Request", "Merge Request", "Code Review", "Pair Programming", "Mob Programming", "Docusaurus", "GitBook", "VitePress", "VuePress", "Docsify", "MkDocs", "Sphinx", "Jekyll", "Hugo", "Eleventy", "Hexo", "Zola", "Swagger", "OpenAPI", "Postman", "Insomnia", "Redoc", "Stoplight", "MIT", "GPL", "AGPL", "LGPL", "CC0", "FAQ", "YouTube"], "style": "Sentence case"}]`,
      );
    });

    it("enforces title case in headings and table headers when set to `'Title Case'`", async () => {
      const CASING_STYLE = 'Title Case';
      const configResult = await computeEslintConfig({
        markdownPreferences: {enforceCasing: CASING_STYLE},
      });

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toMatchObject({severity: 2, options: [{style: CASING_STYLE}]});

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toMatchObject({severity: 2, options: [{style: CASING_STYLE}]});
    });

    it('disables both heading-casing and table-header-casing rules when set to `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {enforceCasing: false},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toBe(0);

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toBe(0);
    });

    it('enforces casing only in headings when object form `{headings: ...}` is used (tableHeaders omitted = disabled)', async () => {
      const CASING_STYLE = 'Sentence case';
      const configResult = await computeEslintConfig({
        markdownPreferences: {enforceCasing: {headings: CASING_STYLE}},
      });

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toMatchObject({severity: 2, options: [{style: CASING_STYLE}]});

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toBe(0);
    });

    it('enforces casing only in table headers when object form `{tableHeaders: ...}` is used (headings omitted = disabled)', async () => {
      const CASING_STYLE = 'Title Case';
      const configResult = await computeEslintConfig({
        markdownPreferences: {enforceCasing: {tableHeaders: CASING_STYLE}},
      });

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toMatchObject({severity: 2, options: [{style: CASING_STYLE}]});

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toBe(0);
    });
  });

  describe('option: `casingEnforcementIgnorePatterns`', () => {
    it('merges array-provided patterns with default ignore patterns for heading-casing and table-header-casing rules', async () => {
      const PATTERNS = ['/myPatternApi/u' as const];
      const configResult = await computeEslintConfig({
        markdownPreferences: {casingEnforcementIgnorePatterns: [...PATTERNS]},
      });

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toMatchObject({severity: 2, options: [{ignorePatterns: expect.arrayContaining(PATTERNS)}]});

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toMatchObject({severity: 2, options: [{ignorePatterns: expect.arrayContaining(PATTERNS)}]});
    });

    it('merges object-provided patterns with default ignore patterns, excluding falsy-valued entries', async () => {
      const ADDED_PATTERN = '/myCustomPattern/u' as const;
      const REMOVED_PATTERN = '/^v\\d+/u' as const;
      const configResult = await computeEslintConfig({
        markdownPreferences: {
          casingEnforcementIgnorePatterns: {[ADDED_PATTERN]: true, [REMOVED_PATTERN]: false},
        },
      });

      const headingCasingRuleEntry = configResult.getRuleEntryParsed(
        'markdown-preferences',
        'markdown-preferences/heading-casing',
      );

      expect(headingCasingRuleEntry).toMatchObject({
        severity: 2,
        options: [{ignorePatterns: expect.arrayContaining([ADDED_PATTERN])}],
      });
      expect(headingCasingRuleEntry?.options).toMatchObject([
        {ignorePatterns: expect.not.arrayContaining([REMOVED_PATTERN])},
      ]);

      const tableHeaderCasingRuleEntry = configResult.getRuleEntryParsed(
        'markdown-preferences',
        'markdown-preferences/table-header-casing',
      );

      expect(tableHeaderCasingRuleEntry).toMatchObject({
        severity: 2,
        options: [{ignorePatterns: expect.arrayContaining([ADDED_PATTERN])}],
      });
      expect(tableHeaderCasingRuleEntry?.options).toMatchObject([
        {ignorePatterns: expect.not.arrayContaining([REMOVED_PATTERN])},
      ]);
    });
  });

  describe('option: `orderedLists`', () => {
    it('uses sequential numbering, start 1, and `n.` style by default', async () => {
      const configResult = await computeEslintConfig('markdownPreferences');

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-sequence',
        ),
      ).toMatchInlineSnapshot(`[2, {"increment": "always"}]`);

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-start',
        ),
      ).toMatchInlineSnapshot(`[2, {"start": 1}]`);

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-style',
        ),
      ).toMatchInlineSnapshot(`[2, {"prefer": "n."}]`);
    });

    it("uses `fixed` numbering when `numbering` is `'fixed'`", async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {numbering: 'fixed'}},
      });

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-sequence',
        ),
      ).toMatchInlineSnapshot(`[2, {"increment": "never"}]`);
    });

    it('disables `ordered-list-marker-sequence` rule when `numbering` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {numbering: false}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-sequence',
        ),
      ).toBe(0);
    });

    it('uses start `0` when `start` is `0`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {start: 0}},
      });

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-start',
        ),
      ).toMatchInlineSnapshot(`[2, {"start": 0}]`);
    });

    it('disables `ordered-list-marker-start` rule when `start` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {start: false}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-start',
        ),
      ).toBe(0);
    });

    it("uses `n)` style when `style` is `'n)'`", async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {style: 'n)'}},
      });

      expect(
        configResult.getRuleEntry(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-style',
        ),
      ).toMatchInlineSnapshot(`[2, {"prefer": "n)"}]`);
    });

    it('disables `ordered-list-marker-style` rule when `style` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: {style: false}},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-style',
        ),
      ).toBe(0);
    });

    it('disables all ordered-list rules when `orderedLists` is `false`', async () => {
      const configResult = await computeEslintConfig({
        markdownPreferences: {orderedLists: false},
      });

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-sequence',
        ),
      ).toBe(0);

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-start',
        ),
      ).toBe(0);

      expect(
        configResult.getRuleEntrySeverity(
          'markdown-preferences',
          'markdown-preferences/ordered-list-marker-style',
        ),
      ).toBe(0);
    });
  });

  describe('option: `wordsToPreserveCasingOf`', () => {
    it('merges array-provided words with plugin default preserve-words list', async () => {
      const WORDS = ['GitHub', 'ESLint'];
      const configResult = await computeEslintConfig({
        markdownPreferences: {wordsToPreserveCasingOf: [...WORDS]},
      });

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/heading-casing',
        ),
      ).toMatchObject({severity: 2, options: [{preserveWords: expect.arrayContaining(WORDS)}]});

      expect(
        configResult.getRuleEntryParsed(
          'markdown-preferences',
          'markdown-preferences/table-header-casing',
        ),
      ).toMatchObject({severity: 2, options: [{preserveWords: expect.arrayContaining(WORDS)}]});
    });

    it('merges object-provided words with plugin default preserve-words list, excluding falsy-valued entries', async () => {
      const ADDED_WORD = 'GitHub';
      const REMOVED_WORD = 'JavaScript';
      const configResult = await computeEslintConfig({
        markdownPreferences: {wordsToPreserveCasingOf: {[ADDED_WORD]: true, [REMOVED_WORD]: false}},
      });

      const headingCasingRuleEntry = configResult.getRuleEntryParsed(
        'markdown-preferences',
        'markdown-preferences/heading-casing',
      );

      expect(headingCasingRuleEntry).toMatchObject({
        severity: 2,
        options: [{preserveWords: expect.arrayContaining([ADDED_WORD])}],
      });
      expect(headingCasingRuleEntry?.options).toMatchObject([
        {preserveWords: expect.not.arrayContaining([REMOVED_WORD])},
      ]);

      const tableHeaderCasingRuleEntry = configResult.getRuleEntryParsed(
        'markdown-preferences',
        'markdown-preferences/table-header-casing',
      );

      expect(tableHeaderCasingRuleEntry).toMatchObject({
        severity: 2,
        options: [{preserveWords: expect.arrayContaining([ADDED_WORD])}],
      });
      expect(tableHeaderCasingRuleEntry?.options).toMatchObject([
        {preserveWords: expect.not.arrayContaining([REMOVED_WORD])},
      ]);
    });
  });
});
