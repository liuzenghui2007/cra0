/*
 * @Author: 刘增辉
 * @Date: 2021-11-29 10:47:41
 * @LastEditTime: 2021-11-30 10:24:04
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /cra0/src/routers/index.jsx
 */
import { 
    Suspense,
    lazy
} from 'react'

import { 
    BrowserRouter, 
    Route, 
    Routes 
} from "react-router-dom";

const Login = lazy(() => import("../views/login/Login")) 
const Home = lazy(() => import("../views/home/Home"))
const Camera = lazy(() => import("../views/camera/Camera"))

const Routers = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading</div>}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/camera" element={<Camera />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default Routers;