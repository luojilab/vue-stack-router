import { expect } from 'chai';
import idMaker from '../../src/utils/idMaker';

describe('src/utils/idMaker.ts', () => {
  it('should be ok', () => {
    const id1 = idMaker();
    const id2 = idMaker();
    expect(id1).to.not.eq(id2);
  });
});
