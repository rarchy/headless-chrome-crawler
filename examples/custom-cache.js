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

const crawledURLs = ['https://rarchy.com/cookie-policy', 'https://rarchy.com/privacy-policy', 'https://rarchy.com/sitemaps']

var customCache = {}

// var customCache = { "queue": [{ "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/terms-of-service" }, 3, "https://rarchy.com/pricing"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/privacy-policy" }, 3, "https://rarchy.com/pricing"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/cookie-policy" }, 3, "https://rarchy.com/pricing"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/sitemaps" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/user-flow" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "http://rarchy.com/" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/sitemaps/visual-sitemap-generator" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/privacy-policy" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }, { "value": [{ "maxDepth": null, "priority": 0, "delay": 0, "retryCount": 1, "retryDelay": 10000, "timeout": 30000, "jQuery": false, "browserCache": true, "skipDuplicates": true, "depthPriority": true, "obeyRobotsTxt": true, "followSitemapXml": false, "skipRequestedRedirect": true, "cookies": null, "screenshot": null, "viewport": null, "allowedDomains": ["rarchy.com"], "waitUntil": "networkidle0", "waitFor": { "options": {} }, "url": "https://rarchy.com/cookie-policy" }, 3, "https://rarchy.com/terms-of-service"], "priority": 3 }], "https://rarchy.com/robots.txt": "User-agent: *\nDisallow: *hubs_\n\nSitemap: https://rarchy.com/sitemap.xml\n\n", "b147c262c9": "1", "ac11ef3f7f": "1", "8aa163db9c": "1", "6d4a0a9995": "1" }

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

const cache = new FsCache({ file: FILE, hello: 'hello' });

(async () => {

  const url = "https://rarchy.com";
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
    retryCount: 0,
    waitUntil: 'networkidle0',
    jQuery: false,
    skipRequestedRedirect: true, // NEED THIS OR WHEN MAXCONCURRENCY > 1, DUPLICATE URLS WILL BE CRAWLED IN PARALLEL
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
        if (request.url().includes('json')) return request.abort() // disable json
        if (!request.url().includes(domain)) return request.abort() // only if request is on same domain
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
      const crawledPagesCount = await crawler.requestedCount()
      console.log(`Crawled ${crawledPagesCount} pages: ${result.options.url}`);
      // crawledURLs.push(results.option.url);
      if (crawledPagesCount === 3) {
        // crawler.pause();
        // console.log('crawler paused');
        // console.log(JSON.stringify(customCache));
      }
      // console.log(`Got ${result.content} for ${result.options.url}.`);
    },
  });

  if (!_.isEmpty(crawledURLs)) {
    const lastURLCrawled = crawledURLs.pop();
    await crawler.queue(lastURLCrawled);
  } else {
    await crawler.queue(url);
  }
  await crawler.onIdle();
  console.log(crawledURLs);
  await crawler.close();
})();

function getRoot(domain) {
  const myUrl = URL.parse(domain);
  return myUrl.host;
}