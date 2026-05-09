import { createSlice } from '@reduxjs/toolkit'

type loggedState = {
    value: boolean;
}
const initialState: loggedState = {
    value: false,
}
const loggedSlice = createSlice({
    name: 'logged',
    initialState,
    reducers:{
        login: (state) => {
            state.value =true
        },
        logout: (state) => {
            state.value = false
        },
    }
})

export const { login, logout } = loggedSlice.actions
export default loggedSlice.reducer