import canceler from '../../domRegister';
// tslint:disable-next-line: ordered-imports
import { strict as assert } from 'assert';
import BrowserDriver from '../../../src/driver/browser/BrowserDriver';
describe('src/driver/browser/BrowserDriver', () => {
  after(() => {
    console.log('aaa',canceler)
    canceler();
  });
  it('invoksrc/driver/browser/BrowserDrivereHook should be ok', () => {
    const a = new BrowserDriver();
  });
});
