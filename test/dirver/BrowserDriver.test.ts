import { strict as assert } from 'assert';
import BrowserDriver, { Mode } from '../../src/driver/Browser';
import { RouteDriverEventType } from '../../src/types';
import { register, reject } from '../domRegister';
import { sleep } from '../helpers/utils';

describe('src/driver/browser/BrowserDriver', () => {
  beforeEach(() => register());
  afterEach(() => reject());
  it('BrowserDriver#getCurrentRouteRecord', () => {
    const driver = new BrowserDriver();
    const record = driver.getCurrentRouteRecord();
    assert.equal(record.path, '/');
    assert.equal(record.state, undefined);
    assert.equal(window.history.state.__routeState.id, record.id);
    assert.equal(window.location.hash, '#/');
  });

  it('BrowserDriver#push should be ok', done => {
    const driver = new BrowserDriver();
    driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
      if (record.path === '/test') {
        try {
          assert.equal(type, 'push');
          assert.equal(record.state, 'state');
          assert.equal(payload, 'payload');
          assert.equal(window.history.state.__routeState.id, record.id);
          assert.equal(window.history.state.__routeState.state, record.state);
          assert.equal(window.location.hash, '#/test');
          done();
        } catch (error) {
          done(error);
        }
      }
    });
    driver.push('/test', 'state', 'payload');
  });

  describe('BrowserDriver#pop', () => {
    it('pop 0 should be ok', done => {
      const driver = new BrowserDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      driver.push('/test3', 'state3', 'payload3');
      driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
        assert.equal(type, 'pop');
        assert.equal(record.state, 'state2');
        assert.equal(payload, 'popPayload');

        assert.equal(window.location.hash, '#/test2');
        done();
      });
      driver.pop(0, 'popPayload');
    });
    it('pop 2 should be ok', done => {
      const driver = new BrowserDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      driver.push('/test3', 'state3', 'payload3');
      driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
        assert.equal(type, 'pop');
        assert.equal(record.state, 'state1');
        assert.equal(payload, 'popPayload');
        assert.equal(window.history.state.__routeState.id, record.id);
        assert.equal(window.history.state.__routeState.state, record.state);
        assert.equal(window.location.hash, '#/test1');
        done();
      });
      driver.pop(2, 'popPayload');
    });
  });

  it('BrowserDriver#replace should be ok', done => {
    const driver = new BrowserDriver();
    driver.push('/test1', 'state1', 'payload1');
    driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
      assert.equal(type, 'replace');
      assert.equal(record.state, 'state2');
      assert.equal(payload, 'payload2');
      assert.equal(window.history.state.__routeState.id, record.id);
      assert.equal(window.history.state.__routeState.state, record.state);
      assert.equal(window.location.hash, '#/test2');
      assert.equal(window.history.length, 2);
      done();
    });
    driver.replace('/test2', 'state2', 'payload2');
  });
  describe('Browser actions', () => {
    it('history.back() should be ok', done => {
      const driver = new BrowserDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
        assert.equal(type, 'pop');
        assert.equal(record.state, 'state1');
        assert.equal(payload, undefined);
        assert.equal(window.history.state.__routeState.id, record.id);
        assert.equal(window.history.state.__routeState.state, record.state);
        assert.equal(window.location.hash, '#/test1');
        done();
      });
      window.history.back();
    });

    it('history.go() should be ok', async () => {
      const driver = new BrowserDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      window.history.back();
      await sleep(100);
      window.history.go(1);
      await new Promise(resolve => {
        driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
          assert.equal(type, 'push');
          assert.equal(record.state, 'state2');
          assert.equal(payload, undefined);
          assert.equal(window.history.state.__routeState.id, record.id);
          assert.equal(window.history.state.__routeState.state, record.state);
          assert.equal(window.location.hash, '#/test2');
          resolve();
        });
      });
    });
    // it('new url should be ok', done => {
    //   const driver = new BrowserDriver();
    //   driver.on(RouteDriverEventType.CHANGE,  (type, record, payload) => {
    //     console.log('record', record);
    //

    //     assert.equal(record.path, '/hash');
    //     assert.equal(type, 'push');
    //     assert.equal(record.state, undefined);
    //     assert.equal(payload, undefined);
    //     assert.equal(window.history.state.__routeState.id, record.id);
    //     done();
    //   });
    //   window.location.hash = '#aaa';
    //   const event = new PopStateEvent('popstate', {
    //     state: ''
    //   });
    //   window.dispatchEvent(event);
    // });
  });

  it('BrowserDriver#generateNextId should be ok', done => {
    const driver = new BrowserDriver();
    const id = driver.generateNextId();
    driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
      if (record.path === '/test') {
        try {
          assert.equal(record.id, id);
          assert.equal((driver as any).nextId, undefined);
          done();
        } catch (error) {
          done(error);
        }
      }
    });
    driver.push('/test', 'state', 'payload');
  });
  it('BrowserDriver#deprecatedId should be ok', done => {
    const driver = new BrowserDriver();
    const id = driver.generateNextId();
    driver.deprecateNextId();
    driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
      if (record.path === '/test') {
        try {
          assert.notEqual(record.id, id);
          done();
        } catch (error) {
          done(error);
        }
      }
    });
    driver.push('/test', 'state', 'payload');
  });

  it('BrowserDriver#constructor should be ok ', done => {
    const driver = new BrowserDriver({ mode: Mode.history });

    driver.on(RouteDriverEventType.CHANGE, (type, record, payload) => {
      assert.equal(window.location.pathname, '/test1');
      assert.equal(window.location.hash, '');
      done();
    });
    driver.push('/test1', 'state1', 'payload1');
  });
});
