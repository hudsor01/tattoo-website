export const cache = {
  get: (key: string) => Promise.resolve(null),
  set: (key: string, value: any, ttl?: number) => Promise.resolve(null),
  delete: (key: string) => Promise.resolve(null),
  clear: () => Promise.resolve(null),
};