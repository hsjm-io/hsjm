const { renameSync, readdirSync, } = require('fs')
const { resolve: _resolve } = require('path')
const { kebabCase } = require('lodash')
const { argv, cwd } = require('process')



const resolve = path => _resolve(cwd(), path)

let files = readdirSync(resolve(argv[2]))
    .filter(fname => fname.endsWith('.svg'))
    .map(from => ({from, to: from.split(',').map(kebabCase).slice(0, 3).join('-') + '.svg'}))
    .map(({ from, to }) => ({
        from: resolve(from),
        to: resolve(to)
    }))
    .forEach(({ from, to }) => renameSync(from, to))

console.log(files)