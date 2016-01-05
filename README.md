# Smart-Table-Improved

[![Build Status](https://travis-ci.org/timonwong/smart-table-improved.svg?branch=development)](https://travis-ci.org/timonwong/smart-table-improved)
[![Build Status](https://circleci.com/gh/timonwong/smart-table-improved/tree/development.svg?style=shield)](https://circleci.com/gh/timonwong/smart-table-improved/tree/development)
[![Code Climate](https://codeclimate.com/github/timonwong/smart-table-improved/badges/gpa.svg)](https://codeclimate.com/github/timonwong/smart-table-improved)
[![codecov.io](https://codecov.io/github/timonwong/smart-table-improved/coverage.svg?branch=development)](https://codecov.io/github/timonwong/smart-table-improved?branch=development)
[![bitHound Overall Score](https://www.bithound.io/github/timonwong/smart-table-improved/badges/score.svg)](https://www.bithound.io/github/timonwong/smart-table-improved)
[![devDependency Status](https://david-dm.org/timonwong/smart-table-improved/dev-status.svg?branch=development)](https://david-dm.org/timonwong/smart-table-improved#info=devDependencies)

Smart-Table-Improved is a collection of useful widgets for the great [Smart-Table] component.

## Requirements

- AngularJs
- [Smart-Table]
- Modern browsers (IE>=9 is required)

## Installation

### Install with NPM

```
$ npm install angular-smart-table-improved
```

### Manual download

Besides npm package, UMD module is placed under `dist/` directory:

- dist/smart-table-improved.js
- dist/smart-table-improved.min.js

Please note that thoses files on the `development` branch may not be updated, you may have to use the ones on the `master` branch or tags.

## Usage

First you need to include the module in your project:

```javascript
angular.module('yourApp', ['smart-table-improved']);
```

If you're a Browserify or Webpack user (which is recommended), please don't forget to require the module:

```javascript
require('angular-smart-table-improved');

angular.module('yourApp', ['smart-table-improved']);
```

## Credits

- Build and release script from [Vue.js];
- [dirPagination] from [angularUtils];
- Table directives from [horizon];

[Smart-Table]: http://lorenzofox3.github.io/smart-table-website
[angularUtils]: https://github.com/michaelbromley/angularUtils
[dirPagination]: https://github.com/michaelbromley/angularUtils/tree/master/src/directives/pagination
[Vue.js]: https://github.com/vuejs/vue
[horizon]: https://github.com/openstack/horizon
