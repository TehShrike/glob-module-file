#!/usr/bin/env node

const argv = require(`minimist`)(process.argv.slice(2))

const globModuleFile = require(`./index`)

const codePromise = globModuleFile(argv, argv)

if (!argv.outputPath) {
	codePromise.then(code => {
		console.log(code)
	})
}

