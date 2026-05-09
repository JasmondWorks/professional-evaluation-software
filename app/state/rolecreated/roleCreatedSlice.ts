import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const roleCreatedSlice = createSlice({
    name: 'roleCreatedAction',
    initialState,
    reducers:{
        roleCreatedView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { roleCreatedView } = roleCreatedSlice.actions
export default roleCreatedSlice.reducer