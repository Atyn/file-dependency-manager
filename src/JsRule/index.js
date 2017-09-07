import path from 'path'
import { parse } from 'babylon'
import { transform } from 'babel-core'
import resolveJsImport from './ResolveJsImport'

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

function isImportDeclaration(obj) {
	return obj.type === 'ImportDeclaration'
}

function ImportDeclarationFileName(obj) {
	return obj.source.value
}
