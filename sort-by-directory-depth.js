const combine = require('combine-arrays')

module.exports = function sortByDirectoryDepth(a, b) {
	const chunksA = a.split('/')
	const chunksB = b.split('/')
	const comparison = chunksA.length - chunksB.length

	if (comparison === 0) {
		return alphabeticCompare(a, b)
	}

	return comparison
}


// Stolen shamelessly from https://github.com/sindresorhus/alpha-sort/
const collator = new Intl.Collator()
const brokenLocaleCompare = 'a'.localeCompare('å') === -1
const alphabeticCompare = brokenLocaleCompare
	? (a, b) => a > b ? 1 : a < b ? -1 : 0
	: (a, b) => a === b ? 0 : collator.compare(a, b)
