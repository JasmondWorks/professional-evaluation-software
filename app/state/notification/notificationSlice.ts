import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const notificationSlice = createSlice({
    name: 'notificationActions',
    initialState,
    reducers:{
        notificationView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { notificationView } = notificationSlice.actions
export default notificationSlice.reducer