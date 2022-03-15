import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import TreeTable from 'vue-table-with-tree-grid'

// 导入 NProgress 包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

//导入moment
import moment from 'moment'
//导入全局样式表
import './assets/css/global.css'
//导入字体图标
import './assets/fonts/iconfont.css'

//导入axios包
import axios from 'axios'
//配置请求的根路径'
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'


//再request拦截器中，展示进度条 NProgress.start();
//为axios添加拦截器,请求拦截器相当于再将请求发送到服务器前进行一次预处理，为每一次api的请求挂载Authorization请求头，这样有权限的api就可以调取成功
axios.interceptors.request.use(config => {
  NProgress.start();
  //console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem("token");
  //固定写法，最后必须加上 return config
  return config;
})

//在response拦截器中,关闭进度条 NProgress.done();
axios.interceptors.response.use(config => {
  NProgress.done();
  //固定写法，最后必须加上 return config
  return config;
})

//注册后 $http可以全局使用
Vue.prototype.$http = axios

Vue.config.productionTip = false

//注册全局可用组件 tree-table：插件名称 TreeTable：要注册的插件
Vue.component('tree-table', TreeTable)

//将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

//注册全局的时间过滤器 
//dateFormat是过滤器的名字
//originVal是形参
// Vue.filter('dateFormat', function(originVal) {
//   const dt = new Date(originVal)

//   const y = dt.getFullYear()
//   const m = (dt.getMonth() + 1 + '').padStart(2, '0')
//   const d = (dt.getDate() + '').padStart(2, '0')

//   const hh = (dt.getHours() + '').padStart(2, '0')
//   const mm = (dt.getMinutes() + '').padStart(2, '0')
//   const ss = (dt.getSeconds() + '').padStart(2, '0')

//   return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
// })

// 定义全局时间戳过滤器
Vue.filter('dateFormat', function(value) {
  return moment(value).format('YYYY-MM-DD HH:mm:ss')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
