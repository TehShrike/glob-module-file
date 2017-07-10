const fs = require('fs')

const test = require('ava')
const globModuleFile = require('./')
const tempfile = require('tempfile')
const denodeify = require('then-denodeify')

const readFile = denodeify(fs.readFile)

const defaultExpectedCjsCode = `const fixtures$47$one$46$js = require('./fixtures/one.js')
const fixtures$47$someDirectory$47$two$46$js = require('./fixtures/someDirectory/two.js')

module.exports = [
	fixtures$47$one$46$js,
	fixtures$47$someDirectory$47$two$46$js
]
`

test(`Correct code based on a glob pattern (implicit cjs)`, t => {
	return globModuleFile({ pattern: 'fixtures/**/*.js' }).then(code => {
		t.is(code, defaultExpectedCjsCode)
	})
})

test(`ES import/export output`, t => {
	return globModuleFile({ pattern: 'fixtures/**/*.js', format: 'es' }).then(code => {
		t.is(code, `import fixtures$47$one$46$js from './fixtures/one.js'
import fixtures$47$someDirectory$47$two$46$js from './fixtures/someDirectory/two.js'

export default [
	fixtures$47$one$46$js,
	fixtures$47$someDirectory$47$two$46$js
]
`)
	})
})

test(`Passing in glob options + explicit cjs format`, t => {
	return globModuleFile({ pattern: '**/*.js', format: 'cjs' }, { cwd: 'fixtures' }).then(code => {
		t.is(code, `const one$46$js = require('./one.js')
const someDirectory$47$two$46$js = require('./someDirectory/two.js')

module.exports = [
	one$46$js,
	someDirectory$47$two$46$js
]
`)
	})
})

test(`Output to a file`, t => {
	const tmp = tempfile()
	return globModuleFile({ pattern: 'fixtures/**/*.js', outputPath: tmp }).then(code => {
		t.is(code, defaultExpectedCjsCode)

		return readFile(tmp, { encoding: 'utf8' }).then(contents => {
			t.is(contents, defaultExpectedCjsCode)
		})
	})
})

test(`Custom sort function`, t => {
	function descendingDepth(a, b) {
		const chunksA = a.split('/')
		const chunksB = b.split('/')

		return chunksB.length - chunksA.length
	}

	return globModuleFile({ pattern: 'fixtures/**/*.js', sortFunction: descendingDepth }).then(code => {
		t.is(code, `const fixtures$47$someDirectory$47$two$46$js = require('./fixtures/someDirectory/two.js')
const fixtures$47$one$46$js = require('./fixtures/one.js')

module.exports = [
	fixtures$47$someDirectory$47$two$46$js,
	fixtures$47$one$46$js
]
`)
	})
})

test(`Custom path prefix`, t => {
	return globModuleFile({ pattern: '**/*.js', pathPrefix: '/wat/' }, { cwd: 'fixtures' }).then(code => {
		t.is(code, `const one$46$js = require('/wat/one.js')
const someDirectory$47$two$46$js = require('/wat/someDirectory/two.js')

module.exports = [
	one$46$js,
	someDirectory$47$two$46$js
]
`)
	})
})

test(`Node can actually import the CommonJS output`, t => {
	const tmp = tempfile()
	return globModuleFile({
		pattern: 'fixtures/**/*.js',
		outputPath: tmp,
		pathPrefix: process.cwd() + '/'
	}).then(code => {

		const moduleArray = require(tmp)

		t.is(moduleArray[0], 1)
		t.is(moduleArray[1], 2)
	})
})

test(`Pattern array from CLI multiple --pattern entries`, t => {
	return globModuleFile({ pattern: [ 'fixtures/*.js', 'fixtures/someDirectory/*.js' ] }).then(code => {
		t.is(code, defaultExpectedCjsCode)
	})
})
