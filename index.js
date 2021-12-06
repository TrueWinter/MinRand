const { EventEmitter } = require('events');
const ExistsError = require('./errors/ExistsError');
const NotExistsError = require('./errors/NotExistsError');

class MinRand {
	/**
	 * Creates a new MinRand instance
	 * @param {Array} dataset An array containing the dataset
	 * @param {Object} [usedDataPoints={}] A key-value object containing the arrays of used datapoints. Converted to a Map internally.
	 * @throws {TypeError}
	 */
	constructor(dataset, usedDataPoints = {}) {
		if (!Array.isArray(dataset)) {
			throw new TypeError('Dataset must be an array');
		}

		if (!(typeof usedDataPoints === 'object' && !Array.isArray(usedDataPoints))) {
			throw new TypeError('Used data points must be an object');
		}

		this.dataset = dataset;
		this.usedDataPoints = new Map(Object.entries(usedDataPoints));

		this.usedResetPercentage = 0.9;
		this.eventEmitter = new EventEmitter();
	}

	/**
	 * Returns the EventEmitter
	 * @returns {EventEmitter} The EventEmitter
	 */
	getEventEmitter() {
		return this.eventEmitter;
	}

	/**
	 * Returns the dataset
	 * @returns {Array} An array containing the dataset
	 */
	getDataset() {
		return this.dataset;
	}

	/**
	 * Sets the dataset
	 * @param {Array} dataset An array containing the dataset
	 * @throws {TypeError}
	 */
	setDataset(dataset) {
		if (!Array.isArray(dataset)) {
			throw new TypeError('Dataset must be an array');
		}

		this.dataset = dataset;
	}

	/**
	 * Returns the usage percentage at which the first half of the used datapoint store will be removed
	 * @returns {double} The percentage in decimal form
	 */
	getUsedResetPercentage() {
		return this.usedResetPercentage;
	}

	/**
	 * Sets the usage percentage at which the first half of the used datapoint store will be removed
	 * @param {double} percentage A percentage in decimal form between 0.01 and 0.99 (inclusive)
	 * @throws {TypeError}
	 * @throws {RangeError}
	 */
	setUsedResetPercentage(percentage) {
		if (typeof percentage !== 'number' || !percentage.toString().match(/^[0-9]+(?:\.[0-9]+)?$/)) {
			throw new TypeError('Percentage must be numerical');
		}

		if (percentage < 0.01 || percentage > 0.99) {
			throw new RangeError('Percentage must be between 0.01 and 0.99 (inclusive)');
		}

		this.usedResetPercentage = percentage;
	}

	/**
	 * Removes a value from the dataset array, and all used datapoint arrays
	 * @param {*} value The value to remove
	 */
	removeDatasetPoint(value) {
		this.dataset = this.dataset.filter(e => e !== value);

		this.usedDataPoints.forEach((v, k) => {
			var _v = v.filter(e => e !== value);
			this.usedDataPoints.set(k, _v);
		});
	}

	/**
	 * Adds a value to the dataset array
	 * @param {*} value The value to add
	 */
	addDatasetPoint(value) {
		this.dataset.push(value);
	}

	/**
	 * Returns the used data points map
	 * @returns {Map} The used data points map
	 */
	getUsedDataPoints() {
		return this.usedDataPoints;
	}

	/**
	 * Gets the used datapoints for the specified key
	 * @param {*} key The key
	 * @returns {Array|undefined} An array of used datapoints for this key. Undefined if it does not exist
	 */
	getUsedDataPointArray(key) {
		return this.usedDataPoints.get(key);
	}

	/**
	 * Sets the used datapoints for the specified key
	 * @param {*} key The key
	 * @param {*} array The array of datapoints
	 * @throws {TypeError}
	 */
	setUsedDataPointArray(key, array) {
		if (!Array.isArray(array)) {
			throw new TypeError('Dataset must be an array');
		}

		this.usedDataPoints.set(key, array);
	}

	/**
	 * Adds a used datapoint to a key
	 * @param {*} key The key
	 * @param {*} datapoint The datapoint to add
	 * @throws {NotExistsError}
	 * @throws {ExistsError}
	 */
	addUsedDataPoint(key, datapoint) {
		var _dataPoints = this.usedDataPoints.get(key);

		if (!_dataPoints) {
			throw new NotExistsError();
		}

		if (!this.dataset.includes(datapoint)) {
			throw new NotExistsError('That datapoint does not exist');
		}

		if (_dataPoints.includes(datapoint)) {
			throw new ExistsError();
		}

		_dataPoints.push(datapoint);
	}

	/**
	 * Adds an empty used data point array for the specified key
	 * @param {*} key The key
	 * @param {boolean} [force=false] Whether to override an existing key
	 * @throws {ExistsError} An error thrown if the key already exists
	 */
	addUsedDataPointKey(key, force = false) {
		if (!force && this.usedDataPoints.has(key)) {
			throw new ExistsError();
		}

		this.usedDataPoints.set(key, []);
	}

	/**
	 * Removes a used datapoint key
	 * @param {*} key The key
	 * @throws {NotExistsError}
	 */
	removeUsedDataPointKey(key) {
		if (!this.usedDataPoints.has(key)) {
			throw new NotExistsError();
		}

		this.usedDataPoints.delete(key);
	}

	/**
	 * Removes the first half of the used datapoints for the specified key, if needed
	 * @param {*} key The key
	 * @returns {boolean} Whether the reset occurred
	 * @private
	 */
	_resetIfNeeded(key) {
		if (!this.usedDataPoints.has(key)) {
			throw new NotExistsError();
		}

		var _thisUDP = this.usedDataPoints.get(key);

		if (this.dataset.length > 0) {
			if (_thisUDP.length >= Math.floor(this.dataset.length * this.usedResetPercentage)) {
				var _halfLength = Math.ceil(_thisUDP.length / 2);
				//console.log(`${_thisUDP.length} datapoints used. Clearing first ${_halfLength} datapoints from used datapoints array`);
				var _thisUDPRight = _thisUDP.slice(_halfLength);
				this.usedDataPoints.set(key, _thisUDPRight);

				return true;
			}
		}

		return false;
	}

	/**
	 * Gets a random datapoint not in the used datapoint store specified by key,
	 * and adds this to the used datapoint array for the key
	 * @param {*} key The key
	 * @returns {*} The random datapoint
	 * @fires MinRand#reset
	 * @throws {NotExistsError}
	 */
	getRandomDataPoint(key) {
		if (!this.usedDataPoints.has(key)) {
			throw new NotExistsError();
		}

		if (this._resetIfNeeded(key)) {
			/**
			 * The reset event fires when the first half of the used datapoints for the specified key is removed
			 * @event MinRand#reset
			 * @type {object}
			 * @property {*} key The key that was reset
			 */
			this.eventEmitter.emit('reset', {
				key
			});
		}

		var randArr = this.dataset.filter(e => !this.usedDataPoints.get(key).includes(e));
		var randDataPoint = randArr[Math.floor(Math.random() * randArr.length)];

		this.usedDataPoints.get(key).push(randDataPoint);

		return randDataPoint;
	}
}

module.exports = MinRand;