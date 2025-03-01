// tsconfig.json dosyasını merkezi alias yapılandırmasını kullanacak şekilde güncelleyen script
const fs = require('fs');
const { createTsPaths } = require('./alias.config');

// tsconfig.json dosyasını oku
const tsconfig = JSON.parse(fs.readFileSync('./tsconfig.json', 'utf8'));

// Paths'i güncelle
tsconfig.compilerOptions.paths = createTsPaths();

// Dosyayı geri yaz
fs.writeFileSync('./tsconfig.json', JSON.stringify(tsconfig, null, 2)); 