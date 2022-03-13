<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示区域 -->
      <el-alert title="添加商品信息" show-icon center type="info" effect="dark" :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <!-- activeIndex - 0 ,字符串和数字运算。得出的结果为数字 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tab栏区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model=" activeIndex"
          tab-position="left"
          :before-leave="beroreTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <!-- prop与addFormRules和addForm相关联 -->
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <!-- 商品分类的级联选择框 -->
              <!-- options用来指定数据源 -->
              <!-- props 用来指定配置对象 -->
              <!-- v-model将选中的goods_cat值双向绑定到addForm数组中，此处必须绑定的是数组 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="catelist"
                :props="cateProps"
                @change="hangdleChange"
                clearable
                ref="cascaderRef"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
              <!-- 复选框组 -->
              <!-- <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>-->
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 图片上传 -->
            <!-- action 表示图片要上传到的后台API地址 -->
            <!-- :headers="headerObj 手动绑定headers请求头 token -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="preViewPath" alt class="previewImg">
    </el-dialog>
  </div>
</template>

<script>
//导入lodash, 用下划线接收
import _ from 'lodash'

export default {
  data() {
    return {
      //此处的0为字符串
      activeIndex: '0',
      //添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        //商品所属的分类数组
        goods_cat: [],
        //图片的数组
        pics: [],
        //商品的详情描述
        goods_introduce: '',
        attrs: []
      },
      //表单验证规则对象
      addFormRules: {
        goods_name: {
          required: true,
          message: '请输入商品名称',
          trigger: 'blur'
        },
        goods_price: {
          required: true,
          message: '请输入商品价格',
          trigger: 'blur'
        },
        goods_weight: {
          required: true,
          message: '请输入商品重量',
          trigger: 'blur'
        },
        goods_number: {
          required: true,
          message: '请输入商品数量',
          trigger: 'blur'
        },
        goods_cat: {
          required: true,
          message: '请选择商品分类',
          trigger: 'blur'
        }
      },

      //商品分类列表数组
      catelist: [],

      //指定级联选择器的配置对象
      cateProps: {
        //指定所选中的值
        value: 'cat_id',
        //指定看到的值
        label: 'cat_name',
        //指定父子嵌套的属性
        children: 'children',
        //次级菜单的展开方式(指定触发方式)
        expandTrigger: 'hover',
        //可以选择任意一级的选项
        checkStrictly: true
      },

      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],
      // 上传图片的URL地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      //图片上传组件的headers 请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //上传的图片的url地址
      preViewPath: '',
      //控制图片预览对话框的显示与隐藏
      previewVisible: false
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    //获取所有的商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类数据失败')
      }
      //this.$message.success('获取商品分类数据成功')
      //console.log(res.data)
      //把数据列表赋值给catelist
      this.catelist = res.data
    },

    //级联选择器选中项变化时，会触发这个函数
    hangdleChange() {
      //如果addForm.goods_cat数组的长度不是3，说明选中的不是三级分类
      if (this.addForm.goods_cat.length !== 3) {
        //不等于3就清空
        this.addForm.goods_cat = []

        //选中后关闭级联选择器
        this.$refs.cascaderRef.dropDownVisible = false
        return
      }
      this.$refs.cascaderRef.dropDownVisible = false
      //否则选中的是三级分类
      console.log(this.addForm.goods_cat)
    },

    beroreTabLeave(activeName, oldActiveName) {
      // console.log('即将离开的标签页名字是：' + oldActiveName)
      // console.log('即将进入的标签页名字是：' + activeName)
      // return false

      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },

    async tabClicked() {
      //console.log(this.activeIndex)
      //证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态参数列表失败！')
        }
        console.log(res.data)

        //字符串转变为数组
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      }

      //证明访问的是商品属性面板
      else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态属性列表失败！')
        }
        console.log(res.data)

        //字符串转变为数组
        // res.data.forEach(item => {
        //   item.attr_vals = item.attr_vals.length ===0 ? [] : item.attr_vals.split(' ')
        // })
        this.onlyTableData = res.data
      }
    },

    // 处理图片预览效果,预览图片时触发
    handlePreview(file) {
      //console.log(file)
      //url是真正的地址
      this.preViewPath = file.response.data.url
      this.previewVisible = true
    },

    // 处理移除图片的操作, tmp_path是一个临时路径
    handleRemove(file) {
      // console.log(file)
      // 1. 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2. 从 pics 数组中，找到这个图片对应的索引值
      //findIndex 遍历数组
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm)
    },

    //监听图片上传成功的事件
    handleSuccess(response) {
      console.log(response)
      //1、拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      //2、将图片信息对象 push 到pics数组中
      this.addForm.pics.push(picInfo)
      //console.log(this.addForm.pics)
    },

    //添加商品的内容
    add() {
      console.log(this.addForm)
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        //执行添加的业务逻辑
        //goods_cat.join(',')与级联选择器中的addForm.goods_cat必须是数组产生冲突
        //此处采用深拷贝解决冲突  lodash cloneDeep(obj)
        //如果不复制，直接 const form = this.addForm的话，form和addForm共用一个地址
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        //处理动态参数
        this.manyTableData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }
          this.addForm.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        //不直接push给form，是因为form是const定义的，不允许修改，只能改变对象属性
        form.attrs = this.addForm.attrs
        console.log(form)

        //发起请求，添加商品
        //商品的名称必须是唯一的，不能重复
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    },
  },

  computed: {
    //当前选中的三级分类的id
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
