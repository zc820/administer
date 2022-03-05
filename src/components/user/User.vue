<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片注释图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="14">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽 ，指定了作用域插槽，会覆盖原有的prop属性-->
          <!-- slot-scope="scope"中的scope是自定义的 -->
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)" ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        :currentPage="queryInfo.pagename"
        :page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 5, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="10"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog :visible.sync="addDialogVisible" title="添加用户" width="50%" @close="addDialogClosed">
      <!-- 内容主体区域 -->
      <el-form label-width="100px" :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span class="dialog-footer" slot="footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框区域 -->
    <el-dialog :visible.sync="editDialogVisible" title="修改用户信息" width="50%" @close="editDialogClosed">
      <!-- 内容主体区域 -->
      <el-form label-width="70px" :model="editForm" :rules="editFormRules" ref="editFormRef">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span class="dialog-footer" slot="footer">
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editUserInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      //获取用户列表的参数对象
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      //控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      //添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        //验证用户名是否合法
        username: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在3到10个字符之间',
            trigger: 'blur'
          }
        ],

        password: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '长度在6到15个字符之间',
            trigger: 'blur'
          }
        ],

        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          //验证邮箱是否合法
          //{ type: 'email' }
           {validator:checkEmail, trigger:'blur'}
        ],

        mobile: [
          { 
            required: true, 
            message: '请输入电话', 
            trigger: 'blur' },
            {validator:checkMobile, trigger:'blur'}
        ]
      },
      //控制编辑修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //通过id查询到的用户信息对象 以及添加修改用户的表单数据
      editForm: {
        username: '',
        email: '',
        mobile: ''
      },
      //添加编辑修改用户表单的验证规则对象
      editFormRules: {
        email: [
          {
            required: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          //验证邮箱是否合法
          //{ type: 'email' }
           {validator:checkEmail, trigger:'blur'}
        ],

        mobile: [
          { 
            required: true, 
            message: '请输入电话', 
            trigger: 'blur' },
            {validator:checkMobile, trigger:'blur'}
        ]
      },
      
    }
  },

  created() {
    this.getUserList()
  },

  methods: {
    //获取用户列表信息
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取用户列表失败!')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    //监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      //console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    //监听 switch 开关状态的改变
    async userStateChange(userinfo) {
      //console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },

    //监听添加用户对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },

    //点击按钮，添加新用户
    addUser() {
      //预验证
      this.$refs.addFormRef.validate(async valid => {
        //console.log(valid)
        if(!valid) return
        //可以发起添加用户的网络请求
        const {data: res} = await this.$http.post('users', this.addForm);
         if (res.meta.status !== 201)
       { return this.$message.error('添加用户失败!')}
         this.$message.success('添加用户成功!')
         //隐藏添加的用户对话框
         this.addDialogVisible = false
         //重新获取用户列表数据
         this.getUserList()
      })
    },

    //展示编辑用户的对话框
    async showEditDialog(id) {
      console.log(id);
      const { data: res} = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) { 
        return this.$message.error('查询用户信息失败!')}
        this.editForm = res.data
        //console.log(this.editForm);

        
        this.editDialogVisible = true
    },
    //监听编辑用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    //点击按钮，修改用户信息并提交
    editUserInfo() {
       //预验证
      this.$refs.editFormRef.validate(async valid => {
        //console.log(valid)
        if(!valid) return
        //可以发起编辑修改用户的网络请求
        const {data: res} = await this.$http.put('users/' + this.editForm.id, {email: this.editForm.email, mobile: this.editForm.mobile});
         if (res.meta.status !== 200)
       { return this.$message.error('更新用户信息失败!')}
         //提示修改信息成功
         this.$message.success('更新用户信息成功!')
         //关闭编辑修改用户信息对话框
         this.editDialogVisible = false
         //重新获取用户列表数据
         this.getUserList()
      })
    },
    //更据 id 删除对应用户的点击事件
    async removeUserById(id){
      //console.log(id)
      //询问用户是否删除数据
     const confirmRes = await this.$confirm(
    '此操作将永久删除该用户！ 是否继续?',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
    //箭头函数函数体只有一行代码 可以省略花括号 {}和return
  ).catch(err => err).then()

  //如果用户确认删除，则返回值为字符串 confirm
  //如果用户取消删除，则返回值为字符串 cancel
      //console.log(res)
      if(confirmRes !== 'confirm'){
        return this.$message('已取消删除')
      }

      const {data:res} = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) { 
        return this.$message.error('删除用户失败!')}
        this.$message.success('用户已删除')
        //重新获取用户列表，即刷新
        this.getUserList()
    },
  }
}
</script>

<style lang="less" scoped>
</style>
