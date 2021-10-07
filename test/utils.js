import { join } from 'path'
import crossSpawn from 'cross-spawn'
import fse from 'fs-extra'

export function spawn(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    crossSpawn(cmd, args, {
      stdio: 'inherit',
      ...opts
    }).on('close', resolve).on('error', reject)
  })
}

export async function findTmpDirs(dir) {
  const files = await fse.readdir(dir)
  const tmpDirPaths = files.reduce((paths, file) => {
    if (!file.includes('tmp')) {
      return paths
    }

    paths.push(join(dir, file))
    return paths
  }, [])

  return tmpDirPaths
}

export async function findTmpDir(dir) {
  return (await findTmpDirs(dir))[0]
}

export async function removeTmpDirs(dir) {
  const tmpDirPaths = await findTmpDirs(dir)
  await Promise.all(tmpDirPaths.map(tmpDirPath => fse.remove(tmpDirPath)))
}
