import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export const examples = {
  rust: readFileSync(resolve(__dirname, './rust.txt')).toString(),
  javascript: readFileSync(resolve(__dirname, './javascript.txt')).toString(),
  typescript: readFileSync(resolve(__dirname, './typescript.txt')).toString(),
}
