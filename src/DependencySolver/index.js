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
	subscribe, // test, type, callback
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

	function getRulesFromFilename(fileName) {
		return rules.find(
			loader => loader.test.test(fileName)
		)
	}

}
