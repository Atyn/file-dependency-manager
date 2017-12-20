import path from 'path'
import { parse } from 'babylon'
import { transform } from 'babel-core'
import Recast from 'recast'

const parserOptions = {
	sourceType:                  'module',
	allowImportExportEverywhere: false,
	plugins:                     [
		// enable jsx and flow syntax
		'jsx',
		'flow',
	],
}

export default
class JsInterpreter {

	static test(filename) {
		return /\.(js|jsx)$/.test(filename)
	}

	static async getDependencies(ast, filename, rule) {
		return ast.program.body
			.filter(isImportDeclaration)
			.map(ImportDeclarationFileName)
	}

	static async getAst(code) {
		const ast = parse(code, parserOptions)
		// return Recast.parse(code.toString())
	}

}

function isImportDeclaration(obj) {
	return obj.type === 'ImportDeclaration'
}

function ImportDeclarationFileName(obj) {
	return obj.source.value
}
