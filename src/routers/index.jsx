/*
 * @Author: 刘增辉
 * @Date: 2021-11-29 10:47:41
 * @LastEditTime: 2021-11-29 11:02:41
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /cra0/src/routers/index.jsx
 */

import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "../views/login/Login"
import Home from "../views/home/Home"

const Routers = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={Login} />
                <Route path="/home" element={Home} />
            </Routes>
        </BrowserRouter>
    )
}

export default Routers;