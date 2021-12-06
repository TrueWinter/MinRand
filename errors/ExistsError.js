class ExistsError extends Error {
	constructor(message = 'That key already exists') {
		super(message);
		this.message = message;
	}
}

module.exports = ExistsError;