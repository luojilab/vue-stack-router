import { strict as assert } from 'assert';
import { Component, VueConstructor } from 'vue';
import { IRouter } from '../../src/interface/router';
import installer from '../../src/lib/installer';
describe('src/lib/installer.ts', () => {
  it('should be ok', () => {
    // const router: IRouter<Component> = {} as IRouter<Component>;
    // const component = 'component';
    // class Vue {
    //   public component(name: string, c: string) {
    //     assert.equal(component, c);
    //     assert.equal(name, 'RouterView');
    //   }
    // }

    // installer.install(Vue as VueConstructor, { router });
    // assert.equal((Vue.prototype as any).$router, router);
  });
});
