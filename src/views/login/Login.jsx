/*
 * @Author: 刘增辉
 * @Date: 2021-11-28 20:43:16
 * @LastEditTime: 2021-11-30 10:13:02
 * @LastEditors: Please set LastEditors
 * @Description: 用户登录页面
 * @FilePath: /my-react-app0/src/views/login/Login.jsx
 */
import { Button, message } from "antd"
const handleClick = (event) => {
    console.log(event)
    message.info(`${event.clientX}, ${event.clientY}`)
}
const Login = () => {
    return (
    <div>
        This is Login view
        <Button type="primary" style={{ marginLeft: 8 }} onClick={handleClick}>弹出点击坐标</Button>
    </div>);
}

export default Login;