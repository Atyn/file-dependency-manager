import Recast from 'recast'
import { transformAst } from './CodeTransformation'

export default
class JsOutputBundler {

	constructor(onUpdate) {
		this.textMap = {}
		this.order = {}
		this.srcCode = {}
		this.dependencies = {}
		this.astMap = {}
	}

	generateOutput() {
		const order = solveDependencies(this.dependencies)
		// Get order this.textMap[name]
		return order.map(name => this.textMap[name]).join('\n')
	}

	generateJsText({
		name,
		ast,
		dependencies,
	}) {
		return [
			'// ' + name + '\n',
			Recast.print(transformAst({
				ast,
				name,
				dependencies: dependencies,
			})).code,
		].join('')
	}

	addInformation({
		name,
		type,
		dependencies,
		ast,
		srcCode,
	}) {
		if (dependencies) {
			this.dependencies[name] = dependencies
		}
		if (srcCode) {
			this.srcCode[name] = srcCode
		}
		if (ast) {
			this.astMap[name] = ast
		}
		// When we have all we need -> create text
		if (this.dependencies[name] && this.astMap[name]) {
			this.textMap[name] = this.generateJsText({
				name:         name,
				ast:          this.astMap[name],
				dependencies: this.dependencies[name],
			})
		}
	}

}

function isNotImportDeclaration(obj) {
	return obj.type !== 'ImportDeclaration'
}

function ImportDeclarationFileName(obj) {
	return obj.source.value
}

function solveDependencies(map) {
	const temp = Object.keys(map)
		.map(key => [key, ...map[key]])
	const list = [].concat.apply([], temp)
	return removeCopies(list.reverse())
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index
}

function removeCopies(array) {
	return array.filter(onlyUnique)
}
