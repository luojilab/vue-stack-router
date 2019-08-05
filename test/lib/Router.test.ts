import { strict as assert } from 'assert';
import ServerDriver from '../../src/driver/browser/ServerDriver';
import Router from '../../src/lib/Router';
import { IRouteConfig, IRouter } from '../../src/types';

describe('src/lib/Router.ts', () => {
  it('Router#push');
  it('Router#pop');
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
