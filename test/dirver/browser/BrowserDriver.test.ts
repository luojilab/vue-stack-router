import { strict as assert } from 'assert';
import BrowserDriver from '../../../src/driver/browser/BrowserDriver';
import { RouteDriverEventType } from '../../../src/types';
import { register, reject } from '../../domRegister';
describe('src/driver/browser/BrowserDriver', () => {
  before(() => register());
  after(() => reject());
  it('BrowserDriver#push should be ok', done => {
    const driver = new BrowserDriver();
    driver.on(RouteDriverEventType.CHANGE, record => {
      if (record.path === '/test') {
        assert.equal(record.state, 'state');
        assert.equal(record.payload, 'payload');
        assert.equal(window.history.state.__routeState.id, record.id);
        assert.equal(window.history.state.__routeState.state, record.state);
        done();
      }
    });
    driver.push('/test', 'state', 'payload');
  });
});
