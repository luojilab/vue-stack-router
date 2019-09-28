import { Query } from '../../interface/common';
import TreeNode from '../../utils/TreeNode';

interface NodeData<T> {
  path: string;
  parameterName?: string;
  data: T | null;
}

interface MatchedPathNode<T> {
  node: TreeNode<T>;
  params: Query;
  final: boolean;
}

export default class PathTree<T> {
  public rootNode: TreeNode<NodeData<T>> = new TreeNode({ path: '/', data: null });

  public addPath(paths: string[], data: T): void {
    let currentNode = this.rootNode;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (path === '*') {
        const finalNode = new TreeNode({ path: '*', data });
        currentNode.addChild('*', finalNode);
        break;
      }
      const nodeData: NodeData<T> = { path, data: null };
      if (path[0] === ':') {
        nodeData.path = ':';
        nodeData.parameterName = path.replace(/^\:/, '');
      }
      if (i === paths.length - 1) {
        nodeData.data = data;
      }
      const node = currentNode.getChild(nodeData.path) || new TreeNode(nodeData);
      currentNode.addChild(nodeData.path, node);
      currentNode = node;
    }
  }
  public getDataAndParamsByPaths(paths: string[]): undefined | { params: Query; data: T } {
    let matchedPaths: Array<MatchedPathNode<NodeData<T>>> = [{ node: this.rootNode, params: {}, final: false }];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const currentMatchedPaths: Array<MatchedPathNode<NodeData<T>>> = [];
      for (let j = 0; j < matchedPaths.length; j++) {
        const currentPathNode = matchedPaths[j];
        if (currentPathNode.final) {
          currentMatchedPaths.push(currentPathNode);
          break;
        }
        const child = currentPathNode.node.getChild(path);
        if (child !== undefined) {
          currentMatchedPaths.push({
            node: child,
            params: currentPathNode.params,
            final: false
          });
        }
        const parameterChild = currentPathNode.node.getChild(':');
        if (parameterChild !== undefined && parameterChild.data.parameterName) {
          currentMatchedPaths.push({
            node: parameterChild,
            params: Object.assign(
              {
                [parameterChild.data.parameterName]: path
              },
              currentPathNode.params
            ),
            final: false
          });
        }
        const matchAllChild = currentPathNode.node.getChild('*');
        if (matchAllChild !== undefined) {
          currentMatchedPaths.push({
            node: matchAllChild,
            params: currentPathNode.params,
            final: true
          });
        }
      }
      matchedPaths = currentMatchedPaths;
    }
    const matchedPath = matchedPaths.find(path => path.node.data.data !== undefined);
    if (matchedPath === undefined) return;
    if (matchedPath.node.data.data === null) return;
    return {
      params: matchedPath.params || {},
      data: matchedPath.node.data.data
    };
  }
}
