import { expect } from 'chai';
import RouteManager, { PathTree } from '../../src/lib/RouteManager';
describe('src/lib/RouteManager.ts', () => {
  it('PathTree should be ok', () => {
    const pathTree = new PathTree<string>();
    pathTree.addPath(['a', 'b', 'c'], 'abc');
    pathTree.addPath(['a', '*'], 'a*');
    pathTree.addPath(['a', ':b', 'c', 'd'], 'a:bcd');

    // tslint:disable-next-line:no-unused-expression
    expect(pathTree.getDataAndParamsByPaths(['a', 'b', 'c'])).not.be.undefined;
    expect(pathTree.getDataAndParamsByPaths(['a', 'b', 'c'])!.data).be.equal('abc');
    // tslint:disable-next-line:no-unused-expression
    expect(pathTree.getDataAndParamsByPaths(['b', 'b', 'c'])).be.undefined;
    // tslint:disable-next-line:no-unused-expression
    expect(pathTree.getDataAndParamsByPaths(['a', 'b', 'c', 'd'])).not.be.undefined;
    expect(pathTree.getDataAndParamsByPaths(['a', 'x', 'c', 'd'])!.data).be.equal('a:bcd');
    expect(pathTree.getDataAndParamsByPaths(['a', 'x', 'c', 'd'])!.params.b).be.equal('x');
  });
});
