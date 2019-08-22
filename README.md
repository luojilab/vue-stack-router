# vue-stack-router

## 介绍

vue-stack-router 是一个 [Vue](https://vuejs.org) 路由管理器的社区解决方案，针对**移动端**而设计，支持对页面进行栈式的管理，主要有以下功能：

- 栈式的路由管理
- 声明式的路由配置
- 路由query、parameter
- 路由间数据传递
- 细粒度、可定制的路由过渡效果

## 安装

```shell
npm i vue-stack-router -S
```



## 使用

```js
import Vue from 'Vue';
import { Router, BrowserDriver, installer } from 'vue-stack-router';
import Home from './components/Home.vue';
import Detail from './components/Detail.vue';
const routes = [
  {
    name: 'home',
    path: '/',
    component: Home
  },
  {
    name: 'detail',
    path: '/detail',
    component: Detail
  }
];
const driver = new BrowserDriver({ mode: 'hash' });
const router = new Router({ routes }, driver);
Vue.use(installer, { router });
```

## 适用场景

- 移动端、PWA
- 客户端中由 Web 承担的 hybrid 部分

## 文档

[文档](https://luojilab.github.io/vue-stack-router/)

## License

[MIT](./LICENSE.md)
