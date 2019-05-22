import { IQuery } from '../interface/common';
import { IMatchedRoute, IRouteManager } from '../interface/routeManager';
import { IRouteConfig } from '../interface/router';
import TreeNode from '../utils/TreeNode';

export default class RouteManager implements IRouteManager {
  private pathRoute: PathTree<IRouteConfig> = new PathTree();
  private nameRoute: Map<string, IRouteConfig> = new Map();
  public getPathnameByRouteName(name: string, params?: IQuery): string {
    const route = this.nameRoute.get(name);
    if (route === undefined) {
      return '';
    }
    const normalizedPath = this.normalizePath(route.path);

    if (normalizedPath.indexOf(':') > -1) {
      if (params === undefined) {
        return '';
      }
      return normalizedPath.split('/').reduce((pre, val, index) => {
        let path = val;
        if (val[0] === ':') {
          path = String(params && params[path.replace(/\:/, '')]);
        }
        return index === 0 ? path : `${pre}/${path}`;
      });
    }
    return normalizedPath;
  }
  public register(route: IRouteConfig): void {
    const normalizedPath = this.normalizePath(route.path);
    this.pathRoute.addPath(normalizedPath.split('/'), route);
    if (route.name) {
      this.nameRoute.set(route.name, route);
    }
  }
  public match(path: string): IMatchedRoute | undefined {
    const normalizedPath = this.normalizePath(path);
    const pathRoute = this.pathRoute.getDataAndParamsByPaths(normalizedPath.split('/'));
    if (pathRoute === undefined) {
      return;
    }
    return {
      config: pathRoute.data,
      params: pathRoute.params
    };
  }

  private normalizePath(path: string): string {
    return path.replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '');
  }
}

interface INodeData<T> {
  path: string;
  parameterName?: string;
  data?: T;
}

interface IMatchedPathNode<T> {
  node: TreeNode<T>;
  params?: IQuery;
  final?: boolean;
}

// tslint:disable-next-line: max-classes-per-file
export class PathTree<T> {
  public rootNode: TreeNode<INodeData<T>> = new TreeNode({ path: '/' });

  public addPath(paths: string[], data: T) {
    let currentNode = this.rootNode;
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      if (path === '*') {
        let finalNode = currentNode.getChild('*');
        if (finalNode !== undefined) {
          break;
        }
        finalNode = new TreeNode({ path: '*', data });
        currentNode.addChild('*', finalNode);
        break;
      }
      const nodeData: INodeData<T> = { path };
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
  public getDataAndParamsByPaths(paths: string[]): undefined | { params: IQuery; data: T } {
    let matchedPaths: Array<IMatchedPathNode<INodeData<T>>> = [{ node: this.rootNode }];
    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const currentMatchedPaths: Array<IMatchedPathNode<INodeData<T>>> = [];
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
            params: currentPathNode.params
          });
        }
        const parameterChild = currentPathNode.node.getChild(':');
        if (parameterChild !== undefined) {
          currentMatchedPaths.push({
            node: parameterChild,
            params: Object.assign(
              {
                [parameterChild.data.parameterName!]: path
              },
              currentPathNode.params
            )
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
    if (matchedPath === undefined) {
      return;
    }
    return {
      params: matchedPath.params || {},
      data: matchedPath.node.data.data!
    };
  }
}
