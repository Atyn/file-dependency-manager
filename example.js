import mkdirp from 'mkdirp'
import { solveDependencies, watch } from './src/DependencySolver'
import JSRule from './src/JsRule'

import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { watchFile, unwatchFile } = fs

const config = {
	input:           process.cwd() + '/example/main.js',
	getResource:     (name) => readFile(name).catch(console.error),
	writeResource:   writeFile,
	onError:         (error) => console.error(error),
	watchResource:   (name, listener) => watchFile(name, listener),
	unWatchResource: (name, listener) => unwatchFile(name, listener),
	onTreeUpdate:    (dependencies, dependingOn) => {
		writeFile('./tmp/dependencies.json', JSON.stringify(dependencies, null, '\t')).catch(console.error)
		writeFile('./tmp/dependingOn.json', JSON.stringify(dependingOn, null, '\t')).catch(console.error)
	},
	// Source and dependencies are watched by system
	rules: [JSRule],
}

const unwatch = solveDependencies(config)
