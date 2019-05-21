import Vue, { Component, CreateElement, VNode } from 'vue';
import { IEventEmitter, RouteActionType, RouteEventType, ViewActionType } from '../interface/common';
import { IRouteInfo, IRouterEventMap } from '../interface/router';
import invokeHook from '../utils/invokeHook';

interface IRouteConfigWithTransition {
  name?: string;
  path: string;
  component: Component;
  transition?: Transition;
  meta?: unknown;
}

interface IData {
  routeInfo?: IRouteInfo;
  preRouteInfo?: IRouteInfo;
  nextRouteInfo?: IRouteInfo;
  vnodeCache: Map<string, VNode>;
  transitionType: RouteActionType;
  customTransition?: Transition;
  needDestroyedRouteId?: string;
  preRenderMode: PreRenderMode;
}
type Transition = ITransitionOptions | string;
interface ITransitionDurationConfig {
  enter: number;
  leave: number;
}
interface ITransitionOptions {
  name: string;
  appear?: boolean;
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
const enum PreRenderMode {
  PRE_RENDERING = 'preRendering',
  RENDERING_CANCELED = 'renderingCanceled',
  NONE = 'none'
}
const NO_TRANSITION = '__NO_TRANSITION';
export default Vue.extend({
  name: 'RouterView',
  data() {
    return {} as IData;
  },
  props: {
    router: Object as PropsTypes<IEventEmitter<IRouterEventMap> | undefined>,
    transition: ([Object, String] as unknown) as PropsTypes<ITransitionOptions | string | undefined>,
    supportPreRender: Boolean as PropsTypes<boolean>
  },
  render(h: CreateElement): VNode {
    if (!this.routeInfo) {
      return h();
    }
    const vnode = this.renderRoute(h, this.routeInfo);
    let vNodes = [vnode];
    if (this.nextRouteInfo && this.supportPreRender) {
      const nextVNode = this.renderRoute(h, this.nextRouteInfo);
      vNodes = this.transitionType === RouteActionType.POP ? [nextVNode, vnode] : [vnode, nextVNode];
    }
    return this.renderTransition(h, vNodes);
  },
  created() {
    this.vnodeCache = new Map();
    this.transitionType = RouteActionType.NONE;
    this.preRenderMode = PreRenderMode.NONE;
    const event = this.getEventEmitter();
    event.on(RouteEventType.CHANGE, this.handleRouteChange);
    event.on(RouteEventType.DESTROY, this.handleRouteDestroy);

    if (this.supportPreRender) {
      event.on(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
      event.on(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    }
  },
  destroyed() {
    const event = this.getEventEmitter();
    event.off(RouteEventType.CHANGE, this.handleRouteChange);
    event.off(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
    event.off(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    event.off(RouteEventType.DESTROY, this.handleRouteDestroy);
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
      vnode.key = `__route-${routeInfo.index}`;
      return vnode;
    },
    renderTransition(h: CreateElement, vNodes: VNode[]): VNode {
      const vnodeData = {
        props: this.getTransitionProps(),
        on: this.getTransitionListener()
      };
      const transitionVnode = h(this.supportPreRender ? 'transition-group' : 'transition', vnodeData, vNodes);
      return transitionVnode;
    },
    getEventEmitter(): IEventEmitter<IRouterEventMap> {
      return this.router || this.$router;
    },
    handleRouteChange(type: RouteActionType, routeInfo?: IRouteInfo, transition?: unknown) {
      if (routeInfo === undefined) {
        return;
      }
      if (this.routeInfo && this.routeInfo.route.id === routeInfo.route.id) {
        return;
      }
      this.preRouteInfo = this.routeInfo;
      this.routeInfo = routeInfo;
      this.nextRouteInfo = undefined;
      this.transitionType = type;
      this.customTransition = undefined;
      if (this.isTransition(routeInfo.config.transition)) {
        this.customTransition = routeInfo.config.transition;
      }
      if (this.isTransition(transition)) {
        this.customTransition = transition;
      }

      this.$forceUpdate();
    },
    handleRouteWillChange(type: RouteActionType, routeInfo?: IRouteInfo) {
      if (routeInfo === undefined) {
        return;
      }
      this.nextRouteInfo = routeInfo;
      this.transitionType = type;
      this.preRenderMode = PreRenderMode.PRE_RENDERING;
      this.customTransition = NO_TRANSITION;
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
      this.transitionType = RouteActionType.NONE;
      this.customTransition = undefined;
      this.preRenderMode = PreRenderMode.RENDERING_CANCELED;

      this.$forceUpdate();
    },
    handleRouteDestroy(ids: string[]) {
      ids.forEach(id => {
        if (this.preRouteInfo && this.preRouteInfo.route.id !== id) {
          this.destroyComponent(id);
        } else {
          // Pre vnode will be deleted after transition leave
          this.needDestroyedRouteId = id;
        }
      });
    },
    destroyComponent(id: string) {
      const instance = this.getRouteComponentInstance(id);
      if (instance) {
        instance.$destroy();
      }
      this.vnodeCache.delete(id);
    },
    getRouteComponentInstance(id: string): Vue | undefined {
      const vnode = this.vnodeCache.get(id);
      return vnode && vnode.componentInstance;
    },
    getTransitionProps(): Partial<ITransitionOptions> {
      const props: Partial<ITransitionOptions> = {
        appear: true,
        tag: 'div',
      };
      if (this.transitionType === RouteActionType.NONE) return props;
      const transition = this.customTransition === undefined ? this.transition : this.customTransition;
      if (transition && transition !== NO_TRANSITION) {
        if (typeof transition === 'string') {
          props.name = `${transition}-${this.transitionType}`;
        } else {
          if (transition.name) {
            props.name = `${transition.name}-${this.transitionType}`;
          }
          props.duration = transition.duration;
          props.mode = transition.mode;
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
      if (this.routeInfo === undefined) return;

      if (this.preRenderMode === PreRenderMode.NONE) {
        const component = this.getRouteComponentInstance(this.routeInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.WILL_APPEAR);
        }
      } else if (this.preRenderMode === PreRenderMode.PRE_RENDERING) {
        const currentComponent = this.getRouteComponentInstance(this.routeInfo.route.id);
        if (currentComponent === undefined) return;
        invokeHook(currentComponent, ViewActionType.WILL_DISAPPEAR);

        const routeId = (this.nextRouteInfo && this.nextRouteInfo.route.id) || '';
        const nextComponent = this.getRouteComponentInstance(routeId);
        if (nextComponent === undefined) return;
        invokeHook(nextComponent, ViewActionType.WILL_APPEAR);
      }
    },
    handleTransitionAfterEnter() {
      if (this.routeInfo === undefined || this.isPreRendering()) return;
      const routeId = this.routeInfo.route.id;
      const component = this.getRouteComponentInstance(routeId);
      if (component === undefined) return;
      invokeHook(component, ViewActionType.DID_APPEAR);
    },
    handleTransitionBeforeLeave() {
      if (this.preRenderMode === PreRenderMode.NONE && this.preRouteInfo !== undefined) {
        const component = this.getRouteComponentInstance(this.preRouteInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.WILL_DISAPPEAR);
        }
      }
    },
    handleTransitionAfterLeave() {
      if (this.preRouteInfo !== undefined) {
        const component = this.getRouteComponentInstance(this.preRouteInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.DID_DISAPPEAR);
        }
      }

      if (this.preRenderMode === PreRenderMode.PRE_RENDERING && this.routeInfo !== undefined) {
        const component = this.getRouteComponentInstance(this.routeInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.DID_APPEAR);
        }
        this.preRenderMode = PreRenderMode.NONE;
      }
      if (this.preRenderMode === PreRenderMode.RENDERING_CANCELED && this.routeInfo !== undefined) {
        const component = this.getRouteComponentInstance(this.routeInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.DID_APPEAR);
        }
        this.preRenderMode = PreRenderMode.NONE;
      }

      if (this.needDestroyedRouteId) {
        this.destroyComponent(this.needDestroyedRouteId);
        this.needDestroyedRouteId = undefined;
      }
    },
    isTransition(transition: unknown): transition is Transition {
      return transition !== undefined;
    },
    isPreRendering(): boolean {
      return this.nextRouteInfo !== undefined;
    }
  }
});
