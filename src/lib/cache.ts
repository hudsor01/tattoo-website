export const cache = {
  get: (cacheKey: string) => Promise.resolve(null),
  set: () => Promise.resolve(null),
  delete: () => Promise.resolve(null),
  clear: () => Promise.resolve(null),
};