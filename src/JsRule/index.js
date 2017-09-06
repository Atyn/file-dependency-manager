import path from 'path'
import { parse } from 'babylon'
import { transform } from 'babel-core'

const babylonSettings = {
	sourceType: 'module',
}

export default {

	test:         /\.js$/,
	transformers: {
	// What should source produce?
		source: {
			ast: code => new Promise(resolve => {
				resolve(parse(code.toString(), babylonSettings))
			}),
		},
	// What should ast produce?
		ast: {
			dependencies: (ast, filename, rule) => new Promise(resolve => {
				resolve(
					ast.program.body
						.filter(isImportDeclaration)
						.map(ImportDeclarationFileName)
						.map(name => resolveJsImport(filename, name, rule))
			)
			}),
		},
	},
	
}

function resolveJsImport(fileImporting, importName, rule) {

	// Relative to importing file or node_modules?
	const dirname =
		/^\.\//.test(importName) ?
			path.dirname(fileImporting) :
			process.cwd() + '/node_modules'

	// Clean file format
	const basename = importName
		.replace(/^\.\//, '')	// remove ./ in the beginning of path
		.replace(rule.test, '') // Remove .js

	const extname =	path.extname(basename) || '.js'

	// Add /index.js fallback
	return dirname + '/' + basename + extname

}

function isImportDeclaration(obj) {
	return obj.type === 'ImportDeclaration'
}

function ImportDeclarationFileName(obj) {
	return obj.source.value
}
