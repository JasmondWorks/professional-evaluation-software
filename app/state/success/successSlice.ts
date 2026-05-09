import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const successSlice = createSlice({
    name: 'successAction',
    initialState,
    reducers:{
        successView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { successView } = successSlice.actions
export default successSlice.reducer