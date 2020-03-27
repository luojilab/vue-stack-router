import { strict as assert } from 'assert';
import ServerDriver from '../../src/driver/Server';
import { Location, RouteActionType } from '../../src/interface/common';
import { PopNavigationOptions, RouteConfig, Router, RouteEventType } from '../../src/interface/router';
import RouteManager from '../../src/lib/route/RouteManager';
import StackRouter from '../../src/lib/Router';

/* eslint-disable @typescript-eslint/explicit-function-return-type,@typescript-eslint/no-non-null-assertion,@typescript-eslint/no-explicit-any */

describe('src/lib/Router.ts', () => {
  describe('Router#constructor', () => {
    it('router options should be ok', () => {
      const driver = new ServerDriver();
      driver.push('test');
      const router = new StackRouter<string>(
        { routes: [{ path: 'test', component: 'bbb' }, { path: 'hh', component: 'aaaa' }] },
        driver
      );
      assert(router.currentRouteInfo);
      assert.equal(router.currentRouteInfo!.route.path, 'test');
    });
    it('router options with redirect should be ok', () => {
      const driver = new ServerDriver();
      driver.push('test');
      const router = new StackRouter<string>(
        { routes: [{ path: 'test', component: 'bbb', redirect: 'hh' }, { path: 'hh', component: 'aaaa' }] },
        driver
      );
      assert(router.currentRouteInfo);
      assert.equal(router.currentRouteInfo!.route.path, '/hh');

      const driver1 = new ServerDriver();
      driver1.push('test/?b=1');
      const router1 = new StackRouter<string>(
        {
          routes: [
            {
              path: 'test',
              component: 'bbb',
              redirect: to => {
                assert.equal(to.query.b, '1');
                return { pathname: 'hh', query: { c: 2 } };
              }
            },
            { path: 'hh', component: 'aaaa' }
          ]
        },
        driver1
      );
      assert(router1.currentRouteInfo);
      assert.equal(router1.currentRouteInfo!.route.path, '/hh?c=2');
    });
  });
  describe('Router#push', () => {
    it('string location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new StackRouter({ routes: [] }, new TestDriver());
      router.push('test');
    });
    it('path should be normalized ', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test?a=1');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new StackRouter({ routes: [] }, new TestDriver());
      router.push('test/?a=1');
    });
    it('pathname location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test3?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new StackRouter({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 }
      });
    });
    it('named location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test1?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const routes = [
        {
          path: 'test1',
          name: 'testName',
          component: 'aa'
        }
      ];
      const router = new StackRouter<string>({ routes }, new TestDriver());
      router.push({
        name: 'testName',
        query: { a: 2 }
      });
    });
    it('named location with params should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test1/2?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const routes = [
        {
          path: '/test1/:id',
          name: 'testName',
          component: 'aa'
        }
      ];
      const router = new StackRouter<string>({ routes }, new TestDriver());
      router.push({
        name: 'testName',
        params: { id: 2 },
        query: { a: 2 }
      });
    });
    it('state should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test3?a=2');
          assert.equal(state, 'state');
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new StackRouter({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 },
        state: 'state'
      });
    });
    it('transition should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, '/test3?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, 'transition');
        }
      }
      const router = new StackRouter({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 },
        transition: 'transition'
      });
    });
  });
  describe('Router#pop', () => {
    it('empty stack should be ok', (done) => {
      class TestDriver extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          done()
        }
      }
      const routeManager = new RouteManager<RouteConfig<string>>();
      const router = new StackRouter({ routes: [] }, new TestDriver(), routeManager);
      router.pop();
      routeManager.register({
        component: '',
        path: '/test'
      });
    });
    it('empty parameter should be ok', done => {
      class TestDriver extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          assert.equal(n, 1);
          assert.equal((payload as any).transition, undefined);
          done();
        }
      }
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];
      const router = new StackRouter({ routes }, new TestDriver());
      router.push('test1');
      router.push('test1');
      router.pop();
    });
  });
  it('Router#replace');
  it('Router#popToBottom', () => {
    const router: Router<string> = getTestRouter();
    router.replace('/?a=1');
    router.push('/b?a=1');
    router.push('/c?b=3');
    router.popToBottom();
    assert.notEqual(router.currentRouteInfo, undefined);
    assert.equal(router.currentRouteInfo!.config.component, 'componentA');
    assert.equal(router.currentRouteInfo!.config.path, '/');
    assert.equal(router.currentRouteInfo!.index, 0);
    assert.equal(router.currentRouteInfo!.route.name, '');
  });
  describe('Router#prepush', () => {
    it('route info should be correct', done => {
      let id: string | undefined;
      class TestDriver extends ServerDriver {
        public generateNextId() {
          id = super.generateNextId();
          return id;
        }
      }
      const driver = new TestDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new StackRouter({ routes }, driver);
      router.on(RouteEventType.WILL_CHANGE, (type, route, transitionOption) => {
        assert.equal(type, RouteActionType.PUSH);
        assert(route);
        assert.equal(route!.index, 1);
        assert.equal(route!.route.id, id);
        assert.equal(route!.route.path, '/test1?a=3');
        done();
      });
      router.prepush('/test1?a=3');
      assert(id);
    });
    it('incorrect path should be ok', done => {
      class TestDriver extends ServerDriver {
        public deprecateNextId() {
          done();
        }
      }
      const driver = new TestDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new StackRouter({ routes }, driver);
      router.on(RouteEventType.WILL_CHANGE, (type, route, transitionOption) => {
        assert.fail('should not emit events');
      });
      router.prepush('/test2?a=3');
    });
    it('cancel prepush should be ok', done => {
      let deprecatedNextId = false;
      class TestDriver extends ServerDriver {
        public deprecateNextId() {
          deprecatedNextId = true;
        }
      }
      const driver = new TestDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new StackRouter({ routes }, driver);
      router.on(RouteEventType.CANCEL_CHANGE, route => {
        assert(deprecatedNextId);
        done();
      });
      const confirm = router.prepush('/test1?a=3');
      confirm(true);
    });
    it('confirm prepush should be ok', done => {
      class TestRouter extends StackRouter<string> {
        public push(path: Location) {
          assert.equal(path, '/test1?a=3');
          done();
        }
      }
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new TestRouter({ routes }, driver);
      const confirm = router.prepush('/test1?a=3');
      confirm();
    });
  });
  describe('Router#prepop', () => {
    it('empty stack should be ok', () => {
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const router = new StackRouter({ routes }, driver);
      router.on(RouteEventType.WILL_CHANGE, type => {
        assert.fail('should not emit events');
      });
      router.prepop();
    });
    it('prepop with confirm should be ok', done => {
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const router = new StackRouter({ routes }, driver);
      driver.push('/test1?a=3');

      router.on(RouteEventType.WILL_CHANGE, (type, route, transition) => {
        assert.equal(type, RouteActionType.POP);
        assert(route);
        assert.equal(route!.index, 0);
        assert.equal(route!.route.path, '/test1?a=2');
        done();
      });
      router.prepop();
    });
    it('cancel prepop should be ok', done => {
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new StackRouter({ routes }, driver);
      driver.push('/test1?a=3');
      router.on(RouteEventType.CANCEL_CHANGE, route => {
        done();
      });
      const confirm = router.prepop();
      confirm(true);
    });
    it('confirm prepop should be ok', done => {
      class TestRouter extends StackRouter<string> {
        public pop<T extends Partial<PopNavigationOptions>>(option?: T) {
          assert.equal(option!.transition, 'test');
          done();
        }
      }
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new TestRouter({ routes }, driver);
      driver.push('/test1?a=3');
      driver.push('/test1?a=4');

      const confirm = router.prepop({ transition: 'test', n: 2 });
      confirm();
    });
    it('invalid prepop params should be ok', done => {
      class TestRouter extends StackRouter<string> {
        public pop<T extends Partial<PopNavigationOptions>>(option?: T) {
          assert.equal(option!.transition, 'test');
          done();
        }
      }
      const driver = new ServerDriver();
      driver.push('/test1?a=2');
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];

      const router = new TestRouter({ routes }, driver);
      driver.push('/test1?a=3');
      driver.push('/test1?a=4');

      const confirm = router.prepop({ transition: 'test', n: 100 });
      confirm();
    });
  });
  it('Router#prereplace');
});

function getTestRouter(): Router<string> {
  const routes: Array<RouteConfig<string>> = [
    {
      path: '/',
      component: 'componentA'
    },
    {
      path: '/b',
      component: 'componentB'
    },
    {
      path: '/c',
      component: 'componentC'
    }
  ];
  const driver = new ServerDriver();
  const router = new StackRouter({ routes }, driver);
  return router;
}
