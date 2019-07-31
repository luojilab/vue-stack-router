import { strict as assert } from 'assert';
import Vue from 'vue';
import { ViewActionType } from '../../src/types';
import invokeHook from '../../src/utils/invokeHook';

describe('src/utils/invokeHook', () => {
  it('invokeHook should be ok', done => {
    const mockInstance: any = {
      $options: {
        willAppear() {
          done();
        }
      }
    };
    invokeHook(mockInstance as Vue, ViewActionType.WILL_APPEAR);
  });

  it('invokeHook should be ok when has children', done => {
    const children: any = {
      $options: {
        willAppear() {
          done();
        }
      }
    };
    const mockInstance: any = {
      $children: [children as Vue],
      $options: {}
    };
    invokeHook(mockInstance as Vue, ViewActionType.WILL_APPEAR);
  });
});
