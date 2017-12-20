import Path from 'path'
import Fs from 'fs'
import ResolveList from './ResolveList'

const projectPath = Path.resolve('')

export default
class FileResolver extends ResolveList {

	/**
	 * Return undefine if file could not be found
	 * @return {Object}
	 */
	resolveFile(from, to) {
		const alternatives = this.getListOfAlternatives(from, to)
		const finalName = alternatives.find(alternative => Fs.existsSync(alternative))
		if (!finalName) {
			console.error('Could not find file', from, '->', to)
			console.log(alternatives)
			return {}
		}
		return finalName
	}

}
