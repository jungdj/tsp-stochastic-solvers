class Ant {
	location = null;

	path = [];

	length = 0;

	constructor(at = 1) {
	  this.location = at;
	  this.path.push(at);
	}
}

export default Ant;
