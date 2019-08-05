import { strict as assert } from 'assert';

import IdGenerator from '../../src/utils/IdGenerator';
import { sleep } from '../helpers/utils';

describe('src/utils/IdGenerator', () => {
  it('IdGenerator.generateId should be ok', () => {
    const id1 = IdGenerator.generateId();
    const id2 = IdGenerator.generateId();
    assert.notEqual(id1, id2);
    assert(IdGenerator.compare(id1, id2) < 0);
  });
  it('IdGenerator.generateId should be ok with multiple id', async () => {
    const id = IdGenerator.generateId();
    const ids: string[] = [];
    for (let i = 0; i < 10000; i++) {
      ids.push(IdGenerator.generateId());
    }
    await sleep(10);
    for (let i = 0; i < 10000; i++) {
      ids.push(IdGenerator.generateId());
    }
    ids.reduce((pre, current) => {
      assert(IdGenerator.compare(pre, current) < 0);
      return current;
    }, id);
  });
});
