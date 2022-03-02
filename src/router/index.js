import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'


Vue.use(VueRouter)

const routes = [
  { path:'/', redirect:'/login'},
  { path: '/login', component: Login },
  { path: '/home', component: Home },
]

const router = new VueRouter({
  routes
})

//挂载路由导航守卫
router.beforeEach((to, from, next) => {
  //to 表示将要访问的路径
  //from 代表从那个路径跳转而来
  //next 是一个函数，表示放行
  //next() 放行
  //next(./login) 强制放行，跳转到login页面
  if(to.path === '/login') return next();
  //获取token
  const tokenStr = window.sessionStorage.getItem('token');
  //如果tokenstr为空，强制跳转到login页面
  if(!tokenStr) return next('/login');
  //否则继续执行next()函数
  next();

})
export default router
