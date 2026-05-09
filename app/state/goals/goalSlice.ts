import { createSlice } from '@reduxjs/toolkit'

type goal = {
    name: string
    day_started: string
    description:string
    due_date: string
    id: number
    status: number
    user_id:string
}

type goalState = {
    new: boolean;
    view: boolean;
    edit: boolean;
    data: goal;
    delete: boolean;
}


const initialState: goalState = {
    new: false,
    data: {
        name: '',
        status: 0,
        description: '',
        day_started: '',
        due_date: '',
        id: 0,
        user_id: ''
    },
    edit: false,
    view: false,
    delete: false
}
const goalSlice = createSlice({
    name: 'goalActions',
    initialState,
    reducers:{
        newGoal: (state) => {
            state.new = !state.new
        },
        viewGoal: (state, { payload }) => {
            state.view = !state.view
            state.data = payload.payload
        },
        unviewGoal: (state) => {
            state.view = !state.view
        },
        editGoal: (state, { payload }) => {
            state.data = payload.payload
            state.data.due_date = state.data.due_date.includes('T')? payload.payload.due_date.split('T')[0] : state.data.due_date
        },
        uneditGoal: (state) => {
            state.edit = !state.edit
        },
        deleteGoal: (state) => {
            state.data = {
                name: '',
                status: 0,
                description: '',
                day_started: '',
                due_date: '01-01-2222',
                id: 0,
                user_id: ''
            },
            state.delete = !state.delete
            state.view = !state.view
        },
        cancelDelete: (state) => {
            state.delete = !state.delete
        }

    }
})

export const { newGoal, viewGoal, unviewGoal, editGoal, uneditGoal, deleteGoal, cancelDelete } = goalSlice.actions
export default goalSlice.reducer