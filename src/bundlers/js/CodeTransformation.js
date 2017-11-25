import Recast from 'recast'
const Types = Recast.types
const nameTypes = Types.namedTypes
const Builder = Types.builders

export
function transformAst({
	ast,
	name,
	dependencies = [],
}) {

	const prefix = getPrefix(name)

	// Remove all exports
	Recast.visit(ast, {
		visitExportNamedDeclaration(path) {
			path.replace(path.value.declaration)
			return false
		},
	})

	function getRemoteName(specifier, importDeclaration) {
		const list = ast.program.body
			.filter(node => node.type === 'ImportDeclaration')
		const obj = list.find(node =>
			node.source.value ===
			importDeclaration.source.value
		)
		const index = list.indexOf(obj)
		const rawName = dependencies[index]
		if (!rawName) {
			return 'NOT_READY'
		}
		return String(getPrefix(rawName)) + specifier.imported.name
	}

	// Rewrite import statement
	Recast.visit(ast, {
		visitImportDeclaration(path) {
			if (!path.value.specifiers) {
				path.prune()
				return false
			}
			if (path.value.specifiers.length === 0) {
				path.prune()
				return false
			}
			const newNode = Builder.variableDeclaration('const',
				path.value.specifiers.map((specifier, index) =>
					Builder.variableDeclarator(
						specifier.local,
						Builder.identifier(
							getRemoteName(specifier, path.value)
						)
					))
			)
			path.replace(newNode)
			return false
		},
	})

	// Prefix declarations in root of the file
	const identifiers = [
		...[].concat(
			...ast.program.body
				.filter(node => node.type === 'VariableDeclaration')
				.map(node => node.declarations.map(declaration => declaration.id))
		),
		...ast.program.body
			.filter(node => node.type === 'FunctionDeclaration')
			.map(node => node.id),
	]

	// Show how names identifier names will be changed
	const identifierTranslation = {}
	identifiers.forEach(obj => {
		identifierTranslation[obj.name] = prefix + obj.name
	})

	// Change names of all imported identifiers
	Recast.visit(ast, {
		visitIdentifier(path) {
			const translation = identifierTranslation[path.value.name]
			if (translation) {
				path.replace(Builder.identifier(translation))
			}
			return false
		},

	})

	/*
	// Prefix all declarations in body
	Recast.visit(ast, {
		visitVariableDeclarator(path) {
			path.replace(
				Builder.variableDeclaration(path.value.kind, path.value.declarations.map(declaration =>

					Builder.variableDeclarator(

					)
				))
			)
			return false
		},
		visitFunctionDeclaration(path) {
			if (path.parentPath == ast.program.body) {
				console.log('in parent!', path)
			}
			// console.log('path', path)
			return false
		},
	})
	*/

	return ast

}

function getPrefix(name) {
	return name
		.replace(/\//g, '_')
		.replace(/\./g, '_')
		.replace(/-/g, '_') + '_'
}
