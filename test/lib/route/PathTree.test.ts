import { strict as assert } from 'assert';
import PathTree from '../../../src/lib/route/PathTree';
describe('src/lib/route/PathTree.ts', () => {
  it('PathTree should be ok', () => {
    const pathTree = new PathTree<string>();
    pathTree.addPath(['a', 'b', 'c'], 'abc');
    pathTree.addPath(['a', '*'], 'a*');
    pathTree.addPath(['a', ':b', 'c', 'd'], 'a:bcd');

    pathTree.addPath(['x', '*', 'any'], '*any');

    assert(pathTree.getDataAndParamsByPaths(['a', 'b', 'c']));
    assert.equal(pathTree.getDataAndParamsByPaths(['a', 'b', 'c'])!.data, 'abc');
    assert.equal(pathTree.getDataAndParamsByPaths(['b', 'b', 'c']), undefined);
    assert.notEqual(pathTree.getDataAndParamsByPaths(['a', 'b', 'c', 'd']), undefined);
    assert.equal(pathTree.getDataAndParamsByPaths(['a', 'x', 'c', 'd'])!.data, 'a:bcd');
    assert.equal(pathTree.getDataAndParamsByPaths(['a', 'x', 'c', 'd'])!.params.b, 'x');
    assert.equal(pathTree.getDataAndParamsByPaths(['x', 'x', 'c', 'd'])!.data, '*any');
  });
});
