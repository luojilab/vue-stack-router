import { strict as assert } from 'assert';

import IdGenerator from '../../src/utils/IdGenerator';

describe('src/utils/IdGenerator', () => {
  it('IdGenerator.generateId should be ok', () => {
    const id1 = IdGenerator.generateId();
    const id2 = IdGenerator.generateId();
    assert.notEqual(id1, id2);
    assert(IdGenerator.compare(id1, id2) < 0);
  });
});
