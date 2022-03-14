<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === 1">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send">
          <template slot-scope="scope">{{scope.row.is_send}}</template>
        </el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">{{scope.row.create_time | dateFormat }}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope>
            <el-button type="primary" size="mini" icon="el-icon-edit" @click="showDialog"></el-button>
            <el-button
              type="success"
              size="mini"
              icon="el-icon-location"
              @click="showProgressdialog"
            ></el-button>
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

    <!-- 修改地址对话框 -->
    <el-dialog
      :visible.sync="addressDialogVisible"
      title="修改地址"
      width="50%"
      @close="addressDialogClosed"
    >
      <!-- 内容主体区域 -->
      <el-form
        label-width="100px"
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            v-model="addressForm.address1"
            :options="cityData"
            :props="addressProps"
            @change="hangdleChange"
            clearable
            ref="cascaderRef"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部区域 -->
      <span class="dialog-footer" slot="footer">
        <el-button @click="addressDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addressDialogVisible = false">确定</el-button>
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog :visible.sync="progressVisible" title="物流进度" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >{{ activity.context }}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from './cityData.js'

export default {
  data() {
    return {
      //订单列表数组
      orderList: [],
      //查询参数的对象
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少条数据
        pagesize: 10
      },
      //订单总条数
      total: 0,

      //控制对话框的显示与隐藏
      addressDialogVisible: false,

      //控制对话框的显示与隐藏
      progressVisible: false,

      //地址的表单对象
      addressForm: {
        address1: [],
        address2: ''
      },
      //地址的表单验证规则
      addressFormRules: {
        address1: {
          required: true,
          message: '请选择省市区县',
          trigger: 'blur'
        },
        address2: {
          required: true,
          message: '请输入详细地址',
          trigger: 'blur'
        }
      },

      //属性名和属性值重名可以简写
      // cityData: cityData
      cityData,

      //指定级联选择器的配置对象
      addressProps: {
        //指定所选中的值
        //value: '',
        //指定看到的值
        //label: '',
        //指定父子嵌套的属性
        children: 'children',
        //次级菜单的展开方式(指定触发方式)
        expandTrigger: 'hover'
      },

      //物流信息数组
      //progressInfo: [],

      // 物流数据信息(假数据)
      progressInfo: [
        {
          time: '2018-05-10 09:39:00',
          ftime: '2018-05-10 09:39:00',
          context: '已签收,感谢使用顺丰,期待再次为您服务',
          location: ''
        },
        {
          time: '2018-05-10 08:23:00',
          ftime: '2018-05-10 08:23:00',
          context:
            '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
          location: ''
        },
        {
          time: '2018-05-10 07:32:00',
          ftime: '2018-05-10 07:32:00',
          context: '快件到达 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-10 02:03:00',
          ftime: '2018-05-10 02:03:00',
          context:
            '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
          location: ''
        },
        {
          time: '2018-05-09 23:05:00',
          ftime: '2018-05-09 23:05:00',
          context: '快件到达 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 21:21:00',
          ftime: '2018-05-09 21:21:00',
          context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
          location: ''
        },
        {
          time: '2018-05-09 13:07:00',
          ftime: '2018-05-09 13:07:00',
          context: '顺丰速运 已收取快件',
          location: ''
        },
        {
          time: '2018-05-09 12:25:03',
          ftime: '2018-05-09 12:25:03',
          context: '卖家发货',
          location: ''
        },
        {
          time: '2018-05-09 12:22:24',
          ftime: '2018-05-09 12:22:24',
          context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
          location: ''
        },
        {
          time: '2018-05-08 21:36:04',
          ftime: '2018-05-08 21:36:04',
          context: '商品已经下单',
          location: ''
        }
      ]
    }
  },

  created() {
    this.getOrderList()
  },

  methods: {
    //获取订单列表信息
    async getOrderList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.orderList = res.data.goods
      this.total = res.data.total
      console.log(res.data)
    },

    //监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      //console.log(newSize);
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    //监听页码值改变的事件
    handleCurrentChange(newPage) {
      //console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },

    //展示修改地址的对话框
    showDialog() {
      this.addressDialogVisible = true
    },

    //监听修改地址对话框的关闭事件
    addressDialogClosed() {
      this.$refs.addressFormRef.resetFields()
    },

    //级联选择器选中项变化时，会触发这个函数
    hangdleChange() {
      //选中后关闭级联选择器
      this.$refs.cascaderRef.dropDownVisible = false
    },

    //展示物流进度的对话框
    showProgressdialog() {
      // const { data: res } = await this.$http.get('/kuaidi/70365716896101')

      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流进度失败！')
      // }
      // this.progressInfo = rea.data
      // console.log(this.progressInfo)

      //提供测试的物流单号失效，使用假数据来模拟

      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>

@import '../../plugins/timeline.css';
@import '../../plugins/timeline-item.css';

.el-breadcrumb {
  margin-bottom: 20px;
}

.el-cascader {
  width: 100%;
}
</style>

