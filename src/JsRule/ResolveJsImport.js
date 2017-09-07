import path from 'path'

export default
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
