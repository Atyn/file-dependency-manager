import mkdirp from 'mkdirp'
import { solveDependencies, watch } from './src/DependencySolver'
import JSRule from './src/fileInterpreters/js'
import DefaultFileResolver from './src/DefaultFileResolver'
import DefaultConfig from './src/DefaultConfig'
import fileInterpreters from './src/fileInterpreters'
import Fs from 'fs'
import { promisify } from 'util'
import JsOutputBundler from './src/bundlers/js'

/*
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { watchFile, unwatchFile } = fs
*/

const superConfig = {
	// getResource:   (name) => readFile(name).catch(console.error),
	// writeResource: writeFile,
	// debug:         true,
	/*
	resolveFile:   (to, from) => DefaultFileResolver.resolveFile(to, from),
	onError:       (error) => console.error(error),

	watchResource:   (name, listener) => watchFile(name, listener),
	unWatchResource: (name, listener) => unwatchFile(name, listener),
	onTreeUpdate:    onTreeUpdate,
	subscribe:       [
		{
			test: /lib2\.js/,
			type: 'ast',
			callback(content) {
				console.log('Update for lib2 ast!!!')
			},
		},
	],
	// Source and dependencies are watched by system
	fileInterpreters: {
		js: JSRule,
	},
	*/
}

/*
const config = Object.assign({}, new DefaultConfig().getObject(), {
	onUpdate(a, b) {
		console.log('onUpdate', a, b)
	},
	input: process.cwd() + '/example/main.js',
})
*/

class Config extends DefaultConfig {
	constructor() {
		super()
		this.input = process.cwd() + '/example/main.js'
	}
	static onUpdate(a, b) {
		console.log('onUpdate', a, b)
	}
}

const bundler = new JsOutputBundler()

/*
setInterval(() => {
	Fs.writeFileSync('./tmp/output.js', bundler.generateOutput())
}, 500)
*/
const generateFile = debounce(() => {
	console.log('Generate file ./tmp/output.js')
	Fs.writeFileSync('./tmp/output.js', bundler.generateOutput())
}, 100)

const config = {
	input:            process.cwd() + '/example/main.js',
	getResource:      Config.getResource,
	writeResource:    Config.writeResource,
	watchResource:    Config.watchResource,
	fileInterpreters: fileInterpreters,
	onError:          Config.onError,
	onUpdate:         info => {
		bundler.addInformation(info)
		generateFile()
	},
	unWatchResource: Config.unWatchResource,
	resolveFile:     Config.resolveFile,
	debug:           Config.debug,
	subscribe:       Config.subscribe,
}

const unwatch = solveDependencies([config])

function debounce(fun, time) {
	let timer = undefined
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => fun(...args), time)
	}
}

function copyClass(object, ClassName) {
	const obj = Object.assign({}, object)
	for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(ClassName))) {
		const method = object[name]
		obj[name] = method
	}
	return obj
}

function onTreeUpdate(
	addedNodes,
	removedNodes,
	dependencies,
	dependingOn
) {
	if (addedNodes.length) {
		console.log('addedNodes:', addedNodes)
	}
	if (removedNodes.length) {
		console.log('removedNodes:', removedNodes)
	}
	writeFile('./tmp/dependencies.json',
		JSON.stringify(dependencies, null, '\t')).catch(console.error)
	writeFile('./tmp/dependingOn.json',
		JSON.stringify(dependingOn, null, '\t')).catch(console.error)
}
