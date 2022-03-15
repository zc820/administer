//这是项目发布阶段需要用到的 Babel 插件
const proPlugins = []
if(process.env.NODE_ENV === 'production') {
  proPlugins.push( 'transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    [
      'component',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ],
    //发布产品阶段时候的插件数组   ...是展开运算符
    ...proPlugins,
    //'transform-remove-console'

    //'@babel/plugin-syntax-dynamic-import'
  ]
}
