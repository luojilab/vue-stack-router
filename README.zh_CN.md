# vue-stack-router

栈式的路由管理器

## Introduction

## 安装

```bash
npm install vue-stack-router
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

## 文档

[API文档](API.zh_CN.md)