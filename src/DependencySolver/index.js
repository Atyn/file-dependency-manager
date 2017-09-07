import path from 'path'
import { setDidatabasefference } from 'set-operations'
import DependencyManager from './DependencyManager'
import MessageBus from './MessageBus'

// Callback runs when changes for a node has occured
export
function solveDependencies({
	input,
	getResource,
	writeResource,
	watchResource,
	rules,
	onError,
	unWatchResource,
	onTreeUpdate,
}) {

	const dependencyManager = new DependencyManager({
		rootNode: input,
		onNodeRemoved,
		onNodeAdded,
		onTreeUpdate,
	})

	function onNodeRemoved(name, destroyFunction) {
		destroyFunction()
	}

	function onNodeAdded(name) {
		console.log('onNodeAdded', name)

		const rule = getRulesFromFilename(name)
		const transformers = rule.transformers
		const messageBus = new MessageBus()

		if (!rule) {
			onError('No rule for file', name)
			return null
		}

		// subscribe to dependencies
		messageBus.subscribe('dependencies', dependencies => {
			dependencyManager.updateDependencies(name, dependencies)
		})

		// Create publish/subscribe relations
		Object.keys(transformers)
			.forEach(fromType => {
				const obj = transformers[fromType]

				Object.keys(obj)
					.forEach(toType => {

						// Take out transform function
						const transform = obj[toType]

						// When content changes -> transform to another content
						messageBus.subscribe(fromType, (content) => {
							transform(content, name, rule)
								.then(
								newContent => messageBus.publish(toType, newContent)
								)
						})

					})

			})

		// Subscribe to file changes
		return resource(name, onSource)

		function onSource(buffer) {
			messageBus.publish('source', buffer)
		}

	}

	/*
	const nodes = {}
	const dependencyByModules = {}
	const fileWatchers = {}
	const cachedNodes = {}

	// Print information
	rules.forEach(rule => {
		const transformers = rule.transformers
		console.log('rule "', rule.test.source, '":')
		Object.keys(rule.transformers)
			.forEach(fromType => {
				const obj = transformers[fromType]
				Object.keys(obj)
					.forEach(toType => {
						console.log('\t', fromType, '->', toType)
					})
			})
	})
	*/

	// Start everything
	// addFile(input)

	function removeNode(name) {

	}

	function addNode(name) {

	}

	// Check that resource has changed
	function resource(filename, callback, resolve) {
		getFile()
		watchResource(filename, getFile)
		return unWatchFile
		function getFile() {
			getResource(filename).then(callback).catch(onError)
		}
		function unWatchFile() {
			unWatchResource(filename, getFile)
		}
	}

/*
	function addFile(filename) {
		if (nodes[filename]) {
			console.log(filename, 'already added')
			return nodes[filename]
		}

		console.log('Adding file', filename)

		// Object for this file
		const treeNode = {}
		nodes[filename] = treeNode
		const rule = getRulesFromFilename(filename)
		if (!rule) {
			onError('No rule for file', filename)
			return null
		}

		const transformers = rule.transformers
		const subscribers = { }

		// subscribe to dependencies
		subscribe('dependencies', dependencies => {
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
			// onTreeChange(dependencyByModules)
		})

		// Create publish/subscribe relations
		Object.keys(transformers)
			.forEach(fromType => {
				const obj = transformers[fromType]
				Object.keys(obj)
					.forEach(toType => {
						const transform = obj[toType]
						subscribe(fromType, (content) => {
							transform(content, filename, rule)
								.then(newContent => publish(toType, newContent))
						})
					})
			})

		resource(filename, onSource, rule.resolve)

		return treeNode

		function subscribe(type, callback) {
			// console.log('subscribe', type)
			subscribers[type] = subscribers[type] || []
			subscribers[type].push(callback)
		}

		function publish(type, content) {
			// TODO: Check if resource has changes
			// console.log('publish', type)
			subscribers[type] = subscribers[type] || []
			subscribers[type].forEach(
				subscriber => subscriber(content)
			)
		}

		function onSource(buffer) {
			publish('source', buffer)
		}

	}

	*/
	function getRulesFromFilename(fileName) {
		return rules.find(
			loader => loader.test.test(fileName)
		)
	}

}
