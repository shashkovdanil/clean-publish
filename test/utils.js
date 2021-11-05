import { join } from 'path'
import crossSpawn from 'cross-spawn'
import fse from 'fs-extra'

export function spawn(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    const child = crossSpawn(cmd, args, {
      ...opts,
      stdio: 'pipe'
    })
    let output = ''
    const onData = data => {
      output += data.toString()
    }
    const onDone = error => {
      if (error) {
        reject(error instanceof Error ? error : new Error(output))
      } else {
        resolve(output)
      }
    }

    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('close', onDone)
    child.on('exit', onDone)
    child.on('error', onDone)
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
