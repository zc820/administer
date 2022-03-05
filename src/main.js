import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

//导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入axios包
import axios from 'axios'
//配置请求的根路径'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

//为axios添加拦截器,请求拦截器相当于再将请求发送到服务器前进行一次预处理，为每一次api的请求挂载Authorization请求头，这样有权限的api就可以调取成功
axios.interceptors.request.use(config => {
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  //固定写法，最后必须加上 return config
  return config;
})

Vue.prototype.$http = axios

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
