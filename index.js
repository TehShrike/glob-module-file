const denodeify = require('then-denodeify')
const writeFile = denodeify(require('fs').writeFile)
const glob = denodeify(require('glob'))
const toIdentifier = require('to-js-identifier')
const combine = require('combine-arrays')

const sortByDirectoryDepth = require('./sort-by-directory-depth')

module.exports = function globModuleFile({
	format = 'cjs',
	sortFunction = sortByDirectoryDepth,
	pathPrefix = './',
	pattern,
	outputPath
}, globOptions) {
	if (!formats.hasOwnProperty(format)) {
		throw new Error(`Invalid format ${format}`)
	}

	const outputFormat = formats[format]

	return glob(pattern, globOptions).then(files => {
		const sortedFiles = files.sort(sortFunction)
		const fileNamesAndIdentifiers = combine({
			file: sortedFiles,
			identifier: sortedFiles.map(toIdentifier)
		})

		const code = outputFormat(fileNamesAndIdentifiers, pathPrefix)

		if (outputPath) {
			return writeFile(outputPath, code).then(() => code)
		} else {
			return code
		}
	})
}

const formats = {
	cjs(fileNamesAndIdentifiers, pathPrefix) {
		const outputLines = fileNamesAndIdentifiers.map(({ file, identifier }) => {
			return {
				requireLine: `const ${identifier} = require('${pathPrefix}${file}')`,
				exportLine: `\t${identifier}`
			}
		})

		const requires = outputLines.map(({ requireLine }) => requireLine).join('\n')
		const exported = outputLines.map(({ exportLine }) => exportLine).join(',\n')

		return `${requires}

module.exports = [
${exported}
]
`
	},
	es(fileNamesAndIdentifiers, pathPrefix) {
		const outputLines = fileNamesAndIdentifiers.map(({ file, identifier }) => {
			return {
				requireLine: `import ${identifier} from '${pathPrefix}${file}'`,
				exportLine: `\t${identifier}`
			}
		})

		const requires = outputLines.map(({ requireLine }) => requireLine).join('\n')
		const exported = outputLines.map(({ exportLine }) => exportLine).join(',\n')

		return `${requires}

export default [
${exported}
]
`
	}
}
