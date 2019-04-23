# vue-stack-router

> Do not use this package in production, it's still not finished


## Install

```bash
npm install vue-stack-router
```

## Usage

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