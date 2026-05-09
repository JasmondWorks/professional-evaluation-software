import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const actionSlice = createSlice({
    name: 'actions',
    initialState,
    reducers:{
        actionView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { actionView } = actionSlice.actions
export default actionSlice.reducer