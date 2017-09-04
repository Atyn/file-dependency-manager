import { setDifference } from '../utils'

/*
Manage a tree base on dependencies
*/

class DependencyManager {
	constructor(
		rootNode,
		onNodeRemoved,
		onNodeAdded,
		onTreeUpdate = () => {},
	) {
		this.dependencies = {}
		this.dependingOn = {}
		this.onTreeUpdate = this.onTreeUpdate
	}
	getTree() {
		return this.tree
	}
	updateDependencies(name, list) {
		const oldDepenencies = this.dependencies[name] || []
		const addedDependencies = setDifference(oldDepenencies, list)
		const removedDependencies = setDifference(list, oldDepenencies)
		if (!addedDependencies.length && !removedDependencies.length) {
			return
		}
		addedDependencies.forEach(addedDependency => {
			this.dependingOn[addedDependency] = this.dependingOn[addedDependency] || new Set()
			this.dependingOn[addedDependency].add(name)
		})
		removedDependencies.forEach(removedDependency => {
			this.dependingOn[removedDependency].delete(name)
		})
		this.dependencies = [...list]

		console.log(name, ':')
		console.log('addedDependencies:', addedDependencies)
		console.log('removedDependencies', removedDependencies)

		this.onTreeUpdate(this.dependencies, this.dependingOn)

	}
}

/*

treeNode.dependencies = treeNode.dependencies || []
// Dont publish if there are no changes
const addedDependencies = setDifference(treeNode.dependencies, dependencies)
const removedDependencies = setDifference(dependencies, treeNode.dependencies)
// No changes?
if (!addedDependencies.length && !removedDependencies.length) {
	return
}
// sync dependencyOnModules object
addedDependencies.forEach(addedDependency => {
	dependencyByModules[addedDependency] = dependencyByModules[addedDependency] || new Set()
	dependencyByModules[addedDependency].add(filename)
})
removedDependencies.forEach(removedDependency => {
	dependencyByModules[removedDependency].delete(filename)
})
console.log(filename, ':')
console.log('addedDependencies:', addedDependencies)
console.log('removedDependencies', removedDependencies)
addedDependencies.map(addFile)
treeNode.dependencies = dependencies
onTreeChange(dependencyByModules)
*/
