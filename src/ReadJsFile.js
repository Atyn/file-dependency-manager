import Fs from 'fs'
import { promisify } from 'util'
import { parse } from 'babylon'
import { transformFromAst } from '@babel/core'
import traverse from '@babel/traverse'
import generate from '@babel/generator'

const parserOptions = {
	sourceType:                  'module',
	allowImportExportEverywhere: true,
	plugins:                     [
		// enable jsx and flow syntax
		'jsx',
		'flow',
	],
	sourceMaps: true,
}

const defaultBabelOptions = {
	plugins: [
		'transform-commonjs-es2015-modules',
		'transform-node-env-inline',
		'minify-dead-code-elimination',
	],
	presets: [
		'@babel/react',
		[ '@babel/preset-env', {
			modules: false,
			/*
			'targets': {
				browsers: '> 2%',
			},
			*/
		}],
	],
}

const generatorOptions = {
	sourceMaps: true,
	// retainLines: true,
}

export default
async function(
	filename,
	code,
	resolveFile,
	babelConfig = defaultBabelOptions
) {

	// Parse to get AST
	const ast = parse(code, parserOptions)

	// Do optional babel transformation
	const transformResults = transformFromAst(ast, code, babelConfig)

	// Remove all IIFE
	traverse(transformResults.ast, {
		Program(path) {
			path.traverse({
				ExpressionStatement(a) {
					if (a.parent !== path.node) {
						return
					}
					a.traverse({
						CallExpression(b) {
							if (b.parent !== a.node) {
								return
							}
							b.traverse({
								FunctionExpression(c) {
									if (c.parent !== b.node) {
										return
									}
									console.log('FunctionExpression', filename)
									a.replaceWithMultiple(c.node.body.body)
								},
							})
						},
					})
				},
			})
		},
		/*
		enter(path) {
			if (!path.isExpressionStatement()) {
				return
			}
			if (
				path.isCallExpression() &&
				path.node.callee
				// path.node.callee.isFunctionExpression()
			) {
				if (path.node.callee.type !== 'FunctionExpression') {
					return
				}
				path.replaceWithMultiple(path.node.callee.body.body)
			}
		},
		*/
	})

	// Resolve dependencies
	traverse(transformResults.ast, {
		enter(path) {
			if (
				path.isImportDeclaration() ||
				path.isExportAllDeclaration() ||
				path.isExportNamedDeclaration()
			) {
				if (!path.node.source) {
					return
				}
				const resolvedFilename = resolveFile(path.node.source.value)
				path.node.source.value = './' + resolvedFilename
			}
		},
	})

	const generatorResults = generate(
		transformResults.ast, Object.assign({
			sourceFileName: filename,
		}, generatorOptions),
		transformResults.code
	)

	return {
		code:      generatorResults.code,
		sourceMap: generatorResults.map,
		ast:       transformResults.ast,
	}

}

function isImportDeclaration(obj) {
	return obj.type === 'ImportDeclaration'
}

function ImportDeclarationFileName(obj) {
	return obj.source.value
}

/*

import * as babylon from "babylon";
import traverse from "@babel/traverse";

const code = `function square(n) {
  return n * n;
}`;

const ast = babylon.parse(code);

traverse(ast, {
  enter(path) {
    if (path.isIdentifier({ name: "n" })) {
      path.node.name = "x";
    }
  }
});

export default function (babel) {
  const { types: t } = babel;

  return {
    name: "ast-transform", // not required
    visitor: {
      Identifier(path) {
        path.node.name = path.node.name.split('').reverse().join('');
      }
    }
  };
}

*/
