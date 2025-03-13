// Tüm alias tanımlarını burada merkezi olarak yönetiyoruz
const path = require('path');

// Proje kök dizini
const rootDir = __dirname;

// Alias tanımları
const aliases = {
  '@': './',
  '~': './src',
  '@components': './components',
  '@screens': './app',
  '@utils': './utils',
  '@api': './api',
  '@store': './store',
  '@types': './types',
  '@assets': './assets',
  '@hooks': './hooks',
  '@constants': './constants'
};

// Metro için path.resolve ile tam yolları oluştur
const createExtraNodeModules = () => {
  const extraNodeModules = {};
  Object.entries(aliases).forEach(([alias, relativePath]) => {
    extraNodeModules[alias] = path.resolve(rootDir, relativePath.replace('./', ''));
  });
  return extraNodeModules;
};

// TypeScript için paths oluştur
const createTsPaths = () => {
  const tsPaths = {};
  Object.entries(aliases).forEach(([alias, relativePath]) => {
    tsPaths[`${alias}/*`] = [`${relativePath}/*`];
  });
  return tsPaths;
};

// Babel için alias oluştur
const createBabelAliases = () => {
  const babelAliases = {};
  Object.entries(aliases).forEach(([alias, relativePath]) => {
    babelAliases[alias] = relativePath;
  });
  return babelAliases;
};

module.exports = {
  aliases,
  createExtraNodeModules,
  createTsPaths,
  createBabelAliases,
}; 