/**
 * An error thrown if the key does not exists
 * @extends {Error}
 */
class NotExistsError extends Error {
	constructor(message = 'That key does not exists') {
		super(message);
		this.message = message;
	}
}

module.exports = NotExistsError;