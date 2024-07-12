import Fuse from 'fuse.js'

export const createFuse = (data: any[], options: Fuse.IFuseOptions<any>) => {
  return new Fuse(data, options)
}