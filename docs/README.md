## 开始

vue-stack-router 是一个 [Vue](https://vuejs.org) 的路由管理器，针对**移动端**而设计，支持对页面进行栈式的管理，主要有以下功能：

- 栈式的路由管理
- 声明式的路由配置
- 路由query、parameter
- 路由间数据传递
- 细粒度、可定制的路由过渡效果

### 安装

```shell
npm i vue-stack-router -S
```

### 适用场景

- 移动端、PWA
- 客户端中由 Web 承担的 hybrid 部分

### Hello Vue Stack Router

一个使用 Vue Stack Router 的基础的项目如下：

> 以下示例假定您已经系统学习过 Vue，并了解 Vue 单组件文件。

**App.vue** 

```vue
<template>
  <router-view/>
</template>
```

**Home.vue**

```vue
<template>
  <div>
    Hello Vue Stack Router
  </div> 
</template>
```

**routes.js**

```javascript
import Home from './Home.vue';
export default [
  { path: '/', component: Home },
  { path: '/bar', component: Bar }
]
```

**app.js**

```js
import Vue from 'Vue';
import { Router, BrowserDriver, installer } from 'vue-stack-router';
import routes from './routes';

const driver = new BrowserDriver({ mode: 'hash' });
const router = new Router({ routes }, driver);
Vue.use(installer, { router });

new Vue({
  render: h => h(App)
}).$mount('#app');
```

主要包含四部分，根组件的 `<router-view>` ( app.vue ) 、业务路由组件 ( home.vue )、路由表 ( routes.js )、入口文件 (  app.js )

### 浏览器支持版本

1. iOS Safari、Safari
2. Chrome
3. IE 10+、Edge

### Why Not Vue Router

[Vue Router](https://router.vuejs.org/) 是 vue 的官方路由管理，不可否认其有着强大的功能和广泛的使用，但在使用 vue-router 开发移动端业务时，有以下几点问题：

1. vue-router 中所有注册的路由都是单例的，当出现 PageA 跳转到 PageA 的时候，并不是产生一个新的 PageA，而是当前的 PageA 重新渲染。当需要两个 PageA ，并且两个 PageA 都需要有自己不同的状态时，这个场景用 vue-router 解决会比较麻烦。

2. vue-router 遵循 Web 的规范，整个路由的路径是线性的，组件实例的存活与路由无关，而是取决于是否使用了 `keep-alive` 组件。而在移动端，大部分栈式路由的场景，PageA 跳转到 PageB，A 和 B 实例都是存活的，当 PageB 返回 PageA，A 存活而 B 被销毁，显然 vue-router 无法满足这个场景。

   

## 基础

### <router-view\>

`<router-view>` 组件是 Vue Stack Router 的渲染组件，所有注册的路由组件都会渲染在 `<router-view>` 的位置上。

```vue
<template>
  <div>
    <router-view/>
  </div>
</template>
```

### 路由配置

路由配置是通过一组配置，来告诉 router 如何拼配 URL、如何展现注册的组件，一个简单的配置如下：

```js
const driver = new BrowserDriver({ mode: 'hash' });
const router = new Router({ 
  routes: [
    { path: '/', component: Home },
    { path: '/bar', component: Bar }
    { path: '/foo/:id', name: 'foo', component: Foo, meta: 'anything'}
    { path: '/*', component: Home }
  ]
}, driver);
```

当 URL 为 `/` 时，展现的是 `Home` ，为 `/bar` 时，展现的是 `Bar` 组件。如果存在同名的 `path` 或 `name` 后注册的组件会覆盖先注册的

> 通过过配置一个 path 为 `*` 的路由，可以处理所有的未匹配到的路由

### 路由匹配

| Path       | URL            | 匹配结果 |
| ---------- | -------------- | -------- |
| `/`        | `/`            | 匹配     |
| `/bar`     | `/bar`         | 匹配     |
| `/foo/:id` | `/foo/121`     | 匹配     |
| `/hah/*`   | `/hah/foo`     | 匹配     |
| `/hah/*`   | `/hah/foo/bar` | 匹配     |

当匹配到多个路由时，会选择先注册的路由，所以含有通配符的路由，应该放在最后注册。

> **注意**：这里的 Path 中的`*` 通配符必须在结尾，如 `/hah/*/foo` 或者`/f*` 都不可以匹配，如果需要实现类似  [path-to-regexp](https://github.com/pillarjs/path-to-regexp) 的路由匹配，可以通过自定义 RouteManager 类实现。

> 无特殊需要，不建议使用 `/foo/:id` 这种形式的 url。路径和参数耦合在一起，会导致许多与业务不耦合的系统需要单独配置或者额外的功能处理这种形式的 url，如一些依赖 url 的日志上报、数据分析、行为系统、Gateway 等等。

### 路由跳转

vue-stack-router 的路由跳转，目前包含以下三种方式，对应着栈的三种操作方式:

- push
- pop
- replace

我们通过一组示例来了解他们的区别：

1. 当我们打开一个页面 A 时，创建 `PageA` 实例，此时栈为 `[PageA]` ，展示的为 `PageA`；

2. 我们 `push` 一个页面 B，创建 `PageB` 实例，此时栈为 `[PageA，PageB]`，展示的是 `PageB` ，`PageA` 和 `PageB` 的实例都存活；

3. 然后我们 `pop` ，`PageB` 的实例被销毁，此时栈变回到 `[PageA]`，显示的是 `PageA` ， `PageA` 的实例不会重新创建；

4. 最后我们 `replace` 一个页面C，`PageC` 的实例被创建，`PageA` 的实例被销毁，此时栈变为 `[PageC]`， 展示的是 `PageC`；

> 在浏览器环境中，浏览器的后退等同于 `pop` ，前进等同于 `push` 。

我们通过 `Router` 的实例方法，可以实现命令式的路由跳转，在 Vue 实例中，通过 `this.$router` 可以获取到 `Router` 的实例。

**router.push(location)**

push 方法会在当前栈顶推入一个页面，接受一个字符串或者对象为参数。

```js
// 接收一个字符串
router.push('/foo');

// 接收一个对象
router.push({ path: '/foo', query: { id: 2 }})

// 具名路由
router.push({ name: 'foo', params: { id: 2 }})

// 向下一个页面传递数据
router.push({ path: '/foo', state: 'anything'})
```

**router.replace(location)**

replace 方法会替换当前栈顶的页面，接受一个字符串或者对象为参数。

**router.pop()**

pop 方法会推出栈顶的一个页面。

### 获取路由参数

通过在路由组件声明 `props` 可获取到当前路由的参数。

```js
// PageA
export default {
  // ...
  methods:{
    jump(){
      this.$router.push({
        name: 'foo',
        query: { name: 2},
        params: { id: 1 }, // 路由为 /foo/:id
        state: 'anything'
      })
    }
  }
}

// PageB
export default {
   props: { // 声明props
    query: Object,
    params: Object,
    state: Object
  },
  created(){
    console.log(this.query) // { name: '2' }，注意 '2' 为字符串
    console.log(this.state) // 'anything'
    console.log(this.params) // { id: '1' }
  }
}

```

> **注意**：所有 `query` 和 `params` 的键值都会转换成 `string` 类型，因为当参数为 `{ query: { name: 2}, params: { id: 1 }`时，实际得到的 url 为 `/foo/1?name=2`，所以最终获取到的 `query` 和 `params` 的键值为字符串。

目前并不支持在非路由组件中获取上述路由参数。

### Platform Driver

vue-stack-router 将与平台相关的逻辑抽离到了 dirver 层中，目前包含了 `BrowserDriver` 和 `ServerDirver` ，若有其他平台需求，如 weex，可自定义实现 Driver。

#### Browser Driver

在浏览器中使用的 dirver。

```js
import { Router, BrowserDriver } from 'vue-stack-router';
const driver = new BrowserDriver({ mode: 'hash' });// 或者 mode: 'history'
const router = new Router({ routes:[] }, driver);
```

当 `mode` 为 `'hash'`时，url为拼接在 `#` 后，如 `http://example.com/#/home`;

当 `mode` 为 `'history'`时，url为拼接在域名后 后，如 `http://example.com/home`;



## 进阶

### 过渡动效

vue-stack-router 内置了 `<transition>` 组件，借助 `<transition>` 组件可以实现强大的过渡动效，但不同于单纯的使用 `<transition>`, vue-stack-router 加入了`RouterAction` 的支持，可以灵活的配置页面 `push`、`pop` 、`replace` 操作时的过渡动效

#### 全局配置

我们可以`<router-view>` 组件设置全局的过渡动效，如下:

```vue
<template> 
    <router-view transition="route"/>
</template>
```

最终在 `push/pop/repalce` 时，相当于`<transition :name="route-push">` 、`<transition :name="route-push">` 等。

#### 单路由配置

部分路由可能需要由不同的效果，可以在注册路由时设置，如下

```js
// ...
const router = new Router({ 
  routes: [
    { path: '/bar', component: Bar, transition: 'spec-route' }
  ]
}, driver);
```

#### 动态配置

当部分页面需要支持多种过多效果，或者过渡效果需要由前一个页面来确认，可以在路由跳转时设置

```js
router.push({ path: '/foo', transition: 'spec-route'})
```

本次过渡相当于`<transition :name="spec-route-push">` 。

### 过渡钩子

`vue-stack-router` 在组件切换过程中，暴露一组钩子以供开发者使用

#### 组件内钩子

`vue-stack-router` 在 Page 组件中注入了一下四个钩子函数：

1. willAppear，将要显示
2. didAppear，已经显示
3. willDisappear，将要离开页面
4. didDisappear，已经离开页面

包含了页面从进入到离开的四个过程，例子如下：

```js
export default {
  template:'<div>...</div>',
  willAppear(){
    // 页面将要展现，动画马上开始
  },
  didAppear(){
    // 页面已经展现，动画已经结束
  },
  willDisappear(){
    // 页面将要离开，动画马上开始
  },
  didDisappear(){
    // 页面已经离开，动画已经结束
  }
}
```

#### 全局钩子

例子如下：

```js
const router = new Router(...);
router.on('change', (type, route)=>{
  // type 是当前路由变化的类型，'push'/'pop'/'replace'
  // route 为路由配置项
})
```

### 路由懒加载

当我们的代码体积比较大的时候，通过打包工具（如webpack）对代码进行分割懒加载是非常必要的，路由的懒加载通Vue组件的懒加载方式一致，例子如下：

```js
const driver = new BrowserDriver({ mode: 'hash' });
const Home = import('../home.vue')
const router = new Router({ 
  routes: [
    { path: '/', component: Home },
    // 或者
    { path: '/bar', component: import('../bar.vue') }
  ]
}, driver);
```

### 预渲染

在某些场景下，我们需要预先渲染出下一个页；或者有些场景需要控制动画（比如实现类似客户端的滑动返回的功能，页面跟随手指移动），这个时候我们会需要路由支持预渲染模式

#### 开启预渲染

需要 `<router-view>` 中设置 `:support-pre-render="true"`

```vue
<router-view class="test" transition="route" :support-pre-render="true"/>
```

> 由于 Vue 目前不支持 Fragment，在预渲染模式时，router-view 会嵌套一层div，因此增加一个`supportPreRender` 的属性，当不要预渲染的时候，不会额外嵌套一层元素，后续如果 Vue 支持 Fragment，会取消这个设置

#### 路由跳转

这个时候，router 有以下方法可用：

- prepush()
- prepop()
- prereplace()

这三个方法同 `push()` / `pop()` / `reolace()` 入参一致，只是返回参数不一致，`preXXX` 方法会返回一个callback，执行这个callback 告诉 `vue-stack-router`是继续跳转还是取消跳转，如下：

```js
const confirm = this.$router.prepush({transion:''});
setTimeout(()=>{
  confirm();
  // comfirm(false) 则是取消跳转
},1000)
```

这样会预选先渲染出好下个页面，在1秒后会展现。

> **注意：** 预渲染目前仅支持用户自己控制页面动画方式，如实通过js控制页面现滑动返回功能。因为目前动画依赖于 Vue 的 transition-group ，但 vue-stack-router 预渲染的实现方式，存在当前页面动画不生效的问题。后续可能会通过重新实现 transition 的方式来解决这个问题。