import * as assert from 'assert';
import { parseSearchStr, parseToSearchStr } from '../../src/utils/url';

describe('src/utils/url.ts', () => {
  it('parseSearchStr should be ok', () => {
    const obj1: any = parseSearchStr('?a=1&b=2');
    assert.equal(obj1.a, '1');
    assert.equal(obj1.b, '2');

    const obj2: any = parseSearchStr('a=1&b=2');
    assert.equal(obj2.a, '1');
    assert.equal(obj2.b, '2');

    const obj3: any = parseSearchStr('a&b=2');
    assert.equal(obj3.a, '');
    assert.equal(obj3.b, '2');
  });
  it('parseToSearchStr should be ok', () => {
    const search1: string = parseToSearchStr({a: 123, b: 'hah'});
    assert.equal(search1, '?a=123&b=hah');
    const search2: string = parseToSearchStr({a: undefined, b: 'wow'});
    assert.equal(search2, '?a=&b=wow');
    const search3: string = parseToSearchStr({a: 123});
    assert.equal(search3, '?a=123');
    const search4: string = parseToSearchStr({});
    assert.equal(search4, '');
  });
});
