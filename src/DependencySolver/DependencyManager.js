import { setDifference } from 'set-operations'

/*
Manage a tree base on dependencies
*/

export default
class DependencyManager {
	constructor({
		rootNode,
		onNodeRemoved,
		onNodeAdded,
		onError,
		onTreeUpdate = () => {},
	}) {

		this.nodeContext = {}
		this.dependencies = {}
		this.dependingOn = {}
		this.onNodeAdded = onNodeAdded
		this.onTreeUpdate = onTreeUpdate
		this.onError = onError

		this.dependencies[rootNode] = []
		this.onNodeAdded(rootNode)

	}
	getTree() {
		return this.tree
	}
	updateDependencies(name, list) {

		console.log('updateDependencies', name)
		const oldDepenencies = this.dependencies[name]

		const addedDependencies = setDifference(oldDepenencies, list)
		const removedDependencies = setDifference(list, oldDepenencies)

		const oldListOfModules = Object.keys(this.dependingOn)

		// Sync this.dependingOn and this.dependencies
		addedDependencies.forEach(addedDependency => {
			const set = this.dependingOn[addedDependency] || new Set()
			this.dependingOn[addedDependency] = set
			this.dependingOn[addedDependency].add(name)
		})

		removedDependencies.forEach(removedDependency => {
			const set = this.dependingOn[removedDependency]
			set.delete(name)
			if (!set.size) {
				delete this.dependingOn[removedDependency]
			}
		})

		// Set the new value for this node
		this.dependencies[name] = [...list]
		this.checkTree(oldListOfModules)

		/*
		console.log(name, ':')
		console.log('addedDependencies:', addedDependencies)
		console.log('removedDependencies', removedDependencies)
		*/

		/*
		const circularDependencies = this.checkCircularDependencies(name)
		if (!circularDependencies.length) {
			this.onError('Circular dependencies:', circularDependencies.join('->'))
		}
		*/

		this.onTreeUpdate(this.dependencies, this.dependingOn)

	}
	checkTree(oldListOfModules) {

		// Check if modules has changed
		const listOfModules = Object.keys(this.dependingOn)
		const addedNodes = setDifference(oldListOfModules, listOfModules)
		const removedNodes = setDifference(listOfModules, oldListOfModules)

		console.log('addedNodes', addedNodes)
		console.log('removedNodes', removedNodes)

		// Notify listeners
		removedNodes.forEach(nodeName => {
			delete this.dependencies[nodeName]
			this.onNodeRemoved(nodeName, this.nodeContext[nodeName])
		})
		addedNodes.forEach(nodeName => {
			this.dependencies[nodeName] = []
			this.nodeContext[nodeName] = this.onNodeAdded(nodeName)
		})

		this.onTreeUpdate(this.dependencies, this.dependingOn)

	}
	checkCircularDependencies(name, originalName) {
		// Error!
		if (originalName === name) {
			return [name]
		}
		return [
			...this.dependencies[name]
				.every(this.checkCircularDependencies),
		]
	}

}
