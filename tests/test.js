/* eslint-disable no-undef */
const MinRand = require('../index');
const ExistsError = require('../errors/ExistsError');
const NotExistsError = require('../errors/NotExistsError');

const DATASET = ['1', '2', '4', '8', '16', '32', '64', '128', '256'];
const USED_DATA_POINTS = {
	user1: ['1', '4', '32'],
	user2: ['1', '4', '64', '128']
};

describe('MinRand with invalid constructor values', () => {
	test('string as dataset throws error', () => {
		expect(() => new MinRand('test')).toThrow(TypeError);
	});

	test('object as dataset throws error', () => {
		expect(() => new MinRand({})).toThrow(TypeError);
	});

	test('string as usedDataPoints throws error', () => {
		expect(() => new MinRand(DATASET.slice(), 'test')).toThrow(TypeError);
	});

	test('array as usedDataPoints throws error', () => {
		expect(() => new MinRand(DATASET.slice(), [])).toThrow(TypeError);
	});
});

describe('MinRand without usedDataPoints', () => {
	// Copy DATASET value as it was being updated before .slice()
	const minRand = new MinRand(DATASET.slice());

	test('intial dataset equals DATASET', () => {
		expect(minRand.getDataset()).toStrictEqual(DATASET);
	});

	test('set dataset to string throws error', () => {
		expect(() => minRand.setDataset('test')).toThrow(TypeError);
	});

	test('set dataset to object throws error', () => {
		expect(() => minRand.setDataset({})).toThrow(TypeError);
	});

	test('initial usedResetPercentage is 0.9', () => {
		expect(minRand.getUsedResetPercentage()).toBe(0.9);
	});

	test('setUsedResetPercentage to string throws error', () => {
		expect(() => minRand.setUsedResetPercentage('test')).toThrow(TypeError);
	});

	test('setUsedResetPercentage to 0 throws error', () => {
		expect(() => minRand.setUsedResetPercentage(0)).toThrow(RangeError);
	});

	test('setUsedResetPercentage to 1 throws error', () => {
		expect(() => minRand.setUsedResetPercentage(1)).toThrow(RangeError);
	});

	test('setUsedResetPercentage to 0.8', () => {
		minRand.setUsedResetPercentage(0.8);

		expect(minRand.getUsedResetPercentage()).toBe(0.8);
	});

	test('add 512', () => {
		minRand.addDatasetPoint('512');
		expect(minRand.getDataset()).toStrictEqual([...DATASET, '512']);
	});

	test('getUsedDatasetPoints returns Map', () => {
		expect(minRand.getUsedDataPoints()).toBeInstanceOf(Map);
	});

	test('generate random number before key init throws error', () => {
		expect(() => minRand.getRandomDataPoint('test1')).toThrow(NotExistsError);
	});

	test('generate random number, adding new key', () => {
		minRand.addUsedDataPointKey('test1');
		var randPoint = minRand.getRandomDataPoint('test1');
		expect(minRand.getDataset()).toContain(randPoint);
		expect(minRand.getUsedDataPointArray('test1')).toContain(randPoint);
	});

	test('add existing key throws error', () => {
		expect(() => minRand.addUsedDataPointKey('test1')).toThrow(ExistsError);
	});

	test('add existing key with force=true', () => {
		minRand.addUsedDataPointKey('test1-1');
		minRand.addUsedDataPoint('test1-1', minRand.getDataset()[0]);
		minRand.addUsedDataPointKey('test1-1', true);

		expect(minRand.getUsedDataPointArray('test1-1')).toStrictEqual([]);
	});

	test('remove non-existant used datapoints key throws error', () => {
		expect(() => minRand.removeUsedDataPointKey('nonexist1')).toThrow(NotExistsError);
	});

	test('remove used datapoints key', () => {
		minRand.addUsedDataPointKey('test1-2');
		minRand.addUsedDataPoint('test1-2', minRand.getDataset()[0]);
		expect(minRand.getUsedDataPointArray('test1-2')).toStrictEqual([minRand.getDataset()[0]]);

		minRand.removeUsedDataPointKey('test1-2');
		expect(minRand.getUsedDataPointArray('test1-2')).toBe(undefined);
	});

	test('generate random number again', () => {
		var randPoint = minRand.getRandomDataPoint('test1');
		expect(minRand.getDataset()).toContain(randPoint);
		expect(minRand.getUsedDataPointArray('test1')).toContain(randPoint);
	});

	test('removing datapoint removes it everywhere', () => {
		var beforeDataset = minRand.getDataset().slice();
		var beforeUsedPoints = minRand.getUsedDataPointArray('test1').slice();
		var rand = minRand.getUsedDataPointArray('test1').slice();
		var afterDataset = beforeDataset.filter(e => e !== rand[0]);
		var afterUsedPoints = beforeUsedPoints.filter(e => e !== rand[0]);
		minRand.removeDatasetPoint(rand[0]);
		expect(minRand.getDataset()).toStrictEqual(afterDataset);
		expect(minRand.getUsedDataPointArray('test1')).toStrictEqual(afterUsedPoints);
	});

	test('getUsedDataPointArray returns array', () => {
		expect(minRand.getUsedDataPointArray('test1')).toBeInstanceOf(Array);
	});

	test('setUsedDataPointArray to string throws error', () => {
		expect(() => minRand.setUsedDataPointArray('test')).toThrow(TypeError);
	});

	test('setUsedDataPointArray', () => {
		minRand.setUsedDataPointArray('test1-3', ['1', '8']);

		expect(minRand.getUsedDataPointArray('test1-3')).toStrictEqual(['1', '8']);
	});

	test('adding used datapoint on non-existant key throws error', () => {
		expect(() => minRand.addUsedDataPoint('nonexist2', '1024')).toThrow(NotExistsError);
	});

	test('adding used datapoint that doesn\'t exist in datapoints array throws error', () => {
		expect(() => minRand.addUsedDataPoint('test1', '1024')).toThrow(NotExistsError);
	});

	test('adding existing used datapoint throws error', () => {
		var value = minRand.getUsedDataPointArray('test1')[0];
		expect(() => minRand.addUsedDataPoint('test1', value)).toThrow(ExistsError);
	});
});

describe('MinRand without usedDataPoints, randomness test', () => {
	const minRand = new MinRand(DATASET.slice());

	test('reset works', () => {
		minRand.addUsedDataPointKey('test1-4');
		var resetFloor = Math.floor((minRand.getDataset().length - 1) * minRand.getUsedResetPercentage()) + 1;

		for (var i = 0; i < resetFloor; i++) {
			minRand.getRandomDataPoint('test1-4');
		}

		expect(minRand.getUsedDataPointArray('test1-4').length).toBe(resetFloor);

		// This should trigger a reset
		minRand.getRandomDataPoint('test1-4');

		expect(minRand.getUsedDataPointArray('test1-4').length < resetFloor).toBe(true);
	});
});

describe('MinRand with usedDataPoints', () => {
	const minRand = new MinRand(DATASET.slice(), Object.assign({}, USED_DATA_POINTS));

	test('intial dataset equals DATASET', () => {
		expect(minRand.getDataset()).toStrictEqual(DATASET);
	});

	test('set dataset to string throws error', () => {
		expect(() => minRand.setDataset('test')).toThrow(TypeError);
	});

	test('set dataset to object throws error', () => {
		expect(() => minRand.setDataset({})).toThrow(TypeError);
	});

	test('initial usedResetPercentage is 0.9', () => {
		expect(minRand.getUsedResetPercentage()).toBe(0.9);
	});

	test('setUsedResetPercentage to string throws error', () => {
		expect(() => minRand.setUsedResetPercentage('test')).toThrow(TypeError);
	});

	test('setUsedResetPercentage to 0 throws error', () => {
		expect(() => minRand.setUsedResetPercentage(0)).toThrow(RangeError);
	});

	test('setUsedResetPercentage to 1 throws error', () => {
		expect(() => minRand.setUsedResetPercentage(1)).toThrow(RangeError);
	});

	test('setUsedResetPercentage to 0.8', () => {
		minRand.setUsedResetPercentage(0.8);

		expect(minRand.getUsedResetPercentage()).toBe(0.8);
	});

	test('getUsedDatasetPoints returns Map', () => {
		expect(minRand.getUsedDataPoints()).toBeInstanceOf(Map);
	});

	test('getUsedDataPointArray', () => {
		expect(minRand.getUsedDataPointArray('user1')).toStrictEqual(USED_DATA_POINTS.user1);
		expect(minRand.getUsedDataPointArray('user2')).toStrictEqual(USED_DATA_POINTS.user2);
	});

	test('add 512', () => {
		minRand.addDatasetPoint('512');
		expect(minRand.getDataset()).toStrictEqual([...DATASET, '512']);
	});

	test('generate random number before key init throws error', () => {
		expect(() => minRand.getRandomDataPoint('test2')).toThrow(NotExistsError);
	});

	test('generate random number, adding new key', () => {
		minRand.addUsedDataPointKey('test2');
		var randPoint = minRand.getRandomDataPoint('test2');
		expect(minRand.getDataset()).toContain(randPoint);
		expect(minRand.getUsedDataPointArray('test2')).toContain(randPoint);
	});

	test('add existing key throws error', () => {
		expect(() => minRand.addUsedDataPointKey('test2')).toThrow(ExistsError);
	});

	test('add existing key with force=true', () => {
		minRand.addUsedDataPointKey('test2-1');
		minRand.addUsedDataPoint('test2-1', minRand.getDataset()[0]);
		minRand.addUsedDataPointKey('test2-1', true);

		expect(minRand.getUsedDataPointArray('test2-1')).toStrictEqual([]);
	});

	test('remove non-existant used datapoints key throws error', () => {
		expect(() => minRand.removeUsedDataPointKey('nonexist1')).toThrow(NotExistsError);
	});

	test('remove used datapoints key', () => {
		minRand.addUsedDataPointKey('test2-2');
		minRand.addUsedDataPoint('test2-2', minRand.getDataset()[0]);
		expect(minRand.getUsedDataPointArray('test2-2')).toStrictEqual([minRand.getDataset()[0]]);

		minRand.removeUsedDataPointKey('test2-2');
		expect(minRand.getUsedDataPointArray('test2-2')).toBe(undefined);
	});

	test('generate random number again', () => {
		var randPoint = minRand.getRandomDataPoint('test2');
		expect(minRand.getDataset()).toContain(randPoint);
		expect(minRand.getUsedDataPointArray('test2')).toContain(randPoint);
	});

	test('removing datapoint removes it everywhere', () => {
		var beforeDataset = minRand.getDataset().slice();
		var beforeUsedPoints = minRand.getUsedDataPointArray('test2').slice();
		var rand = minRand.getUsedDataPointArray('test2').slice();
		var afterDataset = beforeDataset.filter(e => e !== rand[0]);
		var afterUsedPoints = beforeUsedPoints.filter(e => e !== rand[0]);
		minRand.removeDatasetPoint(rand[0]);
		expect(minRand.getDataset()).toStrictEqual(afterDataset);
		expect(minRand.getUsedDataPointArray('test2')).toStrictEqual(afterUsedPoints);
	});

	test('getUsedDataPointArray returns array', () => {
		expect(minRand.getUsedDataPointArray('test2')).toBeInstanceOf(Array);
	});

	test('setUsedDataPointArray to string throws error', () => {
		expect(() => minRand.setUsedDataPointArray('test')).toThrow(TypeError);
	});

	test('setUsedDataPointArray', () => {
		minRand.setUsedDataPointArray('test2-3', ['1', '8']);

		expect(minRand.getUsedDataPointArray('test2-3')).toStrictEqual(['1', '8']);
	});

	test('adding used datapoint on non-existant key throws error', () => {
		expect(() => minRand.addUsedDataPoint('nonexist2', '1024')).toThrow(NotExistsError);
	});

	test('adding used datapoint that doesn\'t exist in datapoints array throws error', () => {
		expect(() => minRand.addUsedDataPoint('test2', '1024')).toThrow(NotExistsError);
	});

	test('adding existing used datapoint throws error', () => {
		var value = minRand.getUsedDataPointArray('test2')[0];
		expect(() => minRand.addUsedDataPoint('test2', value)).toThrow(ExistsError);
	});
});

describe('MinRand with usedDataPoints, randomness test', () => {
	const minRand = new MinRand(DATASET.slice(), Object.assign({}, USED_DATA_POINTS));

	test('reset works', () => {
		minRand.addUsedDataPointKey('test2-4');
		var resetFloor = Math.floor((minRand.getDataset().length - 1) * minRand.getUsedResetPercentage()) + 1;

		for (var i = 0; i < resetFloor; i++) {
			minRand.getRandomDataPoint('test2-4');
		}

		expect(minRand.getUsedDataPointArray('test2-4').length).toBe(resetFloor);

		// This should trigger a reset
		minRand.getRandomDataPoint('test2-4');

		expect(minRand.getUsedDataPointArray('test2-4').length < resetFloor).toBe(true);
	});
});