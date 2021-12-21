import React from 'react'

import { useGeolocation } from 'react-use'
export default function Login() {
    let state = useGeolocation()
    return (
        <div>
            {JSON.stringify(state, null, 2)}
        </div>
    )
}
