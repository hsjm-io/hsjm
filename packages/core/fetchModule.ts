import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { TransformOptions, transformSync } from 'esbuild'
import { tmpdir } from 'node:os'
import { FetchOptions, fetch } from './fetch'
import { hash } from './hash'

const cache: Record<string, any> = {}

export const fetchResolve = async<T extends string>(url: string, options?: FetchOptions) => {
  // --- Return cached data.
  if (url in cache) return { url, data: cache[url] }

  // --- Check if import is of kind `src/dir` or `src/file`
  const isBareImport = /\/[^./]+$/.test(url)
  // const isTsFileImport = /\/[^./]+\.ts$/.test(url)

  // --- Push urls to test.
  const urlsToTest = [url]
  if (isBareImport) {
    urlsToTest.push(
      url.replace(/\/[^./]+$/, '$&/index.ts'),
      url.replace(/\/[^./]+$/, '$&.ts'),
      url.replace(/\/[^./]+$/, '$&/index.js'),
      url.replace(/\/[^./]+$/, '$&.js'),
    )
  }

  const results = await Promise.all(urlsToTest
    .map(async(url) => {
      const data = await fetch<T>(url, options)
      return { url, data }
    }))

  const resolved = results.find(x => x.data !== '404: Not Found') ?? results[0]
  for (const result of results) cache[result.url] = resolved?.data
  return resolved
}

export const fetchModuleDeepManifest = async(url: string, options?: FetchOptions) => {
  const dependencies: Record<string, { code: string; fileUrl: string; fileName: string }> = {}

  async function _fetchDeep(url: string) {
    const resolved = await fetchResolve(url, options)
    let code = resolved.data ?? ''
    const fileExtension = resolved.url.match(/.*\.([^/]*)$/)?.[1] ?? 'ts'
    const matches = [...code.matchAll(/(?:import|export)\s+(.*)\s+from\s+["'`](\.{1,3}.*)(\..*)?["'`].*/g)]

    // --- Generate a dependency manifest and transform code.
    const imports = matches.map((match) => {
      const importExtension = match[2].split('/').pop()?.split('.').slice(1).pop() ?? fileExtension
      const importUrl = join(resolved.url, '..', match[2]).replace(/(\w*):\/(\w*)/, '$1://$2')
      const importPath = `./${hash(importUrl, 'cybr53')}${importExtension === 'ts' ? '' : `.${importExtension}`}`
      const from = match[0]
      const to = match[0].replace(match[2], `${importPath}`)
      code = code.replace(from, to)
      return { importUrl, importExtension, importPath, from, to }
    })

    // --- Push this manifest to dependencies register.
    dependencies[url] = {
      code,
      fileUrl: resolved.url,
      fileName: `./${hash(url, 'cybr53')}.${fileExtension}`,
    }

    // --- Recursively resolve imports.
    for (const _import of imports) {
      if (!dependencies[_import.importUrl])
        await _fetchDeep(_import.importUrl)
    }
    return dependencies
  }

  return Object.entries(await _fetchDeep(url))
    .map(x => x[1])
    .filter(x => x.code !== '404: Not Found')
}

export const fetchModule = async<T>(url: string, options?: FetchOptions & TransformOptions) => {
  // --- Generated ID from hash.
  const id = hash(url, 'cybr53')
  const pathRoot = join(tmpdir(), id)
  const pathIndex = join(pathRoot, 'index.js')
  let module: any = {}

  if (!existsSync(pathRoot)) {
    mkdirSync(pathRoot)

    // --- Download remote file's content.
    const manifest = await fetchModuleDeepManifest(url, options)

    // --- Write files to temporary folder.
    const entries = manifest.map(entry => ({
      code: entry.code,
      path: join(pathRoot, entry.fileName),
    }))

    for (const { code, path } of entries) writeFileSync(path, code)

    // --- Transform the script using ESBuild
    const fileExtension = (entries[0].path.match(/.*\.([^/]*)$/)?.[1] ?? 'ts') as TransformOptions['loader']
    const { code } = transformSync(entries[0].code, { ...options, sourceRoot: pathRoot, loader: fileExtension })

    // --- Write script to a file, import it, and delete it right away.
    writeFileSync(pathIndex, code)
  }

  module = await import(pathIndex)
    .catch(console.error)
    .finally(() => rmSync(pathRoot, { recursive: true }))

  // --- Return the imported module
  return (module?.default?.default ?? module?.default ?? module) as T
}
