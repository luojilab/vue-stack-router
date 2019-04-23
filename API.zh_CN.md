# API

## 组件

### 1. RouterView

**Props**

| 属性       | 类型           | 默认值 | 描述                                                                                                                                                                             |
| ---------- | -------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transition | string, object | -      | Vue 的 transition 配置，组合规则为当前 action 加 transition name，如：transition 为 'router' 时，根据当前页面进入/退出方式，应用为 'router-push'/'router-pop' 的 transition name |

## Router

### 方法

#### constructor(option: IRouterOption, driver: IRouterDriver, routeManager?: IRouteManager)

**参数**

| 参数         | 类型                            | 是否必须 | 描述       | 默认值             |
| ------------ | ------------------------------- | -------- | ---------- | ------------------ |
| option       | [IRouterOption](#IRouterOption) | true     | 路由参数   | -                  |
| driver       | IRouterDriver                   | true     | 路由驱动   | -                  |
| routeManager | IRouteManager                   | false    | 路由管理器 | new RouteManager() |

**Example**

```js
const routes = [
  {
    name: "home",
    path: "/",
    component: Home
  },
  {
    name: "detail",
    path: "/detail/:id",
    component: Detail,
    meta: { title: "detail" }
  },
  {
    name: "home",
    path: "*",
    component: Home
  }
];
const driver = new BrowserDriver({ mode: "hash" });
const router = new Router({ routes }, driver);
```

#### push(location: string | ILocation)

打开一个页面，在栈的顶端推入

**参数**

| 参数     | 类型             | 是否必须 | 描述                                                                                 | 默认值 |
| -------- | ---------------- | -------- | ------------------------------------------------------------------------------------ | ------ |
| location | string,ILocation | true     | 路由参数，类型为 string 时，是完整的 path, 为 object 的时候见[ILocation](#ILocation) | -      |

**Example**

```js
// pageA.vue
this.$router.push("info/name?id=2&n=hah");
//or
this.$router.push({
  pathname: "info/name",
  query: {
    id: 2,
    n: "hah"
  }
});

// pageB.vue
export default {
  name: "info",
  props: {
    query: Object,
    params: Object,
    state: Object
  },
  methods: {
    test() {
      // this.query/params/state 为上一个页面 push/replace 时传的 query/params/state
      console.log(this.query, this.params, this.state);
    }
  }
};
```

#### pop

返回，推出栈顶的页面

#### replace(location: string | ILocation)

打开一个页面，替换当前的页面

**参数**

| 参数     | 类型             | 是否必须 | 描述                                                                                 | 默认值 |
| -------- | ---------------- | -------- | ------------------------------------------------------------------------------------ | ------ |
| location | string,ILocation | true     | 路由参数，类型为 string 时，是完整的 path, 为 object 的时，见[ILocation](#ILocation) | -      |

## 类型定义

### IRouterOption

| 属性   | 类型                                 | 默认值 | 是否必须 | 描述     |
| ------ | ------------------------------------ | ------ | -------- | -------- |
| routes | Array<[IRouteConfig](#IRouteConfig)> | -      | true     | 路由列表 |

### IRouteConfig

| 属性      | 类型      | 默认值 | 是否必须 | 描述      |
| --------- | --------- | ------ | -------- | --------- |
| name      | string    | -      | false    | 路由名称  |
| path      | string    | -      | true     | 路由路径  |
| component | Component | -      | true     | 组件      |
| meta      | string    | -      | false    | meta 信息 |

### ILocation

| 属性     | 类型   | 默认值 | 是否必须 | 描述                                    |
| -------- | ------ | ------ | -------- | --------------------------------------- |
| name     | string | -      | false    | 路由名称, name 和 pathname 必须要有一个 |
| pathname | string | -      | false    | 路由 pathname                           |
| query    | object | -      | false    | 查询参数                                |
| params   | object | -      | false    | parameter 的参数                        |
| state    | any    | -      | false    | 路由的 meta 数据，页面中可以获取到      |
