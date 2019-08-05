import { strict as assert } from 'assert';
import ServerDriver from '../../../src/driver/browser/ServerDriver';
import { RouteActionType, RouteDriverEventType } from '../../../src/types';
import { sleep } from '../../helpers/utils';

describe('src/driver/browser/ServerDriver', () => {
  it('ServerDriver#push should be ok', done => {
    const driver = new ServerDriver();
    driver.on(RouteDriverEventType.CHANGE, record => {
      try {
        assert.equal(record.type, 'push');
        assert.equal(record.state, 'state');
        assert.equal(record.payload, 'payload');
        done();
      } catch (error) {
        done(error);
      }
    });
    driver.push('/test', 'state', 'payload');
  });

  describe('ServerDriver#pop', () => {
    it('pop 0 should be ok', done => {
      const driver = new ServerDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      driver.push('/test3', 'state3', 'payload3');
      driver.on(RouteDriverEventType.CHANGE, record => {
        assert.equal(record.type, 'pop');
        assert.equal(record.state, 'state2');
        assert.equal(record.payload, 'popPayload');
        done();
      });
      driver.pop(0, 'popPayload');
    });
    it('pop 2 should be ok', done => {
      const driver = new ServerDriver();
      driver.push('/test1', 'state1', 'payload1');
      driver.push('/test2', 'state2', 'payload2');
      driver.push('/test3', 'state3', 'payload3');
      driver.on(RouteDriverEventType.CHANGE, record => {
        assert.equal(record.type, 'pop');
        assert.equal(record.state, 'state1');
        assert.equal(record.payload, 'popPayload');
        done();
      });
      driver.pop(2, 'popPayload');
    });
  });

  it('ServerDriver#replace should be ok', done => {
    const driver = new ServerDriver();
    driver.push('/test1', 'state1', 'payload1');
    driver.on(RouteDriverEventType.CHANGE, record => {
      assert.equal(record.type, 'replace');
      assert.equal(record.state, 'state2');
      assert.equal(record.payload, 'payload2');
      done();
    });
    driver.replace('/test2', 'state2', 'payload2');
  });

  it('ServerDriver#generateNextId should be ok', done => {
    const driver = new ServerDriver();
    const id = driver.generateNextId();
    driver.on(RouteDriverEventType.CHANGE, record => {
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
  it('ServerDriver#deprecatedId should be ok', done => {
    const driver = new ServerDriver();
    const id = driver.generateNextId();
    driver.deprecateNextId();
    driver.on(RouteDriverEventType.CHANGE, record => {
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
});
