import mkdirp from 'mkdirp'
import { solveDependencies, watch } from './src/DependencySolver'
import JSRule from './src/JsRule'

import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { watchFile, unwatchFile } = fs

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
	rules: [JSRule],
}

solveDependencies(config)
