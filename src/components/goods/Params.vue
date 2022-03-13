<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片注释图区域 -->
    <el-card>
      <!-- 提示框区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon/>

      <!-- 选择商品分类的区域 -->
      <el-row class="catSty">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 商品分类的级联选择框 -->
          <!-- options用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- v-model将选中的id值双向绑定到selectedCateKeys数组中，此处必须绑定的是数组 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="hangdleChange"
            clearable
            ref="cascaderRef"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab 页签区域 -->
      <!-- v-model="activeName"绑定的是el-tab-pane标签中的name属性，绑定那个name，打开浏览器就默认打开那个页签 -->
      <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加参数的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 这个表单中有个属性scope.row.attr_vals hangdleChange函数中将attr_vals由字符春变为数组-->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                  @keyup.enter.native="$event.target.blur(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="*"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showeEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="reomveParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加属性的按钮 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 这个表单中有个属性scope.row.attr_vals hangdleChange函数中将attr_vals由字符春变为数组-->
                <!-- key值能不能用id，一般取决于循环的数据是不是需要做到修改。与虚拟dom 的diff算法有关 -->
                <!-- 循环渲染tag标签 -->
                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i,scope.row)">{{item}}</el-tag>

                <!-- 输入的文本框 -->
                <el-input
                  v-if="scope.row.inputVisible"
                  ref="InputRef"
                  v-model="scope.row.inputValue"
                  class="input-new-tag"
                  size="small"
                   @keyup.enter.native="$event.target.blur(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                  @keyup.enter="$event.target.blur()"
                ></el-input>
                <!-- 添加的按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index" label="*"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showeEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="reomveParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数/属性对话框 -->
    <el-dialog
      :visible.sync="addDialogVisible"
      :title="'添加' + titleText"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加参数/属性的表单 -->
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addParams">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数/属性对话框 -->
    <el-dialog
      :visible.sync="editDialogVisible"
      :title="'添加' + titleText"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 修改参数/属性的表单 -->
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span class="dialog-footer" slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editParams">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      //商品分类列表
      catelist: [], 
      //指定级联选择器的配置对象
      cascaderProps: {
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

      //级联选择框双向绑定到的数组
      selectedCateKeys: [],

      //被激活的页签的名称,即打开页面时默认选中的tab页
      activeName: 'many',

      //动态参数的数据
      manyTableData: [],
      //静态属性的数据
      onlyTableData: [],

      //控制添加参数/属性的对话框的显示与隐藏
      addDialogVisible: false,

      //添加参数的表单验证对象
      addForm: {
        attr_name: ''
      },

      //添加参数的表单验证规则对象
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      },

      //控制编辑参数/属性的对话框的显示与隐藏
      editDialogVisible: false,

      //修改的表单数据对象
      editForm: {},

      //修改参数的表单验证规则对象
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur'
          }
        ]
      }

      //控制展开列中按钮和输入框的切换显示
      //inputVisible: false,
      //双向绑定展开列中文本框中输入的内容
      //inputValue: '',
    }
  },

  created() {
    this.getCateList()
  },

  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      //this.$message.success('获取商品分类成功')
      console.log(res.data)
      //把数据列表赋值给catelist
      this.catelist = res.data
    },

    //级联选择框选中项变化会触发这个函数
    async hangdleChange() {
      //如果selectedCateKeys数组的长度不是3，说明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        //防止先选择三级分类后又选中二级或者一级分类参数列表不变的问题
        this.manyTableData = []
        this.onlyTableData = []
        //选中后关闭级联选择器
        this.$refs.cascaderRef.dropDownVisible = false
        return
      }
      //否则选中的是三级分类
      console.log(this.selectedCateKeys)
      //根据所选分类的id，和当前所处的面板获取对应的参数，发起合适的网络请求
      //同时获取所有的参数项列表
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      //forEach循环遍历将attr_vals 字符串变为数组。attr_vals字符串是以空格为分隔符
      res.data.forEach(item => {
        //判断item.attr_vals是否为空，不为空的话直接调用，
        //否则直接返回一个空白的数组
        //因为空字符串使用(' ')会得到一个数组，数组里面包含一项空字符串
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //使每一行数据都有自己的inputVisible和inputValue值
        //控制文本框的显示与隐藏,
        item.inputVisible = false
        //文本框中输入的值
        item.inputValue = ''
      })

      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //console.log(res.data)
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }

      //级联选择器选中三级分类成功发送网络请求后关闭选择框
      this.$refs.cascaderRef.dropDownVisible = false
    },

    //tab页签点击事件的处理函数
    handleTabClick() {
      //console.log(this.activeName)
      this.hangdleChange()
    },

    //监听添加参数/属性对话框的关闭事件
    addDialogClosed() {
      //重置表单
      this.$refs.addFormRef.resetFields()
    },

    //点击确定按钮，添加新的参数/属性
    addParams() {
      //预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功！')
        //更新参数列表
        this.hangdleChange()
        this.addDialogVisible = false
      })
    },

    //点击按钮，展示修改参数/属性的对话框
    async showeEditDialog(id) {
      //查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    //监听修改参数/属性对话框的关闭事件
    editDialogClosed() {
      //重置表单
      this.$refs.editFormRef.resetFields()
    },

    //点击按钮，提交修改后的参数信息
    editParams() {
      //预验证  
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数失败！')
        }
        this.$message.success('修改参数成功！')
        //更新参数列表
        this.hangdleChange()
        this.editDialogVisible = false
      })
    },

    //根据id删除对应的参数项
    async reomveParams(id) {
      //询问用户是否删除该参数
      const confirmRes = await this.$confirm(
        '此操作将永久删除该参数！ 是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
        //箭头函数函数体只有一行代码 可以省略花括号 {}和return
      )
        .catch(err => err)
        .then()

      //如果用户确认删除，则返回值为字符串 confirm
      //如果用户取消删除，则返回值为字符串 cancel
      //console.log(res)
      if (confirmRes !== 'confirm') {
        return this.$message('已取消删除')
      }

      //返回值为confirm 则发出删除请求
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败!')
      }
      this.$message.success('该参数已删除')
      //重新获取参数列表，即刷新
      this.hangdleChange()
    },

    //展开列中文本框失去焦点或摁下enter键触发的事件
    async handleInputConfirm(row) {
      // trim()函数去除字符串两端的空格
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
      }
      //如果没有return，则证明输入的内容需要做后续处理
      row.attr_vals.push(row.inputValue.trim())
      //清空文本框
      row.inputValue = ''
      //关闭文本框
      row.inputVisible = false
      //发起网络请求，保存这次操作 
      //以下的网络请求可以用this.saveAttrVals(row)函数代替
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          //join(' ') 将数组用空格符拼接为字符串
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败!')
      }
      this.$message.success('修改参数项成功！')
    },

    //点击展开列中的按钮触发的事件
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // $nextTick 方法的作用，就是当页面上元素被重新渲染之后,才会执行回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.InputRef.$refs.input.focus()
      })
    },

    // 将对 attr_vals 的操作，保存到数据库
    async saveAttrVals(row) {
      // 需要发起请求，保存这次操作
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error('修改参数项失败！')
      }
      this.$message.success('修改参数项成功！')
    },

    //删除对应的参数和选项
    handleClosed(i,row) {
      row.attr_vals.splice(i,1)
      this.saveAttrVals(row)
    },
  },

  //计算属性
  computed: {
    //如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },

    //当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length == 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },

    //动态计算标题的文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.catSty {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 150px;
}
</style>

