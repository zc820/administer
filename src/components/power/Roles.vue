<template>
  <div>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator=">">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>权限管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
          <el-col>
            <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
          </el-col>
        </el-row>

        <!-- 角色列表区域 -->
        <el-table :data="rolesList" border stripe>
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-row
                :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                v-for="(item1, i1) in scope.row.children"
                :key="item1.id"
              >
                <!-- 渲染一级权限 -->
                <el-col :span="5">
                  <el-tag closable @close="removeRightById(scope.row, item1.id)">
                    {{item1.authName}}
                    <i class="el-icon-caret-right"></i>
                  </el-tag>
                </el-col>
                <!-- 渲染二级权限和三级权限 -->
                <el-col :span="19">
                  <!-- 通过for循环，嵌套渲染二级权限 -->
                  <el-row
                    :class="['bdbottom', i2 === 0 ? '' : 'bdtop', 'vcenter']"
                    v-for="(item2, i2) in item1.children"
                    :key="item2.id"
                  >
                    <!-- 渲染二级权限 -->
                    <el-col :span="6">
                      <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">
                        {{item2.authName}}
                        <i class="el-icon-caret-right"></i>
                      </el-tag>
                    </el-col>
                    <!-- 渲染三级权限 -->
                    <el-col :span="18">
                      <el-tag
                        type="warning"
                        v-for="item3 in item2.children"
                        :key="item3.id"
                        closable
                        @close="removeRightById(scope.row, item3.id)"
                      >
                        <!-- closable属性：tag标签上是否显示一个关闭按钮 -->
                        {{item3.authName}}
                      </el-tag>
                    </el-col>
                  </el-row>
                </el-col>
              </el-row>
              <!-- 渲染出了全部的表单数据 -->
              <!-- <pre>{{scope.row}}</pre> -->
            </template>
          </el-table-column>
          <!-- 索引列 -->
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <!-- slot-scope="scope"中的scope是自定义的 -->
            <template slot-scope="scope">
              <!-- 编辑角色按钮 -->
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditRoleDialog(scope.row.id)"
              >编辑</el-button>
              <!-- 删除角色按钮 -->
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeRoleById(scope.row.id)"
              >删除</el-button>
              <!-- 分配权限按钮 -->
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showSetRightDialog(scope.row)">
                分配权限
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 添加角色对话框 -->
      <el-dialog
        :visible.sync="addRoleDialogVisible"
        title="添加角色"
        width="50%"
        @close="addRoleDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          label-width="100px"
          :model="addRoleForm"
          :rules="addRoleFormRules"
          ref="addRoleFormRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span class="dialog-footer" slot="footer">
          <el-button @click="addRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="addRole">确定</el-button>
        </span>
      </el-dialog>

      <!-- 编辑角色对话框区域 -->
      <el-dialog
        :visible.sync="editRoleDialogVisible"
        title="修改角色信息"
        width="50%"
        @close="editRoleDialogClosed"
      >
        <!-- 内容主体区域 -->
        <el-form
          label-width="80px"
          :model="editRoleForm"
          :rules="editRoleFormRules"
          ref="editRoleFormRef"
        >
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部区域 -->
        <span class="dialog-footer" slot="footer">
          <el-button @click="editRoleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editRoleInfo">确定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <!-- props为整棵树指定数据绑定的字段 data为整棵树绑定数据源 -->
      <el-dialog :visible.sync="setRightDialogVisible" title="分配权限" width="50%" @close="setRightDialogClosed">
        <!-- 树形控件 -->
        <el-tree :data="rightslist" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef" />
        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="allotRights">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数组
      rolesList: [],

      //所有权限的数据
      rightslist: [],
      
      //树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName'
      },

      //默认选中的节点Id值数组
      defKeys: [],

      //当前即将分配权限的角色id
      roleId: '',

      //添加角色的表单数据
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      //通过id查询到的角色信息对象 以及编辑修改角色的表单数据
      editRoleForm: {
        roleName: '', 
        roleDesc: ''
      },
      //添加角色的表单验证规则对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //编辑角色的表单验证规则对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      //控制添加用户角色对话框的显示与隐藏
      addRoleDialogVisible: false,
      //控制编辑修改用户角色描述对话框的显示与隐藏
      editRoleDialogVisible: false,
      //控制分配权限对话框的显示与保存
      setRightDialogVisible: false,
    }
  },

  //生命周期函数
  created() {
    this.getRolesList()
  },

  methods: {
    //获取所有角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      //console.log(res)
      //将获取到的列表数据保存到 rolesList数组中
      this.rolesList = res.data
      //console.log(this.rolesList)
    },

    //点击按钮，添加新角色
    addRole() {
      //预验证
      this.$refs.addRoleFormRef.validate(async valid => {
        //console.log(valid)
        if (!valid) return
        //可以发起添加角色的网络请求
        const { data: res } = await this.$http.post('roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败!')
        }
        this.$message.success('添加角色成功!')
        //隐藏添加角色对话框
        this.addRoleDialogVisible = false
        //重新获取角色列表数据
        this.getRolesList()
      })
    },

    //监听添加角色对话框的关闭事件
    addRoleDialogClosed() {
      this.$refs.addRoleFormRef.resetFields()
    },

    //展示编辑角色的对话框
    async showEditRoleDialog(id) {
      //console.log(id);
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色信息失败!')
      }
      this.editRoleForm = res.data
      //console.log(this.editRoleForm);
      this.editRoleDialogVisible = true
    },
    //监听编辑角色对话框的关闭事件
    editRoleDialogClosed() {
      this.$refs.editRoleFormRef.resetFields()
    },
    //点击按钮，修改角色信息并提交
    editRoleInfo() {
      //预验证
      this.$refs.editRoleFormRef.validate(async valid => {
        //console.log(valid)
        if (!valid) return
        //可以发起编辑修改角色的网络请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editRoleForm.roleId,
          {
            roleName: this.editRoleForm.roleName,
            roleDesc: this.editRoleForm.roleDesc
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('更新角色信息失败!')
        }
        //提示修改信息成功
        this.$message.success('更新角色信息成功!')
        //关闭编辑修改角色信息对话框
        this.editRoleDialogVisible = false
        //重新获取角色列表数据
        this.getRolesList()
      })
    },

    //根据 id 删除对应角色的点击事件
    async removeRoleById(id) {
      //console.log(id)
      //询问用户是否删除数据
      const confirmRes = await this.$confirm(
        '此操作将永久删除该角色！ 是否继续?',
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败!')
      }
      this.$message.success('角色已删除')
      //重新获取角色列表，即刷新
      this.getRolesList()
    },

    //根据id删除对应权限
    async removeRightById(role, rightId) {
      //console.log(id)
      //询问用户是否删除数据
      const confirmRes = await this.$confirm(
        '此操作将永久删除该文件！ 是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          //点击取消的时候会捕获错误（用户的取消行为），用到catch
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
        return this.$message.info('已取消删除')
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败!')
      }
      this.$message.success('权限已删除')
      //重新获取列表，即刷新
      // this.getRolesList() 这种做法会重新获取整个数据列表，table表格会被重新渲染
      //此处的role就是这个函数一开始传递的参数role,防止页面全部刷新
      role.children = res.data
    },

    //展示分配权限的对话框
    async showSetRightDialog(role) {
      //将传递的role.id赋值到roleId中，便于allotRights()函数中调用
      this.roleId = role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限数据失败!')
      }
      //把获取到的数据保存到数组rightslist中
      this.rightslist = res.data
      console.log(this.rightslist)

      //递归获取三级节点的id
      //此处的role是由形参传递得来，它表示根节点
      this.getDefKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },

    //通过递归形式，获取角色下所有三级权限的id ，并保存到defkeys数组中
    getDefKeys(node, arr) {
      //如果当前的node节点不包含children属性，那么他就是三级节点
      if(!node.children) {
        //将node.id放进arr数组中
        return arr.push(node.id)
      }
      //foreach() 递归调用, 此处的item是自定义的，他表示子节点
      node.children.forEach(item => {
        this.getDefKeys(item, arr)
      });
    },

    //监听分配权限的对话框的关闭事件
    setRightDialogClosed() {
      //每次关闭后清空defKeys数组,不然上一个节点的id值一直保存数组中，最终复选框会全部勾选
      this.defKeys = []
    },

    //点击为角色分配权限
    async allotRights() {
      //将两个数组合并为一个数组
      const keys =[
        //...是展开运算符
        //获取到已选中节点的Id
        ...this.$refs.treeRef.getCheckedKeys(),
        //获取到半选中节点的Id
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      //字符串用 , 号拼接
     const idStr = keys.join(',')

      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {rids:idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    }

  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.el-table {
  padding: 10px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>

