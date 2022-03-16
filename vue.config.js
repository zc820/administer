module.exports = {
  //publicPath用于对webpack打包之后得到的静态资源前面进行一个路径的拼接
  publicPath: './',
  chainWebpack: config => {
    //发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      //entry找到默认的打包入口，调用clear则是删除默认的打包入口
      //add添加新的打包入口
      config
        .entry('app')
        .clear()
        .add('./src/main-prod.js')

      //通过external,加载外部cdn资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        lodash: '_',
        echarts: 'echarts',
        nprogress: 'NProgress',
        'vue-quill-editor': 'VueQuillEditor'
      })

      //自定义首页标题
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    //开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config
        .entry('app')
        .clear()
        .add('./src/main-dev.js')

      //自定义首页标题
      config.plugin('html').tap(args => {
        args[0].isProd = false
        return args
      })
    })
  }
}
