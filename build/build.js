var fs = require('fs');
var glob = require('glob');
var uglify = require('uglify-js');
var rollup = require('rollup');
var babel = require('rollup-plugin-babel');
var replace = require('rollup-plugin-replace');
var templatecache = require('ng-templatecache');
var version = process.env.VERSION || require('../package.json').version;

// Generate banner for current build
var banner =
  '/*\n' +
  ' * angular-smart-table-improved v' + version + '\n' +
  ' * https://github.com/timonwong/smart-table-improved\n' +
  ' *\n' +
  ' * (c) ' + new Date().getFullYear() + ' Timon Wong\n' +
  ' * License: MIT\n' +
  ' */';

var babelOptions = {
  presets: [ 'es2015-rollup' ],
  plugins: [ 'transform-runtime' ]
};

function main() {
  writeTemplates()
    .then(buildCJS())
    .then(buildUmdDev)
    .then(buildUmdProd)
    .catch(logError);
}

// Compile angular html templates into javascript files
function writeTemplates() {
  return new Promise(function (resolve, reject) {
    glob('template/**/*.html', function (err, files) {
      if (err) {
        reject(err);
        return;
      }

      try {
        var cacheEntries = files.map(function (file) {
          var content = fs.readFileSync(file, 'utf-8');
          return {
            content: content,
            path: 'sti/' + file
          };
        });
        var code = templatecache({
          entries: cacheEntries,
          module: ['smart-table-improved.templates']
        });
        code = `var angular = require('angular');\n${code}`;
      } catch (error) {
        reject(error);
        return;
      }

      write('src/sti-templates.js', code)
        .then(resolve)
        .catch(reject);
    });
  });
}

// CommonJS build, used by webpack, browserify, etc.
function buildCJS() {
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      babel(babelOptions)
    ]
  }).then(function (bundle) {
    return write('dist/smart-table-improved.cjs.js', bundle.generate({
      format: 'cjs',
      banner: banner
    }).code);
  });
}

// Standalone development build
function buildUmdDev() {
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'development'"
      }),
      babel(babelOptions)
    ]
  }).then(function (bundle) {
    return write('dist/smart-table-improved.js', bundle.generate({
      format: 'umd',
      banner: banner
    }).code);
  });
}

function buildUmdProd() {
  // Standalone production build
  return rollup.rollup({
    entry: 'src/index.js',
    plugins: [
      replace({
        'process.env.NODE_ENV': "'production'"
      }),
      babel(babelOptions)
    ]
  }).then(function (bundle) {
    var code = bundle.generate({
      format: 'umd'
    }).code;
    var minified = banner + '\n' + uglify.minify(code, {
      fromString: true,
      compress: true
    }).code;
    return write('dist/smart-table-improved.min.js', minified);
  });
}

function write(dest, code) {
  return new Promise(function (resolve, reject) {
    fs.writeFile(dest, code, function (err) {
      if (err) {
        return reject(err);
      }
      console.log(blue(dest) + ' ' + getSize(code));
      resolve();
    });
  });
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb';
}

function logError(e) {
  console.log(e);
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}

main();
