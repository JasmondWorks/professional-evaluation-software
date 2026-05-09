import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const notificationSentSlice = createSlice({
    name: 'notificationSentAction',
    initialState,
    reducers:{
        notificationSentView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { notificationSentView } = notificationSentSlice.actions
export default notificationSentSlice.reducer