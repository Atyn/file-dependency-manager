import ReadJsFile from '../ReadJsFile'

export default
class CodeInfoExtractor {

	/**
  * @return { ast, code, sourceMap, dependencies: String }
  */
	async extractInfo(filename, code, extension) {
		switch (this.getExtension()) {
			case '.js':
			case '.jsx':
				return await ReadJsFile(filename, code, extension)
		}
		return null
	}

}
