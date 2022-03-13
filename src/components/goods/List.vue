<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <!-- slot="append"  就是一个UI摆放的位置 -->
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="100px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <!-- 作用域插槽 ，指定了作用域插槽，会覆盖原有的prop属性-->
          <!-- slot-scope="scope"中的scope是自定义的 -->
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-tooltip content="编辑" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row)"
              ></el-button>
            </el-tooltip>
            <!-- 删除按钮 -->
            <el-tooltip content="删除" placement="top" :enterable="false">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeGoodsById(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        :currentPage="queryInfo.pagenum"
        :page-size="queryInfo.pagesize"
        :page-sizes="[5, 10, 15, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        background
      ></el-pagination>
    </el-card>

    <!-- 编辑商品对话框区域 -->
    <el-dialog
      :visible.sync="editGoodsDialogVisible"
      title="修改商品信息"
      width="50%"
      @close="editGoodsDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-width="80px"
        :model="editGoodsForm"
        :rules="editGoodsFormRules"
        ref="editGoodsFormRef"
      >
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editGoodsForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editGoodsForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editGoodsForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span class="dialog-footer" slot="footer">
        <el-button @click="editGoodsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="editGoodsInfo">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //查询参数的对象
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 10
      },
      //商品数组列表
      goodslist: [],
      //总数据条数
      total: 0,
      //控制编辑商品对话框的显示与隐藏
      editGoodsDialogVisible: false,

      //编辑商品的表单数据对象
      editGoodsForm: {
        goods_id: '',
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        //商品所属的分类对象
        goods_cat: {},
      },

      //表单验证规则对象
      editGoodsFormRules: {
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
        }
      }
    }
  },
  created() {
    this.getGoodsList()
  },

  methods: {
    //根据分页获取对应的商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      console.log(res.data)
      //把数据列表赋值给catelist
      this.goodslist = res.data.goods
      this.total = res.data.total
    },

    //监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      //console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },

    //根据 id 删除对应商品的点击事件
    async removeGoodsById(id) {
      //询问用户是否删除商品
      const confirmRes = await this.$confirm(
        '此操作将永久删除该商品！ 是否继续?',
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

      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败!')
      }
      this.$message.success('商品已删除')
      //重新获取用户列表，即刷新
      this.getGoodsList()
    },

    //跳转至添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    },

    //展示编辑商品的对话框
    async showEditDialog(row) {
      const { data: res } = await this.$http.get('goods/' + row.goods_id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败!')
      }
      this.editGoodsForm = res.data
      this.editGoodsDialogVisible = true
      console.log(row)
    },

    //监听编辑商品信息对话框的关闭事件
    editGoodsDialogClosed() {
      this.$refs.editGoodsFormRef.resetFields()
    },

    //点击按钮，确定修改商品信息并提交
    editGoodsInfo() {
      this.editGoodsDialogVisible = false
      //console.log(this.editGoodsForm) 
      //预验证
      // this.$refs.editGoodsFormRef.validate(async valid => {
      //   if (!valid) return
      //   const { data: res } = await this.$http.post(
      //    'goods/'+this.editGoodsForm.goods_id,
      //     { goods_name: this.editGoodsForm.goods_name,
      //       goods_price: this.editGoodsForm.goods_price,
      //       goods_number: this.editGoodsForm.goods_number,
      //       goods_weight: this.editGoodsForm.goods_weight,
      //       goods_cat: this.editGoodsForm.goods_cat,
      //     }
      //   )
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('修改商品信息失败！')
      //   }
      //   this.$message.success('修改商品信息成功！')
      //   //更新商品列表
      //   this.getGoodsList()
      //   this.editGoodsDialogVisible = false
      // })
      this.$message.error('未完善！')
    },

  
  }
}
</script>

<style lang="less" scoped>
</style>
