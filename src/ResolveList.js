import Path from 'path'

const defaultResolve = [
	Path.resolve('./node_modules'),
]

export default
class ResolveList {

	constructor(globalFolders = defaultResolve) {
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

	getListOfAlternatives(from, to) {
		const fileType = ResolveList.getFileType(to)
		const fileExtension = ResolveList.getFileExtension(to) || ResolveList.getFileExtension(from)
		const withoutFileExtension = ResolveList.removeFileExtension(to)
		const results = /^\.\/(.+)/.exec(to)
		// Relative files
		if (results) {
			const directory = Path.dirname(from)
			return [
				directory + '/' + withoutFileExtension + '.' + fileExtension,
				directory + '/' + withoutFileExtension + '/index' + '.' + fileExtension,
			].map(Path.normalize)
		} else {
			const nodeModulesDirectory = Path.resolve('node_modules')
			return [
				nodeModulesDirectory + '/' + withoutFileExtension + '.' + fileExtension,
				nodeModulesDirectory + '/' + withoutFileExtension + '/index' + '.' + fileExtension,
			].map(Path.normalize)
		}

	}

	static getAbsoluteFilePath(from, to) {
		// Start with ./
		return Path.join(Path.dirname(from), to)
	}

}
