import Path from 'path'
import Fs from 'fs'
import ResolveList from './ResolveList'

const cwd = process.cwd()

export default
class FileResolver extends ResolveList {

	/**
	 * Return undefine if file could not be found
	 * @return {Object}
	 */
	static resolveFile(from, to) {
		const alternatives = this.getListOfAlternatives(from, to)
			.map(item => Path.normalize(item))
		const finalName = alternatives.find(alternative => Fs.existsSync(alternative))
		if (!finalName) {
			console.error('Could not find file', from, '->', to)
			return {}
		}
		const fileStatus = Fs.statSync(finalName)
		return {
			source: Fs.readFileSync(finalName),
			etag:   fileStatus.mtime,
			path:   Path.relative(cwd, finalName),
		}
	}

}
