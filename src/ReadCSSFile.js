import { promisify } from 'util'
import { parse } from 'postcss'

export default
async function(
	filename,
	code,
	resolveFile
) {

	const ast = parse(code)
	console.log(getDependencies(ast))

	return {
		code: code,
		// sourceMap: generatorResults.map,
		ast:  ast,
	}

}

function getDependencies(ast) {
	return ast.nodes
		.filter(isImportNode)
		.map(astNode => astNode.params)
}

function isImportNode(astNode) {
	return (
		astNode.type === 'atrule' &&
    astNode.name === 'import'
	)
}
