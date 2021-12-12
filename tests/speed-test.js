const DATASET = [22, 75, 93, 9, 47, 76, 16, 1, 66, 44, 2, 13, 7, 33, 3, 26, 82, 94, 15, 80, 68, 67, 40, 84, 8, 11, 17, 92, 96, 19, 71, 77, 42, 58, 24, 43, 51, 97, 85, 99, 57, 32, 27, 23, 98, 34, 37, 35, 63, 88, 54, 48, 49, 62, 52, 12, 21, 30, 0, 25, 74, 29, 83, 5, 28, 91, 45, 65, 31, 18, 36, 6, 87, 81, 41, 14, 20, 90, 95, 70, 60, 73, 38, 72, 79, 55, 50, 46, 86, 64, 10, 61, 53, 89, 59, 69, 56, 4, 39, 78];
const TIMES = 100000;
const TYPE = 'BOTH'; // JSRAND/MINRAND/BOTH
const DEBUG = false;

const MinRand = require('..');
const startTime = Date.now();

function testJSRand(cb) {
	var rand = [];

	for (var i = 0; i < TIMES; i++) {
		rand.push(DATASET[Math.floor(Math.random() * DATASET.length)]);
	}

	cb(rand);
}

function testMinRand(cb) {
	var rand = [];
	var minrand = new MinRand(DATASET.slice());
	minrand.addUsedDataPointKey('test');

	for (var i = 0; i < TIMES; i++) {
		rand.push(minrand.getRandomDataPoint('test'));
	}

	cb(rand);
}

console.log(`Testing ${TIMES} times`);

switch (TYPE) {
	case 'JSRAND':
		testJSRand(function(data) {
			console.log(TYPE);
			if (DEBUG) {
				console.log('-----');
				console.log(data);
				console.log('-----');
			}
			console.log(`Time: ${Date.now() - startTime}ms`);
		});
		break;
	case 'MINRAND':
		testMinRand(function(data) {
			console.log(TYPE);
			if (DEBUG) {
				console.log('-----');
				console.log(data);
				console.log('-----');
			}
			console.log(`Time: ${Date.now() - startTime}ms`);
		});
		break;
	case 'BOTH':
		var startTimeJS = Date.now();
		testJSRand(function(data) {
			console.log('JSRAND');
			if (DEBUG) {
				console.log('-----');
				console.log(data);
				console.log('-----');
			}
			console.log(`Time: ${Date.now() - startTimeJS}ms`);

			var startTimeMR = Date.now();
			testMinRand(function(data) {
				console.log('MINRAND');
				if (DEBUG) {
					console.log('-----');
					console.log(data);
					console.log('-----');
				}
				console.log(`Time: ${Date.now() - startTimeMR}ms`);
			});
		});
		break;
	default:
		throw new Error('Invalid type');
}