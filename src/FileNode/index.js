import AbstractFileNode from './AbstractFileNode'

export default
class FileNode extends AbstractFileNode {

	constructor(filename, nodeManager, codeInfoExtractor) {
		super(filename, nodeManager)
		this.subscribers = new Set()
		this.codeInfoExtractor = codeInfoExtractor
		this.dependencySubscribers = new Set()
		this.dependencies = []
	}

	destroy() {
		super.destroy()
	}

	async onCode(code) {
		console.log('onCode')
		const resolveDependencies = filenames => filenames
		const results = await this.codeInfoExtractor.extractInfo(
			this.filename,
			code,
			this.getExtension()
		)
		this.code = results.code
		this.ast = results.ast
		this.sourceMap = results.sourceMap
		this.dependencies = results.dependencies
			.map(dependency => this.nodeManager.getFileNode(dependency))
		this._syncSubscribersToDependencies()
		this._notifySubscribers()
	}

	// TODO: implement
	_notifySubscribers() {

	}

	// TODO: implement
	_syncSubscribersToDependencies() {

	}

	getDependencies({ recursive = true }) {
		if (recursive) {
			return Array.concat(...this.dependencies
				.map(fileNode => fileNode.getDependencies({ recursive: true }))
			)
		}
		return this.dependencies
	}

	getDependencyFilenames(options) {
		return this.getDependencies(options)
			.map(fileNode => fileNode.getFilename())
	}

	getContent() {
		return this.code
	}

	getAst() {
		return this.ast
	}

	getSourceMap() {
		return this.sourceMap
	}

	/**
  * Recursively subcribe to node tree
  * @return clearFunction
  */
	subscribe(fun) {
		this.subscribers.add(fun)
		return () => {
			this.subscribers.remove(fun)
		}
	}

}
