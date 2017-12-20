import React from 'react'
// import ReactDom from 'react-dom'

console.log('component!')

class App extends React.Component {
	render() {
		return (
			<div>
				HELLO WORLD!
			</div>
		)
	}
}

export
function start() {
	const appElement = document.querySelector('#app')
	console.log('render', appElement)
}
