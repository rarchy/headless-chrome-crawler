const fs = require('fs');
const HCCrawler = require('headless-chrome-crawler');
const BaseCache = require('headless-chrome-crawler/cache/base');

const FILE = './fs-cache.json';

var customCache = {}

// Create a new cache by extending BaseCache interface
class FsCache extends BaseCache {
  init() {
    // console.log(this._settings)
    // fs.writeFileSync(this._settings.file, '{}');
    customCache = {}
    return Promise.resolve();
  }

  clear() {
    customCache = {}
    // fs.unlinkSync(this._settings.file);
    return Promise.resolve();
  }

  close() {
    return Promise.resolve();
  }

  get(key) {
    const obj = customCache //  JSON.parse(fs.readFileSync(this._settings.file));
    return Promise.resolve(obj[key] || null);
  }

  set(key, value) {
    // const obj = JSON.parse(fs.readFileSync(this._settings.file));
    // obj[key] = value;
    customCache[key] = value;
    // fs.writeFileSync(this._settings.file, JSON.stringify(obj));
    return Promise.resolve();
  }

  enqueue(key, value, priority) {
    /* const obj = JSON.parse(fs.readFileSync(this._settings.file));
    const queue = obj[key] || [];
    const item = { value, priority };
    queue.push(item);
    queue.sort((a, b) => b.priority - a.priority);
    obj[key] = queue;
    fs.writeFileSync(this._settings.file, JSON.stringify(obj)); */

    const queue = customCache[key] || [];
    const item = { value, priority };
    queue.push(item);
    queue.sort((a, b) => b.priority - a.priority);
    customCache[key] = queue;

    return Promise.resolve();
  }

  dequeue(key) {
    /* const obj = JSON.parse(fs.readFileSync(this._settings.file));
    const queue = obj[key] || [];
    const item = queue.shift();
    fs.writeFileSync(FILE, JSON.stringify(obj));
    if (!item) return Promise.resolve(null);
    return Promise.resolve(item.value); */

    const queue = customCache[key] || [];
    const item = queue.shift();
    if (!item) return Promise.resolve(null);
    return Promise.resolve(item.value)

  }

  size(key) {
    const obj = customCache // JSON.parse(fs.readFileSync(this._settings.file));
    if (!obj[key]) return Promise.resolve(0);
    return Promise.resolve(obj[key].length);
  }

  remove(key) {
    // const obj = JSON.parse(fs.readFileSync(this._settings.file));
    // delete obj[key];
    delete customCache[key]
    // fs.writeFileSync(FILE, JSON.stringify(obj));
    return Promise.resolve();
  }
}

const cache = new FsCache({ file: FILE, hello: 'hello' });

(async () => {
  console.log('called');
  const crawler = await HCCrawler.launch({
    maxConcurrency: 1,
    skipDuplicates: true,
    jQuery: false,
    maxDepth: 1000,
    onSuccess: async result => {
      console.log(`Requested ${result.options.url}.`);
      console.log(await crawler.pendingQueueSize())
      console.log(await crawler.requestedCount())
    },
    cache,
  });
  await crawler.queue('https://rarchy.com');
  await crawler.onIdle();
  await crawler.close();
})();
