#!/usr/bin/env node

const globModuleFile = require('./index')

const pattern = process.argv[2]
const format = process.argv[3]

globModuleFile({ pattern, format }).then(code => {
	console.log(code)
})
