import FileResolver from './src/FileResolver'
import ResolveList from './src/ResolveList'
import Path from 'path'
import ReadJsFile from './src/ReadJsFile'
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
		// Dont wait for the file to be written
		writeFileToOutputFolder(filename, results)
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
	return await ReadJsFile(
		filename,
		code,
		(relativeDependency) =>	onDependencyRequest(filename, relativeDependency)
	)
}

function onDependencyRequest(from, to) {
	const dependencyFilename = fileResolver.resolveFile(from, to)
	const extension = Path.extname(dependencyFilename)
	doIt(from, to)
	switch (extension) {
		case '.js':
		case '.jsx':
			return Path.relative(Path.dirname(from), dependencyFilename)
	}
	return null
}

async function writeFileToOutputFolder(filename, { code, sourceMap }) {
	const relativeFilename = Path.relative('./', filename)
	const outputFilename = Path.normalize(outputDirectory + '/' + relativeFilename)
	await Mkdirp(Path.dirname(outputFilename))
	await writeFile(outputFilename + '.map', JSON.stringify(sourceMap, null, 2))
	await writeFile(outputFilename, code)
}
