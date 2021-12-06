class ExistsError extends Error {
	constructor(message = 'That key does not exists') {
		super(message);
		this.message = message;
	}
}

module.exports = ExistsError;