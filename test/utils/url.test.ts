import { strict as assert } from 'assert';
import { getPathnameAndQuery, parseSearchStr, parseToSearchStr } from '../../src/utils/url';

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

    const obj4: any = parseSearchStr('?a=1&b=%28b+a');
    assert.equal(obj4.a, '1');
    assert.equal(obj4.b, '(b a');
    const obj5: any = parseSearchStr('');
    assert.equal(Object.keys(obj5).length, 0);
  });
  it('parseToSearchStr should be ok', () => {
    const search1: string = parseToSearchStr({ a: 123, b: 'hah' });
    assert.equal(search1, '?a=123&b=hah');

    const search2: string = parseToSearchStr({ a: undefined, b: 'wow' });
    assert.equal(search2, '?a=&b=wow');

    const search3: string = parseToSearchStr({ a: 123 });
    assert.equal(search3, '?a=123');

    const search4: string = parseToSearchStr({});
    assert.equal(search4, '');

    const search5: string = parseToSearchStr({ a: '(b a' });
    assert.equal(search5, '?a=%28b+a');
  });
  it('getPathnameAndQuery should be ok', () => {
    const { pathname, query } = getPathnameAndQuery('/mmm/nnn?a=123&b=hah');
    assert.equal(pathname, '/mmm/nnn');
    assert.equal(query.a, '123');
    assert.equal(query.b, 'hah');

    const r2 = getPathnameAndQuery('/mmm/nnn?');
    assert.equal(r2.pathname, '/mmm/nnn');
    assert.equal(Object.keys(r2.query).length, 0);

    const r3 = getPathnameAndQuery('/mmm/nnn');
    assert.equal(r3.pathname, '/mmm/nnn');
    assert.equal(Object.keys(r3.query).length, 0);
  });
});
