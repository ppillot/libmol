module.exports = {
  lintOnSave: false,
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugins.delete('prefetch')
  },
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
    electronBuilder: {
      chainWebpackRendererProcess: config => {
        // Chain webpack config for electron renderer process only
        // The following example will set IS_ELECTRON to true in your app
        config.devtool()
      },
      disableMainProcessTypescript: false,
      builderOptions: {
        'productName': 'libmol',
        'appId': 'com.electron.libmol',
        copyright: 'Copyright © 2017-2019 Paul Pillot',
        compression: 'maximum',
        'fileAssociations': [
          {
            'ext': 'pdb',
            'description': 'Protein Data Bank file',
            'role': 'Viewer',
            'mimeType': 'chemical/x-pdb'
          }
        ],
        'files': [
          '!node_modules',
          '!icons',
          '!*.map',
          '!css/fonts',
          '!static/mol/**/*.txt'
        ],
        'dmg': {
          'contents': [
            {
              'x': 410,
              'y': 150,
              'type': 'link',
              'path': '/Applications'
            },
            {
              'x': 130,
              'y': 150,
              'type': 'file'
            }
          ]
        },
        'mac': {
          'icon': 'public/icons/icon.icns',
          'category': 'public.app-category.education',
          'target': 'dmg',
          'electronLanguages': ['fr', 'en']
        },
        'win': {
          'icon': 'public/icons/icon.ico',
          'files': [
            'public/icons/icon.ico'
          ],
          'target': [
            {
              'target': 'portable',
              'arch': [
                'ia32'
              ]
            }
          ]
        },
        'linux': {
          'icon': 'public/icons'
        }
      }
    }
  },

  publicPath: './',
  outputDir: undefined,
  assetsDir: undefined,
  runtimeCompiler: undefined,
  parallel: undefined,
  css: undefined,
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:8888/libmol3/src/api',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  }
}
