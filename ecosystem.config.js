const glob = require('fast-glob').sync
const packageDirs = glob('./packages/*', { onlyDirectories: true })

module.exports = {
  apps : packageDirs.map(x => ({
    name: x.replace('./packages/', 'hsjm-'),
    script: `pnpm -C ${x} dev`
  }))
}
