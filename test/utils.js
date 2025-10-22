import { x } from 'tinyexec'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'

export async function spawn(cmd, args, opts) {
  try {
    const { stdout, stderr } = await x(cmd, args, { nodeOptions: opts })
    if (stderr) throw new Error(stderr)
    return stdout;
  } catch (err) {
    throw (err instanceof Error ? err : new Error(err))
  }
}

export async function findTmpDirs(dir) {
  const files = await fs.readdir(dir)
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
  await Promise.all(
    tmpDirPaths.map(tmpDirPath => {
      return fs.rm(tmpDirPath, { force: true, recursive: true })
    })
  )
}
