/*
Publish/subscribe bus with caching possibilities
*/
export default
class {
	constructor() {
		this.subscribers = {}
	}
	publish(name, value) {
		this.subscribers[name] = this.subscribers[name] || []
		this.subscribers[name].forEach(
			subscriber => subscriber(value)
		)
	}
	subscribe(name, callback) {
		this.subscribers[name] = this.subscribers[name] || []
		this.subscribers[name].push(callback)
	}

}
