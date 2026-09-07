declare global {
  const defineEventHandler: typeof import('h3').defineEventHandler
  const useMyServerUtil: typeof import('../../server/utils/use-my-server-util').useMyServerUtil
}
