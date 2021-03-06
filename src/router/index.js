import Vue from 'vue'
import VueRouter from 'vue-router'

// import Login from '../components/Login.vue'
// import Home from '../components/Home.vue'
// import Welcome from '../components/Welcome.vue'
// import User from '../components/user/User.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'

const Login = () => import('../components/Login.vue')
const Home = () => import('../components/Home.vue')
const Welcome = () => import('../components/Welcome.vue')
const User = () => import('../components/user/User.vue')
const Rights = () => import('../components/power/Rights.vue')
const Roles = () => import('../components/power/Roles.vue')
const Cate = () => import('../components/goods/Cate.vue')
const Params = () => import('../components/goods/Params.vue')
const List = () => import('../components/goods/List.vue')
const Add = () => import('../components/goods/Add.vue')
const Order = () => import('../components/order/Order.vue')
const Report = () => import('../components/report/Report.vue')

// const Login = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Login.vue')
// const Home = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Home.vue')
// const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ '../components/Welcome.vue')

// const Users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/user/User.vue')
// const Rights = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Rights.vue')
// const Roles = () => import(/* webpackChunkName: "Users_Rights_Roles" */ '../components/power/Roles.vue')

// const Cate = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Cate.vue')
// const Params = () => import(/* webpackChunkName: "Cate_Params" */ '../components/goods/Params.vue')

// const GoodsList = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/List.vue')
// const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ '../components/goods/Add.vue')

// const Order = () => import(/* webpackChunkName: "Order_Report" */ '../components/order/Order.vue')
// const Report = () => import(/* webpackChunkName: "Order_Report" */ '../components/report/Report.vue')


Vue.use(VueRouter)

//?????????????????? { path: '/rights', component: Rights },
//???????????????   { path: '/login', component: () => import('../components/Login.vue') },
///???????????????????????????const Login = () => import('../components/Login.vue')
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      { path: '/users', component: User },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add },
      { path: '/orders', component: Order },
      { path: '/reports', component: Report }
    ]
  }
]

const router = new VueRouter({
  routes
})

//????????????????????????
router.beforeEach((to, from, next) => {
  //to ???????????????????????????
  //from ?????????????????????????????????
  //next ??????????????????????????????
  //next() ??????
  //next(./login) ????????????????????????login??????
  if (to.path === '/login') return next()
  //??????token
  const tokenStr = window.sessionStorage.getItem('token')
  //??????tokenstr????????????????????????login??????
  if (!tokenStr) return next('/login')
  //??????????????????next()??????
  next()
})
export default router
