import Path from 'path'
import { setDidatabasefference } from 'set-operations'
import DependencyManager from './DependencyManager'
import MessageBus from './MessageBus'

// Callback runs when changes for a node has occured
export
function solveDependencies(list) {
	list.forEach(config => _solveDependencies({
		input:            config.input,
		getResource:      config.getResource,
		writeResource:    config.writeResource,
		watchResource:    config.watchResource,
		fileInterpreters: config.fileInterpreters,
		onError:          config.onError,
		onUpdate:         config.onUpdate,
		unWatchResource:  config.unWatchResource,
		resolveFile:      config.resolveFile,
		debug:            config.debug,
		subscribe:        config.subscribe,
	}))
}

// Callback runs when changes for a node has occured
export
function _solveDependencies({
	input,
	getResource,
	writeResource,
	watchResource,
	fileInterpreters,
	onError,
	onUpdate,
	unWatchResource,
	resolveFile,
	debug,
	subscribe, // test, type, callback
}) {

	const dependencyManager = new DependencyManager({
		rootNode:     input,
		onNodeRemoved,
		onNodeAdded,
		onTreeUpdate: onTreeUpdate,
	})

	function onTreeUpdate(
		addedNodes,
		removedNodes,
		dependencies,
		dependingOn
	) {

	}

	function onNodeRemoved(name, destroyFunction) {
		destroyFunction()
	}

	function onNodeAdded(name) {
		const fileInterpreter = getRulesFromFilename(name)
		const messageBus = new MessageBus()

		if (!fileInterpreter) {
			onError('No fileInterpreter for file', name)
			return null
		}

		// subscribe to dependencies
		messageBus.subscribe('dependencies', (dependencies) => {
			// Resolve filepath when dependencies are given
			const list = dependencies
				.map(dependencyName => resolveFile(name, dependencyName))
				.filter(Boolean)
			dependencyManager.updateDependencies(name, list)
			onUpdate({
				name:         name,
				type:         'dependencies',
				dependencies: list,
			})
		})

		messageBus.subscribe('ast', (ast) => {
			fileInterpreter.getDependencies(ast, name)
				.then(content =>
					messageBus.publish('dependencies', content)
				)
			onUpdate({
				name: name,
				type: 'ast',
				ast:  ast,
			})
		})

		messageBus.subscribe('source', (source) => {
			fileInterpreter.getAst(source, name)
				.then(content => messageBus.publish('ast', content))
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
		return Object.values(fileInterpreters).find(
			loader => loader.test(fileName)
		)
	}

}
