const fs = require('fs');
const URL = require('url');
const HCCrawler = require('headless-chrome-crawler');
const BaseCache = require('headless-chrome-crawler/cache/base');

const _ = require('lodash');

const minimal_args = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-sandbox',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

const FILE = './fs-cache.json';

const crawledURLs = [] // ['https://rarchy.com/cookie-policy', 'https://rarchy.com/privacy-policy', 'https://rarchy.com/sitemaps']

var customCache = {}

// Create a new cache by extending BaseCache interface
class FsCache extends BaseCache {
  init() {
    // console.log(this._settings)
    // fs.writeFileSync(this._settings.file, '{}');∫
    // customCache = {}
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

    if (crawledURLs.includes(value)) {
      console.log(`Not enqueing ${value[0].url}`)
    }

    if (!crawledURLs.includes(value[0].url)) {
      const queue = customCache[key] || [];
      const item = { value, priority };
      queue.push(item);
      queue.sort((a, b) => b.priority - a.priority);
      customCache[key] = queue;
    }

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

const LIMIT = 50;

const cache = new FsCache({ file: FILE });

try {

  (async () => {

    const url = "https://www.cemex.com/";
    const domain = getRoot(url); // DOMAIN NEEDS TO BE WITHOUT PROTOCOL

    const crawler = await HCCrawler.launch({
      cache,
      maxConcurrency: 10,
      ignoreHTTPSErrors: true,
      args: minimal_args,
      // headless: false,
      headless: true,
      maxDepth: Infinity,
      allowedDomains: [domain],
      retryCount: 1,
      retryDelay: 3000,
      waitUntil: 'domcontentloaded',
      timeout: 10000,
      jQuery: false,
      skipRequestedRedirect: true, // NEED THIS OR WHEN MAXCONCURRENCY > 1, DUPLICATE URLS WILL BE CRAWLED IN PARALLEL
      // userAgent: "Rarchy/bot (+https://www.rarchy.com)",
      waitFor: {
        options: {},
        selectorOrFunctionOrTimeout: function () {
          const documentHeight = document.documentElement.scrollHeight;
          window.scrollTo(0, documentHeight);
          // You might want to check if there are any elements still loading (look for spinners, other indicators, or just wait)
          // Return true if you are done scrolling, false otherwise
          return true;
        },
      },
      customCrawl: async (page, crawl) => {
        // You can access the page object before requests
        await page.setRequestInterception(true);
        page.on('request', request => {
          if (request.resourceType() === 'image') return request.abort(); // disabled image loading
          if (request.resourceType() === 'stylesheet' || request.resourceType() === 'font') return request.abort() // disable fonts/css
          // if (request.url().includes('json')) return request.abort() // disable json
          // if (!request.url().includes(domain)) return request.abort() // only if request is on same domain
          else request.continue();
        });
        // The result contains options, links, cookies and etc.
        const result = await crawl();
        // You can access the page object after requests
        result.content = await page.content();
        // You need to extend and return the crawled result
        return result;
      },
      onSuccess: async result => {
        crawledURLs.push(result.options.url);
        const crawledPagesCount = crawledURLs.length;
        console.log(`Crawled ${crawledPagesCount} pages: ${result.options.url}`);
        // crawledURLs.push(results.option.url);
        if (crawledPagesCount === LIMIT) {
          await crawler.pause();
          await stopCrawler();
        }
      },
      onError: async error => {
        console.log(`ERROR!!!, ${error}`);
      }
    });

    async function stopCrawler() {
      await crawler.onIdle();
      await crawler.close();
      console.log(crawledURLs);
    }

    if (!_.isEmpty(crawledURLs)) {
      const lastURLCrawled = crawledURLs.pop();
      await crawler.queue(lastURLCrawled);
    } else {
      await crawler.queue(url);
    }

    await stopCrawler()

  })();

} catch (e) {
  console.error(e)
}

function getRoot(domain) {
  const myUrl = URL.parse(domain);
  return myUrl.host;
}