import DefaultFileResolver from './DefaultFileResolver'
import mkdirp from 'mkdirp'
import fileInterpreters from './fileInterpreters'

import fs from 'fs'
import { promisify } from 'util'

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const { watchFile, unwatchFile } = fs

export default
class DefaultConfig {

	constructor() {
		this.fileInterpreters = fileInterpreters
	}

	static resolveFile(...args) {
		return DefaultFileResolver.resolveFile(...args)
	}

	static async getResource(name) {
		return await readFile(name)
	}

	static async writeResource(filename) {
		return await writeFile(filename)
	}

	static async onError(error) {
		console.error(error)
	}

	static watchResource(name, listener) {
		watchFile(name, listener)
	}

	static unWatchResource(name, listener) {
		unwatchFile(name, listener)
	}

	getObject() {
		const obj = Object.assign({}, this)
		for (const name of Object.getOwnPropertyNames(DefaultConfig)) {
			const method = this[name]
			obj[name] = method
		}
		return obj
	}

}
