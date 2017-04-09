var fs = require("fs"),
    
    writeHelpJson = function (locale, json) {
        var buffer = JSON.stringify(json);
        
        fs.writeFile(path + locale + '/help.' + locale + '.json',
            buffer,
            function (err, data) {
                if (err) throw err;
                console.log(locale + ' written');
        });
    },
    locales = ["en", "fr"],
    path = "./src/locales/"
    
locales.forEach(function (locale) {
    fs.readdir(path + locale, function (err, files) {
        if (err) return console.error(err);
        //
        let helpJson = {}
        files.forEach(function (file) {
            //
            if (file.indexOf('.md')===-1) return;
            const fileName = file.substr(file.indexOf('.'))
            const pathFile = path + locale + "/" + file;
            const content = fs.readFileSync(pathFile, 'utf8');

            helpJson[file] = content;
        });
        writeHelpJson(locale, helpJson);
    });

});