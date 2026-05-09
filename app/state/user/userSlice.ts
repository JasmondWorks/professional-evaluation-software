import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   name: 'loading...'
}
const userSlice = createSlice({
    name: 'actions',
    initialState,
    reducers:{
        userChange: (state, param) => {
            state.name = param.payload
        }
    }
})

export const { userChange } = userSlice.actions
export default userSlice.reducer