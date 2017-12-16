# file-dependency-manager
Utility to manage relations between files

## Comes with default file interpreter
- Javacript/JSX
- CSS
- HTML
- text-files
- Less
- JSON
- CSON

## Concept

### Resolve

### Input
Point to a file generating a file tree

### Rules
Declare how to interpret files (that give dependencies)

### Output generator
Listen to file tree changes and generate output

## Notes
every node has
1. AST
2. dependencies

When dependecies change => change order of execution order
When AST changes => compile

## JSRule
### Loader with babel
* cjs -> es2015
* React transform
### Output browser-compatible modules
### Use rollup asynchronous to generate bundle
