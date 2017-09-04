import { parse } from 'babylon'
import { transform } from 'babel-core'
import mkdirp from 'mkdirp'
import path from 'path'
import { solveDependencies, watch } from './DependencySolver'

import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { watchFile, unwatchFile } = fs

// const { code, map, ast } = babel.transformFromAst(ast, code, options);

const babylonSettings = {
	sourceType: 'module',
}

const config = {
	input:           process.cwd() + '/example/test.js',
	getResource:     (name) => readFile(name),
	writeResource:   writeFile,
	onError:         (error) => console.error(error),
	watchResource:   (name, listener) => watchFile(name, listener),
	unWatchResource: (name, listener) => unwatchFile(name, listener),
	onTreeUpdate:    (map) => {
		writeFile('./tmp/report.json', JSON.stringify(map, null, 2))
	},
	// Source and dependencies are watched by system
	rules: [{
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
	}],
}

solveDependencies(config)

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

/*
Every node gets a notification of what dependency that have been updated
Two types of event

AST has changed
Dependency has changed
*/
