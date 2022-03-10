<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片注释图区域 -->
    <el-card>
      <!-- 头部按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="true"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            style="color: lightgreen"
            v-if="scope.row.cat_deleted === false"
          ></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="option" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditCateDialog(scope.row.cat_id)"
          >编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"  @click="deleteCate(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        :currentPage="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类的表单 -->
      <el-form
        label-width="100px"
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options用来指定数据源 -->
          <!-- props 用来指定配置对象 -->
          <!-- v-model将选中的值双向绑定到selectedKeys数组中，此处必须绑定的是数组 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
            ref="cascaderRef"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      :visible.sync="editCateDialogVisible"
      title="修改分类"
      width="50%"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-width="80px"
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span class="dialog-footer" slot="footer">
        <el-button @click="editCateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editCateInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },

      //商品分类的数据列表，默认为空
      catelist: [],
      //总数据条数
      total: 0,
      //为table指定列的定义
      columns: [
        { label: '分类名称', prop: 'cat_name' },
        {
          label: '是否有效',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'order'
        },
        {
          label: '操作',
          //表示将当前列定义为模板列
          type: 'template',
          //表示当前这一列使用的模板名称
          template: 'option'
        }
      ],
      //控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,

      //添加分类的表单数据对象
      addCateForm: {
        //将要添加分类的名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //分类等级，默认添加的分类是一级分类
        cat_level: 0
      },

      //添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入分类名称',
            trigger: 'blur'
          }
        ]
      },

      //父级分类的列表
      parentCateList: [],
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
      //选中的父级分类的ID数组
      selectedKeys: [],

      //控制添加分类对话框的显示与隐藏
      editCateDialogVisible: false,

      //修改分类的表单数据对象
      editCateForm: {
        //需要修改的分类的名称
        cat_name: '',
      },

      //修改分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          {
            required: true,
            message: '请输入要修改的信息',
            trigger: 'blur'
          }
        ]
      },
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      //this.$message.success('获取商品列表成功')
      //console.log(res.data)
      //把数据列表赋值给catelist
      this.catelist = res.data.result
      //为总数据条数total赋值
      this.total = res.data.total
    },

    //监听pagesize 改变的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },

    //监听pagnum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },

    //点击按钮,展示添加分类的对话框
    showAddCateDialog() {
      //先获取父级分类的数据列表
      this.getParentCateList()
      //再展开对话框
      this.addCateDialogVisible = true
    },

    //获取父级分类的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this, $message.error('获取父级分类的数据失败')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },

    //选择项发生变化会触发这个函数
    parentCateChange() {
      console.log(this.selectedKeys)

      //级联选择器选中分类后关闭选择框
      this.$refs.cascaderRef.dropDownVisible = false;
      
      //如果selectedKeys 数组中的length > 0 证明选中了父级分类
      //反之，就说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        //父级分类的id
        this.addCateForm.cat_pid = 0
        //为当前分类的等级赋值
        this.addCateForm.cat_level = 0
      }
      
    },

    //点击确定按钮，添加新的分类
    addCate() {
      //预验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },

    //监听添加分类对话框关闭事件，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      //重置父级分类的id
      this.addCateForm.cat_pid = 0
      //重置当前分类的等级赋值
      this.addCateForm.cat_level = 0
    },

    //展示编辑分类的对话框
    async showEditCateDialog(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) { 
        return this.$message.error('获取分类失败！')}
        //console.log(res.data)
        this.editCateForm = res.data
        this.editCateDialogVisible = true
    },

    // 点击确定，提交修改过的分类信息
    editCateInfo() {
      //预验证
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        //可以发起编辑修改分类的网络请求
        const { data: res } =  await this.$http.put(`categories/${this.editCateForm.cat_id}`,{cat_name:this.editCateForm.cat_name})
        if (res.meta.status !== 200) {
        return this.$message.error('更新分类数据失败!')
      }
      this.$message.success('更新分类数据成功!')
      this.getCateList()
      this.editCateDialogVisbel = false
      } )
    },

    //删除分类
    async deleteCate(id) {
      //询问用户是否删除分类
      const confirmRes = await this.$confirm(
        '此操作将永久删除该分类！ 是否继续?',
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
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除分类失败!')
      }
      this.$message.success('分类已删除')
      //重新获取用户列表，即刷新
      this.getCateList()
    
    },
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>
