import Path from 'path'

export default
class FileResolver {

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

}
