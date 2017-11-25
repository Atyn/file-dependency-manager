import Path from 'path'
import Fs from 'fs'

const cwd = process.cwd()

export default
class DefaultFileResolver {

	constructor(globalFolders = [
		'/node_modules/',
	]) {
		this.globalFolders = globalFolders
	}

	static getFileType(fileName) {
		if (/.(js|jsx)$/.test(fileName)) {
			return 'JS'
		}
		if (/.(html)$/.test(fileName)) {
			return 'JS'
		}
		if (/.(css|less)$/.test(fileName)) {
			return 'LESS'
		}
		return null
	}

	static isJsFileType(fileName) {
		return /.(js|jsx)$/.test(fileName)
	}

	static resolveFolder(from, to) {
		return [

		]
	}

	static removeFileExtension(fileName) {
		const result = /(.+)\.([a-z]+)$/.exec(fileName)
		if (result) {
			return result[1]
		}
		return fileName
	}

	static getFileExtension(filename) {
		const result = /\.([a-z]+)$/.exec(filename)
		if (result) {
			return result[1]
		}
		return null
	}

	static getListOfAlternatives(from, to) {
		const fileType = this.getFileType(to)
		const fileExtension = this.getFileExtension(to) || this.getFileExtension(from)
		const withoutFileExtension = this.removeFileExtension(to)
		const results = /^\.\/(.+)/.exec(to)
		// Relative files
		if (results) {
			const directory = Path.dirname(from)
			return [
				directory + '/' + withoutFileExtension + '.' + fileExtension,
				directory + '/' + withoutFileExtension + '/index' + '.' + fileExtension,
			]
		} else {
			return [
				'/node_modules/' + withoutFileExtension + '.' + fileExtension,
				'/node_modules/' + withoutFileExtension + '/index' + '.' + fileExtension,
			]
		}

	}

	static getAbsoluteFilePath(from, to) {
		// Start with ./
		return Path.join(Path.dirname(from), to)
	}

	/**
	 * Return undefine if file could not be found
	 *
	 */
	static resolveFile(from, to) {
		const alternatives = this.getListOfAlternatives(from, to)
			.map(item => Path.normalize(item))
		const finalName = alternatives.find(alternative => Fs.existsSync(alternative))
		if (!finalName) {
			console.error('Coulnd not find file', from, '->', to)
			return
		}
		return Path.relative(cwd, finalName)
	}

}
