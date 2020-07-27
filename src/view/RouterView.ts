import Vue, { Component, CreateElement, VNode, VNodeData } from 'vue';
import { ViewActionType } from '../interface/common';
import { RouteInfo, Router, RouteEventType } from '../interface/router';
import invokeHook from '../utils/invokeHook';

interface Data {
  routeInfo?: RouteInfo<Component>;
  preRouteInfo?: RouteInfo<Component>;
  nextRouteInfo?: RouteInfo<Component>;
  vnodeCache: Map<string, VNode>;
  transitionType?: string;
  customTransition?: Transition;
  needDestroyedRouteId?: string;
  preRenderMode: PreRenderMode;
}
type Transition = TransitionOptions | string;
interface TransitionDurationConfig {
  enter: number;
  leave: number;
}
interface TransitionOptions {
  name: string;
  appear?: boolean;
  duration: number | TransitionDurationConfig;
  mode: string;
  tag: string;
}
type PropsTypes<T> = () => T;
interface PageViewProps {
  path: string;
  query: { [key: string]: string };
  params: { [key: string]: string };
  state?: unknown;
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
    return {} as Data;
  },
  props: {
    router: Object as PropsTypes<Router<Component> | undefined>,
    supportPreRender: Boolean as PropsTypes<boolean>,
    transition: ([Object, String] as unknown) as PropsTypes<TransitionOptions | string | undefined>
  },
  render(h: CreateElement): VNode {
    if (!this.routeInfo) {
      return h();
    }
    const vnode = this.renderRoute(h, this.routeInfo);
    let vNodes = [vnode];
    if (this.nextRouteInfo && this.supportPreRender) {
      const nextVNode = this.renderRoute(h, this.nextRouteInfo);
      vNodes = [nextVNode, vnode];
    }
    return this.renderTransition(h, vNodes);
  },
  created() {
    this.vnodeCache = new Map();
    this.transitionType = undefined;
    const router = this.getRouter();
    this.routeInfo = router.currentRouteInfo;
    this.preRenderMode = PreRenderMode.NONE;
    router.on(RouteEventType.CHANGE, this.handleRouteChange);
    router.on(RouteEventType.DESTROY, this.handleRouteDestroy);

    if (this.supportPreRender) {
      router.on(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
      router.on(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    }
  },
  destroyed() {
    const event = this.getRouter();
    event.off(RouteEventType.CHANGE, this.handleRouteChange);
    event.off(RouteEventType.WILL_CHANGE, this.handleRouteWillChange);
    event.off(RouteEventType.CANCEL_CHANGE, this.handleRouteChangeCancel);
    event.off(RouteEventType.DESTROY, this.handleRouteDestroy);
  },
  methods: {
    renderRoute(h: CreateElement, routeInfo: RouteInfo<Component>): VNode {
      const { config, route } = routeInfo;
      const cachedVNode = this.vnodeCache.get(route.id);
      const vNodeData: VNodeData = {
        props: this.getPageViewProps(routeInfo)
      };
      // const transition = this.customTransition === undefined ? this.transition : this.customTransition;
      // let transitionName = '';
      // if (typeof transition === 'string') {
      //   transitionName = `${transition}-${this.transitionType}`;
      // } else if (transition && transition.name) {
      //   transitionName = `${transition.name}-${this.transitionType}`;
      // }
      // if (vNodeData.class === undefined) {
      //   vNodeData.class = {};
      // }

      // const transitionStage = isNext ? 'enter' : 'leave';
      // if (this.isPreRendering()) {
      //   vNodeData.class[`${transitionName}-${transitionStage}`] = this.isPreRendering();
      //   vNodeData.class[`${transitionName}-${transitionStage}-active`] = this.isPreRendering();
      // }
      const vnode = h(config.component, vNodeData);
      if (cachedVNode !== undefined) {
        vnode.componentInstance = cachedVNode.componentInstance;
      }
      this.vnodeCache.set(route.id, vnode);
      if (vnode.data !== undefined) {
        vnode.data.keepAlive = true;
      }
      if (vnode.tag !== undefined) {
        vnode.tag = `${vnode.tag}-${route.id}`;
        vnode.key = `__route-${route.id}`;
      }
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
    getRouter(): Router<Component> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.router || (this as any).$router;
    },
    handleRouteChange(type: string, routeInfo?: RouteInfo<Component>, transition?: unknown): void {
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
      this.setCustomTransition(routeInfo, transition);
      this.$forceUpdate();
    },
    handleRouteWillChange(type: string, routeInfo?: RouteInfo<Component>, transition?: unknown): void {
      if (routeInfo === undefined) {
        return;
      }
      this.nextRouteInfo = routeInfo;
      this.transitionType = type;
      this.preRenderMode = PreRenderMode.PRE_RENDERING;

      this.setCustomTransition(routeInfo, transition);
      this.$forceUpdate();
    },
    handleRouteChangeCancel(routeInfo: RouteInfo<Component>): void {
      if (
        routeInfo === undefined ||
        this.nextRouteInfo === undefined ||
        (routeInfo && this.nextRouteInfo && routeInfo.route.id !== this.nextRouteInfo.route.id)
      ) {
        return;
      }
      this.nextRouteInfo = undefined;
      this.transitionType = undefined;
      this.customTransition = undefined;
      this.preRenderMode = PreRenderMode.RENDERING_CANCELED;

      this.$forceUpdate();
    },
    handleRouteDestroy(ids: string[]): void {
      ids.forEach(id => {
        if (this.preRouteInfo && this.preRouteInfo.route.id !== id) {
          this.destroyComponent(id);
        } else {
          // Pre vnode will be deleted after transition leave
          this.needDestroyedRouteId = id;
        }
      });
    },
    destroyComponent(id: string): void {
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
    getTransitionProps(): Partial<TransitionOptions> {
      const props: Partial<TransitionOptions> = {
        appear: true,
        tag: 'div'
      };
      if (!this.transitionType || this.isPreRendering()) {
        props.name = NO_TRANSITION;
        return props;
      }
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
    getPageViewProps(routeInfo: RouteInfo<Component>): PageViewProps {
      const props: PageViewProps = {
        path: '/',
        params: {},
        query: {},
        state: undefined
      };
      const { path, params, query, state } = routeInfo.route;
      Object.assign(props, { params, query, state, path });

      return props;
    },
    handleTransitionBeforeEnter(): void {
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
    handleTransitionAfterEnter(): void {
      if (this.routeInfo === undefined || this.isPreRendering()) return;
      const routeId = this.routeInfo.route.id;
      const component = this.getRouteComponentInstance(routeId);
      if (component === undefined) return;
      invokeHook(component, ViewActionType.DID_APPEAR);
    },
    handleTransitionBeforeLeave(): void {
      if (this.preRenderMode === PreRenderMode.NONE && this.preRouteInfo !== undefined) {
        const component = this.getRouteComponentInstance(this.preRouteInfo.route.id);
        if (component !== undefined) {
          invokeHook(component, ViewActionType.WILL_DISAPPEAR);
        }
      }
    },
    handleTransitionAfterLeave(): void {
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
    setCustomTransition(routeInfo: RouteInfo<Component>, transition: unknown): void {
      this.customTransition = undefined;
      if (this.isTransition(routeInfo.config.transition)) {
        this.customTransition = routeInfo.config.transition;
      }
      if (this.isTransition(transition)) {
        this.customTransition = transition;
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
