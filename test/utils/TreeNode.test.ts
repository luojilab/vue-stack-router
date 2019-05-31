import { strict as assert } from 'assert';
import TreeNode from '../../src/utils/TreeNode';

describe('src/utils/TreeNode', () => {
  it('TreeNode#constructor() should be ok', () => {
    const node = new TreeNode<string>('hah');
    assert.equal(node.data, 'hah');
    assert(node.children instanceof Map);
    assert.equal(node.children.size, 0);
  });

  it('TreeNode#addChild() should be ok', () => {
    const node = new TreeNode<string>('hah');
    const childNode = new TreeNode<string>('valueA');
    node.addChild('key', childNode);
    assert.equal(node.children.get('key')!.data, 'valueA');
  });

  it('TreeNode#removeChild() should be ok', () => {
    const node = new TreeNode<string>('hah');
    const childNode = new TreeNode<string>('valueA');
    node.addChild('key', childNode);
    node.removeChild('key');
    assert.equal(node.children.size, 0);
  });

  it('TreeNode#getChild() should be ok', () => {
    const node = new TreeNode<string>('hah');
    const childNode = new TreeNode<string>('valueA');
    node.addChild('key', childNode);
    assert.equal(node.getChild('key')!.data, 'valueA');
  });
});
