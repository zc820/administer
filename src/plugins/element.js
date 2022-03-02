import Vue from 'vue'
/*import { Button } from 'element-ui'
import { Form, FormItem } from 'element-ui'
import { Input } from 'element-ui'

//导入弹框提示组件
import { Message } from 'element-ui'*/

import { Button, Message, Form, FormItem, Input } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//Message组件挂载到vue原型中
Vue.prototype.$message = Message
