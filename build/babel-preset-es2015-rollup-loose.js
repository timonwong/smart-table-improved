var relative = require('require-relative');

var baseLocation = require.resolve('babel-preset-es2015');
var plugins = require(baseLocation).plugins.slice();

var looseablePlugins = [
  'babel-plugin-transform-es2015-template-literals',
  'babel-plugin-transform-es2015-classes',
  'babel-plugin-transform-es2015-computed-properties',
  'babel-plugin-transform-es2015-for-of',
  'babel-plugin-transform-es2015-spread',
  'babel-plugin-transform-es2015-destructuring'
];

for (var i = 0; i < looseablePlugins.length; i++) {
  var plugin = relative(looseablePlugins[i], baseLocation);
  plugins.splice(plugins.indexOf(plugin), 1, [plugin, { loose: true }]);
}

var commonjsPlugin = relative('babel-plugin-transform-es2015-modules-commonjs', baseLocation);
plugins.splice(plugins.indexOf(commonjsPlugin), 1);

plugins.push(require('babel-plugin-external-helpers-2'));

module.exports = { plugins: plugins };
