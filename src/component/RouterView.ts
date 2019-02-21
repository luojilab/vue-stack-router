import Vue, { CreateElement, VNode } from 'vue';
import { RouteActionType, RouteEventType } from '../interface/common';
import { IRoute, IRouteConfig, IRouter } from '../interface/router';

interface IData {
  preRoute?: IRoute;
  currentRoute?: IRoute;
  currentRouteConfig?: IRouteConfig;
  vnodeCache: Map<string, VNode>;
  actionType: RouteActionType;
}
interface ITransitionDurationConfig {
  enter: number;
  leave: number;
}
interface ITransitionOptions {
  name: string;
  duration: number | ITransitionDurationConfig;
  mode: string;
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
    if (!this.currentRoute || !this.currentRouteConfig) {
      return h();
    }

    const cachedVNode = this.vnodeCache.get(this.currentRoute.id || '');
    const vnode = h(this.currentRouteConfig.component, {
      props: this.getPageViewProps()
    });
    if (this.currentRoute.id !== '') {
      vnode.tag = `${vnode.tag}-${this.currentRoute.id}`;
    }
    if (cachedVNode !== undefined) {
      vnode.componentInstance = cachedVNode.componentInstance;
    }
    this.vnodeCache.set(this.currentRoute.id, vnode);
    vnode.data!.keepAlive = true;
    if (this.transition) {
      const vnodeData = {
        props: this.getTransitionProps(),
        on: this.getTransitionListener()
      };
      return h('transition', vnodeData, [vnode]);
    }
    return vnode;
  },
  created() {
    this.vnodeCache = new Map();
    this.actionType = RouteActionType.NONE;
    const router = this.getRouter();
    this.currentRoute = router.currentRoute;
    this.currentRouteConfig = router.currentRouteConfig;
    router.on(RouteEventType.CHANGE, this.handleRouteChange);
    router.on(RouteEventType.DESTROY, this.handleRouteDestroy);
  },
  destroyed() {
    const router = this.getRouter();
    router.off(RouteEventType.CHANGE, this.handleRouteChange);
    router.off(RouteEventType.DESTROY, this.handleRouteDestroy);
  },
  methods: {
    getRouter() {
      return this.router || this.$router;
    },
    handleRouteChange(type: RouteActionType, route?: IRoute, routeConfig?: IRouteConfig) {
      this.preRoute = this.currentRoute;
      this.currentRoute = route;
      this.currentRouteConfig = routeConfig;
      this.actionType = type;
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
      const props: Partial<ITransitionOptions> = {};
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
    getPageViewProps(): IPageViewProps {
      const props: IPageViewProps = {
        path: '/',
        params: {},
        query: {},
        state: undefined
      };
      if (this.currentRoute) {
        const { path, params, query, state } = this.currentRoute;
        Object.assign(props, { params, query, state, path });
      }
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
