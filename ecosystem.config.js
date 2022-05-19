const glob = require('fast-glob').sync
const packageDirs = glob('./packages/*', { onlyDirectories: true })

module.exports = {
  apps : [
    
    // --- Compile source.
    ...packageDirs.map(packageDir => ({
      name: packageDir.replace('./packages/', 'hsjm-'),
      cwd: packageDir,
      script: 'pnpm dev',
    })),

    // Compile Vitepress.
    {
      name: 'hsjm-docs',
      cwd: 'docs',
      script: 'pnpm dev'
    },

    // Nuxt playground.
    {
      name: 'hsjm-playground',
      cwd: 'playground',
      script: 'pnpm dev'
    }
  ]
}
