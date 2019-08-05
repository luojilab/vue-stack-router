import { JSDOM } from 'jsdom';
export function register() {
  const dom = new JSDOM(``, {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000
  });
  globalThis.window = dom.window;
  globalThis.PopStateEvent = dom.window.PopStateEvent;
}
export function reject() {
  delete globalThis.window;
}
