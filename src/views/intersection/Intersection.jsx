import React from 'react'

import { useIntersection } from 'react-use'
export default function Login() {
    // 图片懒加载
    let intersectionRef = React.useRef()
    return (
        <div ref={intersectionRef} style={{ marginTop: '1000px' }}>
            {'看不见'}
        </div>
    )
}
