#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))

const globModuleFile = require('./index')

globModuleFile(argv, argv).then(code => {
	console.log(code)
})
