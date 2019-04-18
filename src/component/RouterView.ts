import Vue, { CreateElement, VNode } from 'vue';
import { RouteActionType, RouteEventType } from '../interface/common';
import { IRouteInfo, IRouter, IRouterConfig } from '../interface/router';

interface IData {
  routeInfo?: IRouteInfo;
  nextRouteInfo?: IRouteInfo;
  vnodeCache: Map<string, VNode>;
  actionType?: RouteActionType;
  transitionType?: RouteActionType;
  supportPreRender: boolean;
}
interface ITransitionDurationConfig {
  enter: number;
  leave: number;
}
interface ITransitionOptions {
  name: string;
  duration: number | ITransitionDurationConfig;
  mode: string;
  tag: string;
}
type PropsTypes<T> = () => T;
interface IPageViewProps {
  path: string;
  query: { [key: string]: string };
  params: { [key: string]: string };
  state?: any;
}

export default Vue.extend({
  name: 'RouterView',
  data() {
    return {} as IData;
  },
  props: {
    router: Object as PropsTypes<IRouter | undefined>,
    transition: ([Object, String] as unknown) as PropsTypes<ITransitionOptions | string | undefined>
  },
  render(h: CreateElement): VNode {
    if (!this.routeInfo) {
      return h();
    }
    const vnode = this.renderRoute(h, this.routeInfo);
    if (this.nextRouteInfo && this.supportPreRender) {
      const nextVNode = this.renderRoute(h, this.nextRouteInfo);
      const children = this.transitionType === RouteActionType.POP ? [nextVNode, vnode] : [vnode, nextVNode];
      return h('div', {}, children);
    }
    if (this.transition) {
      return this.renderTransition(h, vnode);
    }

    return this.renderWrapper(h, vnode);
  },
  created() {
    this.vnodeCache = new Map();
    this.actionType = RouteActionType.NONE;
    const router = this.getRouter();
    this.supportPreRender = router.routerConfig.supportPreRender;
    this.routeInfo = router.currentRouteInfo;
    router.on(RouteEventType.CHANGE, this.handleRouteChange);
    router.on(RouteEventType.DESTROY, this.handleRouteDestroy);

    if (this.supportPreRender) {
      router.on(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
      router.on(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    }
  },
  destroyed() {
    const router = this.getRouter();
    router.off(RouteEventType.CHANGE, this.handleRouteChange);
    router.off(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
    router.off(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    router.off(RouteEventType.DESTROY, this.handleRouteDestroy);
  },
  methods: {
    renderRoute(h: CreateElement, routeInfo: IRouteInfo): VNode {
      const { config, route } = routeInfo;
      const cachedVNode = this.vnodeCache.get(route.id);
      const vnode = h(config.component, {
        props: this.getPageViewProps(routeInfo)
      });
      vnode.tag = `${vnode.tag}-${route.id}`;
      if (cachedVNode !== undefined) {
        vnode.componentInstance = cachedVNode.componentInstance;
      }
      this.vnodeCache.set(route.id, vnode);
      vnode.data!.keepAlive = true;

      return vnode;
    },
    renderTransition(h: CreateElement, vnode: VNode): VNode {
      const vnodeData = {
        props: this.getTransitionProps(),
        on: this.getTransitionListener()
      };
      vnode.key = this.routeInfo && this.routeInfo.route.id;
      const transitionVnode = h(this.supportPreRender ? 'transition-group' : 'transition', vnodeData, [vnode]);
      return transitionVnode;
    },
    renderWrapper(h: CreateElement, vnode: VNode): VNode {
      return h('div', {}, [vnode]);
    },
    getRouter() {
      return this.router || this.$router;
    },
    handleRouteChange(type: RouteActionType, routeInfo?: IRouteInfo) {
      if (routeInfo === undefined) {
        return;
      }
      if (this.routeInfo && this.routeInfo.route.id === routeInfo.route.id) {
        return;
      }
      this.routeInfo = routeInfo;
      if (this.nextRouteInfo !== undefined) {
        this.actionType = undefined;
        this.nextRouteInfo = undefined;
        this.transitionType = undefined;
      } else {
        this.actionType = type;
      }

      this.$forceUpdate();
    },
    handleRouteWillChange(type: RouteActionType, routeInfo?: IRouteInfo) {
      if (routeInfo === undefined) {
        return;
      }
      this.nextRouteInfo = routeInfo;
      this.transitionType = type;
      this.$forceUpdate();
    },
    handleRouteChangeCancel(routeInfo: IRouteInfo) {
      if (
        routeInfo === undefined ||
        this.nextRouteInfo === undefined ||
        (routeInfo && this.nextRouteInfo && routeInfo.route.id !== this.nextRouteInfo.route.id)
      ) {
        return;
      }
      this.nextRouteInfo = undefined;
      this.transitionType = undefined;
      this.actionType = undefined;

      this.$forceUpdate();
    },
    handleRouteDestroy(ids: string[]) {
      ids.forEach(id => {
        const vnode = this.vnodeCache.get(id);
        if (vnode && vnode.componentInstance) {
          vnode.componentInstance.$destroy();
        }
        this.vnodeCache.delete(id);
      });
    },
    getTransitionProps(): Partial<ITransitionOptions> {
      const props: Partial<ITransitionOptions> = {
        tag: 'div'
      };
      if (this.actionType === undefined) {
        return props;
      }
      if (this.transition) {
        if (typeof this.transition === 'string') {
          props.name = `${this.transition}-${this.actionType}`;
        } else {
          if (this.transition.name) {
            props.name = `${this.transition.name}-${this.actionType}`;
          }
          props.duration = this.transition.duration;
          props.mode = this.transition.mode;
        }
      }
      return props;
    },
    getTransitionListener() {
      return {
        beforeEnter: this.handleTransitionBeforeEnter,
        afterEnter: this.handleTransitionAfterEnter,
        beforeLeave: this.handleTransitionBeforeLeave,
        afterLeave: this.handleTransitionAfterLeave
      };
    },
    getPageViewProps(routeInfo: IRouteInfo): IPageViewProps {
      const props: IPageViewProps = {
        path: '/',
        params: {},
        query: {},
        state: undefined
      };
      const { path, params, query, state } = routeInfo.route;
      Object.assign(props, { params, query, state, path });

      return props;
    },
    handleTransitionBeforeEnter() {
      // todo
    },
    handleTransitionAfterEnter() {
      // todo
    },
    handleTransitionBeforeLeave() {
      // todo
    },
    handleTransitionAfterLeave() {
      // todo
    }
  }
});
