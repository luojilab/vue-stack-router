import { JSDOM } from 'jsdom';
export function register(): void {
  const dom = new JSDOM('', {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000
  });
  globalThis.window = (dom.window as unknown) as (Window & typeof globalThis);
  globalThis.PopStateEvent = dom.window.PopStateEvent;
}
export function reject(): void {
  delete globalThis.window;
}
