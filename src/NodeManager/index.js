import FileNode from '../FileNode'
import CodeInfoExtractor from '../CodeInfoExtractor'

const nodeMap = new Map()

export default
class NodeManager {

	/**
  * @return FileNode
  **/
	static getFileNode(filename) {
		if (nodeMap.has(filename)) {
			return nodeMap.get(filename)
		}
		return this._getNewFileNode(filename)
	}

	static _getNewFileNode(filename) {
		const fileNode = new FileNode(filename, this)
		nodeMap.set(fileNode)
		return fileNode
	}

}
