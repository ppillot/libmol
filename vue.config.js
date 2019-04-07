module.exports = {
  lintOnSave: false,

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    },
    electronBuilder: {
      builderOptions: {
        'productName': 'libmol',
        'appId': 'com.electron.libmol',
        copyright: 'Copyright © 2017-2019 Paul Pillot',
        homepage: 'https://libmol.org',
        repository: {
          type: 'git',
          url: 'https:github.com/ppillot/libmol.git'
        },
        'directories': {
          'output': 'build'
        },
        'files': [
          'dist/electron/**/*'
        ],
        'fileAssociations': [
          {
            'ext': 'pdb',
            'description': 'Protein Data Bank file',
            'role': 'Viewer',
            'mimeType': 'chemical/x-pdb'
          }
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
          'icon': 'build/icons/icon.icns',
          'category': 'public.app-category.education'
        },
        'win': {
          'icon': 'build/icons/icon.ico',
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
          'icon': 'build/icons'
        }
      }
    }
  }
}
