<template>
  <div>
    <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator=">">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
    <el-table :data="rightsList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="权限名称" prop="authName"></el-table-column>
        <el-table-column label="路径" prop="path"></el-table-column>
        <el-table-column label="权限等级" prop="level">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag v-else-if="scope.row.level === '1'" type="success">二级</el-tag>
            <el-tag v-else type="warning">三级</el-tag>
            </template>
        </el-table-column>
      </el-table>
    </el-card>  
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有的权限列表
      rightsList: [],
    }
  },

   //生命周期函数
   created() {
    //获取所有的权限
    this.getRightsList();
  },

  methods: {
    async getRightsList() {
      const {data:res} = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }

      //this.$message.success('获取权限列表成功')

      //将获取的权限列表绑定到 data 中的 rightsList 数组中
      this.rightsList = res.data

      //console.log(this.rightsList)
    }
  },
}
</script>

<style lang="less" scoped>

</style>
