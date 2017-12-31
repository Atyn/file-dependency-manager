import mkdirp from 'mkdirp'
import Fs from 'fs'
import { promisify } from 'util'
import Path from 'path'
import PubSub from '../PubSub'

const ReadFile = promisify(Fs.readFile)
const WriteFile = promisify(Fs.writeFile)
const Fstat = promisify(Fs.fstat)
const { watchFile, unwatchFile } = Fs

export default
class FileNode {

	constructor(filename, nodeManager) {
		this.filename = filename
		this.extension = Path.extname(filename)

		// Pub subs
		this.codePub = new PubSub()
		this.destroyPub = new PubSub()

		this.watchFunction = stats => this.readFile(stats)
		watchFile(this.filename, this.watchFunction)
		Fstat.then(stats => this.readFile(stats))
	}

	destroy() {
		unwatchFile(this.filename, this.watchFunction)
	}

	async readFile(stats) {
		if (this.mtime === stats.mtime) {
			return
		}
		this.mtime = stats.mtime
		const buffer = await ReadFile(this.filename)
		const code = buffer.toString()
		if (this.code === code) {
			return
		}
		this.code = code
		this.codePub.publish(code)
	}

	onCode(fun) {
		return this.codePub.subscribe(fun)
	}

	onFileRemoved(fun) {
		return this.destroyPub.subscribe(fun)
	}

	getFilename() {
		return this.filename
	}

	getExtension() {
		return this.this.extension
	}

}
