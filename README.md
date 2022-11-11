# MinRand

MinRand was originally developed for a semi-private Twitch dad joke bot (yeah, I put way too much effort into the bot). Users of the bot were not happy with seeing the same joke multiple times in a short amount of time. Due to this (and the fact I was bored one day), I wrote a randomness algorithm that would keep a cache of the posted jokes to ensure that they won't be posted again until a certain percentage of the jokes have been posted. When this happens, the first half of the cache is deleted to allow for those jokes to be posted again.

I've separated the algorithm from the bot and made it open source so that it can be used in other projects too.

![Results](https://cdn.truewinter.net/i/22fbb5.png)

![Results](https://cdn.truewinter.net/i/84003f.png)

# Installation

You can either install MinRand from npm, or by downloading the latest release from [GitHub](https://github.com/TrueWinter/MinRand).

```sh
npm install -S minrand
```

# Usage

Using MinRand is simple.

```js
const DATASET = ['1', '2', '4', '8', '16', '32', '64', '128', '256'];

const minRand = new MinRand(DATASET);
// Default is 0.9, or 90%
minRand.setUsedResetPercentage(0.8);
/* The used datapoints are stored in a key-value store.
 * This allows you to use the same MinRand instance for multiple
 * keys (in this case, users).
 */
minRand.addUsedDataPointKey('user1');

var rand = minRand.getRandomDataPoint('user1');
```

If you persisted the key-value store, you can pass it into the constructor:

```js
const DATASET = ['1', '2', '4', '8', '16', '32', '64', '128', '256'];
const USED_DATA_POINTS = {
	user1: ['1', '4', '32'],
	user2: ['1', '4', '64', '128']
};

const minRand = new MinRand(DATASET, USED_DATA_POINTS);
// Default is 0.9, or 90%
minRand.setUsedResetPercentage(0.8);
/* The used datapoints are stored in a key-value store.
 * This allows you to use the same MinRand instance for multiple
 * keys (in this case, users).
 */
minRand.addUsedDataPointKey('user1');

var rand = minRand.getRandomDataPoint('user1');
```

If you don't need the key-value system, just assign a key that's used for all data.

For more information, check the [docs](https://minrand.truewinter.dev).

# Performance

MinRand is slow compared to normal randomness. Even using a custom filtering algorithm, getting 100000 random values from MinRand takes around 477ms. Using `Math.random()` to get the same number of values takes 10ms.

Due to this, you should only use MinRand where it is needed (see the important section below).

You can test the speed yourself by running `tests/speed-test.js`.

# Important

MinRand is intended for use cases where perceived randomness (the lack of repeated datapoints) is desired. Due to it reducing the actual randomness, it should not be used for security purposes, or any other use cases where actual randomess is important.
