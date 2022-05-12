const glob = require('fast-glob').sync
const packageDirs = glob('./packages/*', { onlyDirectories: true })

module.exports = {
  apps : packageDirs.map(packageDir => ({
    name: packageDir.replace('./packages/', 'hsjm-'),
    cwd: packageDir,
    script: 'pnpm dev',
  }))
}
