import mkdirp from 'mkdirp'
import Fs from 'fs'
import { promisify } from 'util'
import Path from 'path'

const ReadFile = promisify(Fs.readFile)
const WriteFile = promisify(Fs.writeFile)
const Fstat = promisify(Fs.fstat)
const { watchFile, unwatchFile } = Fs

export default
class AbstractFileNode {

	constructor(filename, nodeManager) {
		this.filename = filename
		this.extension = Path.extname(filename)
		this.nodeManager = nodeManager
		this.watchFunction = stats => this.readFile(stats)
		watchFile(this.filename, this.watchFunction)
		Fstat.then(stats => this.readFile(stats))
	}

	destroy() {
		unwatchFile(this.filename, this.watchFunction)
	}

	async readFile(stats) {
		this.mtime = stats.mtime
		const buffer = await ReadFile(this.filename)
		const code = buffer.toString()
		await this.onCode(code)
	}

	getFilename() {
		return this.filename
	}

	getExtension() {
		return this.this.extension
	}

}
