import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    visible: false
}
const failureSlice = createSlice({
    name: 'failureAction',
    initialState,
    reducers:{
        failureView: (state) => {
            state.visible = !state.visible
        }
    }
})

export const { failureView } = failureSlice.actions
export default failureSlice.reducer