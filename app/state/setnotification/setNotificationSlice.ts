import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const setNotificationSlice = createSlice({
    name: 'setNotificationAction',
    initialState,
    reducers:{
        setNotificationView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { setNotificationView } = setNotificationSlice.actions
export default setNotificationSlice.reducer