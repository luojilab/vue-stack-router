import { strict as assert } from 'assert';
import ServerDriver from '../../src/driver/Server';
import RouteManager from '../../src/lib/route/RouteManager';
import Router from '../../src/lib/Router';
import { IRouteConfig, IRouter, IRouterDriver } from '../../src/types';
// tslint:disable: max-classes-per-file

describe('src/lib/Router.ts', () => {
  describe('Router#push', () => {
    it('string location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.push('test');
    });
    it('path should be normalized ', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test?a=1');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.push('/test/?a=1');
    });
    it('pathname location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test3?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 }
      });
    });
    it('named location should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test1?a=2');
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
      const router = new Router<string>({ routes }, new TestDriver());
      router.push({
        name: 'testName',
        query: { a: 2 }
      });
    });
    it('named location with params should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test1/2?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, undefined);
        }
      }
      const routes = [
        {
          path: 'test1/:id',
          name: 'testName',
          component: 'aa'
        }
      ];
      const router = new Router<string>({ routes }, new TestDriver());
      router.push({
        name: 'testName',
        params: { id: 2 },
        query: { a: 2 }
      });
    });
    it('state should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test3?a=2');
          assert.equal(state, 'state');
          assert.equal((payload as any).transition, undefined);
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 },
        state: 'state'
      });
    });
    it('transition should be ok', () => {
      class TestDriver extends ServerDriver {
        public push(path: string, state?: unknown, payload?: unknown) {
          assert.equal(path, 'test3?a=2');
          assert.equal(state, undefined);
          assert.equal((payload as any).transition, 'transition');
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.push({
        pathname: '/test3',
        query: { a: 2 },
        transition: 'transition'
      });
    });
  });
  describe('Router#pop', () => {
    it('empty stack should be ok', () => {
      class TestDriver extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          assert.fail('should not trigger');
        }
      }
      const routeManager = new RouteManager<IRouteConfig<string>>();
      const router = new Router({ routes: [] }, new TestDriver(), routeManager);
      router.pop();
      routeManager.register('/test', '', {
        component: '',
        path: '/test'
      });
    });
    it('empty parameter should be ok', done => {
      class TestDriver extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          assert.equal(n, 1);
          assert.equal(payload, undefined);
          done();
        }
      }
      const routes = [
        {
          path: 'test1',
          component: 'aa'
        }
      ];
      const router = new Router({ routes }, new TestDriver());
      router.push('test1');
      router.push('test1');
      router.pop();
    });
    it('the wrong parameter n should be ok', () => {
      class TestDriver extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          assert.equal(1, 2);
          assert.equal(n, 1);
          assert.equal(payload, undefined);
        }
      }
      const router = new Router({ routes: [] }, new TestDriver());
      router.pop({ n: 100 });
      class TestDriver1 extends ServerDriver {
        public pop(n: number, payload?: unknown): void {
          assert.equal(n, 1);
          assert.equal(payload, undefined);
        }
      }
      const router1 = new Router({ routes: [] }, new TestDriver1());
      router1.pop({ n: 0 });
    });
  });
  it('Router#replace');
  it('Router#popToBottom', () => {
    const router: IRouter<string> = getTestRouter();
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
  it('Router#prepush');
  it('Router#prepop');
  it('Router#prereplace');
});

function getTestRouter(): IRouter<string> {
  const routes: Array<IRouteConfig<string>> = [
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
  const router = new Router({ routes }, driver);
  return router;
}
