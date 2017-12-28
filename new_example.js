import FileResolver from './src/FileResolver'
import ResolveList from './src/ResolveList'
import Path from 'path'
import ReadJsFile from './src/ReadJsFile'
import ReadCSSFile from './src/ReadCSSFile'
import _mkdirp from 'mkdirp'
import Fs from 'fs'
import { promisify } from 'util'

const projectDirectory = Path.resolve('/')
const Mkdirp = promisify(_mkdirp)
const ReadFile = promisify(Fs.readFile)
const writeFile = promisify(Fs.writeFile)
// Create objects
const resolveList = new ResolveList()
const fileResolver = new FileResolver()

const outputDirectory = Path.resolve('./tmp/output/')
const rootFile = Path.resolve('./example/root.js')

doIt(rootFile, './main')

async function doIt(from, to) {
	const filename = fileResolver.resolveFile(from, to)

	try {
		const results = await readFile(filename)
		const event = Object.assign({	filename }, results)
		onNodeAdded(event)
		onNodeContent(event)
		return filename
	} catch (error) {
		console.error(from, '->', to)
		console.error(error)
		return null
	}
}

/**
* @return ast, code, sourceMap and dependencies
*/
async function readFile(filename) {
	const buffer = await ReadFile(filename)
	const code = buffer.toString()
	const extension = Path.extname(filename)
	switch (extension) {
		case '.js':
		case '.jsx':
			return await ReadJsFile(
				filename,
				code,
				(relativeDependency) =>	onDependencyRequest(filename, relativeDependency)
			)
		case '.css':
			return await ReadCSSFile(
				filename,
				code,
				(relativeDependency) =>	onDependencyRequest(filename, relativeDependency)
			)
	}
	return { code }
}

function onDependencyRequest(from, to) {
	doIt(from, to)
	const dependencyFilename = fileResolver.resolveFile(from, to)
	const fromExtension = Path.extname(from)
	const toExtension = Path.extname(dependencyFilename)
	if (fromExtension === toExtension) {
		return Path.relative(Path.dirname(from), dependencyFilename)
	}
	return onIntercall(from, to)
}

async function writeFileToOutputFolder({ filename, code, sourceMap }) {
	const relativeFilename = Path.relative('./', filename)
	const outputFilename = Path.normalize(outputDirectory + '/' + relativeFilename)
	await Mkdirp(Path.dirname(outputFilename))
	if (sourceMap) {
		await writeFile(outputFilename + '.map', JSON.stringify(sourceMap, null, 2))
	}
	await writeFile(outputFilename, code)
}

// Between file types
function onIntercall(from, to) {
	console.log('fromExtension !== toExtension')
}

function onNodeContent(event) {
	// console.log('onNodeContentChanged', event.filename)
	writeFileToOutputFolder(event)
}

function onNodeAdded(event) {
	const extension = Path.extname(event.filename)
	switch (extension) {
		case '.css': {
			const filename = Path.join(outputDirectory, 'tmp/output/example/main.css')

		}
	}
	// console.log('onNodeAdded', event.filename)
}
