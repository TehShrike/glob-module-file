const test = require('ava')

const defaultSort = require('./sort-by-directory-depth')

test(`slashes go at the bottom`, t => {
	const actual = [ 'a/b/c', 'b/c', 'c', 'd/f/g/h' ].sort(defaultSort)

	t.deepEqual(actual, [ 'c', 'b/c', 'a/b/c', 'd/f/g/h' ])
})

test(`also alphabetical`, t => {
	const actual = [ 'a/z/x', 'a/b', 'a', 'a/bb/c/d', 'z', 'a/a', 'a/ba/c/d' ].sort(defaultSort)

	t.deepEqual(actual, [ 'a', 'z', 'a/a', 'a/b', 'a/z/x', 'a/ba/c/d', 'a/bb/c/d' ])
})
