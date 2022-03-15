<template>
  <div class="wrap">
    <div class="login_box">
      <!-- 登录表单区域 -->
      <el-form
        ref="loginformref"
        :model="loginform"
        :rules="loginformrules"
        label-width="120px"
        class="login_form"
      >
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginform.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginform.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item label=" " class="btns">
          <el-button type="info" @click="login">登录</el-button>
          <el-button type="info" @click="resetloginform">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 气泡效果 -->
    <ul>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
      <li></li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //这是登录表单的数据绑定对象
      loginform: {
        username: 'admin',
        password: '123456'
      },
      //这是表单的验证规则对象
      loginformrules: {
        //验证用户名是否合法
        username: [
          {
            required: true,
            message: '请输入登录名称',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '长度在3到10个字符之间',
            trigger: 'blur'
          }
        ],

        //验证密码是否合法
        password: [
          {
            min: 6,
            max: 15,
            message: '长度在6到15个字符之间',
            trigger: 'blur'
          },
          {
            required: true,
            message: '请输入登录密码',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  //点击重置按钮，重置登录表单
  methods: {
    resetloginform() {
      //console.log(this)
      this.$refs.loginformref.resetFields()
    },
    //
    login() {
      this.$refs.loginformref.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginform)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        //1、将登录成功之后的token，保存到客户端的sessionStorage中
        console.log(res)
        window.sessionStorage.setItem('token', res.data.token)
        //2、通过编程式导航跳转到后台主页
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
//导入气泡样式文件
@import '../assets/css/login.css';

.login_box {
  width: 450px;
  height: 300px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .btns {
    display: flex;
    justify-content: flex-end;
  }
  // .login_form {
  //   position: absolute;
  //   bottom: 0;
  //   width: 100%;
  //   padding: 0 20px;
  //   box-sizing: border-box;
  //   right: 25px;
  // }
  .login_form {
    position: absolute;
    transform:translate(-30px,90px);
    padding: 0 20px;
    width: 100%;
    box-sizing: border-box;
  }
}
</style>

