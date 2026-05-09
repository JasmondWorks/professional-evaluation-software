import { createSlice } from '@reduxjs/toolkit'

type loadingState = {
   visible: boolean;
}

const initialState: loadingState = {
   visible: false,
}

const loadingSlice = createSlice({
   name: 'loading',
   initialState,
   reducers:{
      loadingSwitch: (state) => {
         state.visible = !state.visible
      },
   }
})

export const { loadingSwitch } = loadingSlice.actions
export default loadingSlice.reducer