# glob-module-file

Pass in a file pattern and an output path, and a file will be created that imports all the matching files, and then exports them as a single array.

## Why would you need this?

It's really nice to be able to auto-initialize a whole bunch of parts of your application, without having to maintain a list of modules to require in your index.js:

```node
// Maintaining this is inconvenient
const coolService = require('./service/cool/the-coolest.js')
const niftyService = require('./service/nifty/nearly-as-cool.js')
const yetAnotherService = require('./service/hope-you-didnt-forget-any-other-files.js')

coolService(initialConfig)
niftyService(initialConfig)
yetAnotherService(initialConfig)
```

To avoid dealing with such ever-growing lists of modules, I've used this pattern in node.js code:

```node
glob.sync('service/**/*.js', { ignore: 'service/**/*.test.js' })
.map(file => require(`./${file}`))
.forEach(moduleFunction => {
	moduleFunction(initialConfig)
})
```

It finds all the js files in a part of the application's directory tree, `require`s them, and then runs them as a function passing in some initial options.

### However

The above code doesn't work for client-side apps built with a bundler.

Bundlers must be able to tell which files will be loaded by reading the code, without executing it.

So, you're back to maintaining a long list imports/requires somewhere.  Unless you use this library.

## What does it do?

Given these files:

```
fixtures/one.js
fixtures/someDirectory/two.js
```

Calling this library and passing in `fixtures/**/*.js` and `my-globbed-files.js` will cause it to spit out a file containing:

```node
const fixtures$47$one$46$js = require('./fixtures/one.js')
const fixtures$47$someDirectory$47$two$46$js = require('./fixtures/someDirectory/two.js')

module.exports = [
	fixtures$47$one$46$js,
	fixtures$47$someDirectory$47$two$46$js,
]
```

or, for es6 module bundlers:

```node
import fixtures$47$one$46$js from './fixtures/one.js'
import fixtures$47$someDirectory$47$two$46$js from './fixtures/someDirectory/two.js'

export default [
	fixtures$47$one$46$js,
	fixtures$47$someDirectory$47$two$46$js,
]
```

Then, all your index file needs to do is

```node
require('my-globbed-files.js').forEach(moduleFunction => {
	moduleFunction(initialConfig)
})
```

## API

### `globModuleFile(options, [globOptions])`

Returns a promise that resolves to the JS code with all the requires/imports and exports.

If an `outputPath` is provided, the promise will not resolve until after the file is done being written.

#### `options`

- `pattern`: *(required)*: Passed to [glob](https://www.npmjs.com/package/glob).
- `outputPath`: A file to be created or overwritten with all of the import code.
- `exportWithPath`:  If false, exports whatever value was imported from the original file.  If true, exports an object `{ path: thePathStringThatWasImported, export: theObjectExportedFromTheGlobbedFile }`.  Defaults to `false`.
- `format`: Specify the module output - either the string `es` (import/export) or `cjs` (require/module.exports).  Defaults to `cjs`
- `sortFunction`: A comparison function to be passed to [`Array.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) to determine the order to import the files in (and determine their order in the output array).  Defaults to a function that orders by how deep in the directory structure the file is (shallowest to deepest).
- `pathPrefix`: A string to be prepended to the paths passed to `require`.  Defaults to `./`
- `importStar`: whether to use `import * as whateverExport` instead of `import defaultExport` when outputting ES module syntax.  Defaults to `false`

#### `globOptions`

Optional.  Passed straight through as the options argument to [`glob`](https://www.npmjs.com/package/glob#options).

## Example

<!--js
const globModuleFiles = require('./')
-->

```js
const expected = `const fixtures$47$one$46$js = require('./fixtures/one.js')
const fixtures$47$someDirectory$47$two$46$js = require('./fixtures/someDirectory/two.js')

module.exports = [
\tfixtures$47$one$46$js,
\tfixtures$47$someDirectory$47$two$46$js,
]
`

globModuleFiles({ pattern: 'fixtures/**/*.js', outputPath: '/tmp/globbed.js' }).then(code => {
	code // => expected

	require('fs').readFileSync('/tmp/globbed.js', { encoding: 'utf8' }) // => code
}).catch(err => {
	console.error(err)
})
```

## CLI

```sh
glob-module-file --pattern="fixtures/**/*.js" --format=es --ignore="**/one.js"
```

Takes any number of named arguments corresponding to the options objects above.

Spits the code to stdout so you can pipe it into a file or what have you.

## License

[WTFPL](http://wtfpl2.com)
