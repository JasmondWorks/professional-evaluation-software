import { createSlice } from '@reduxjs/toolkit'

const initialState: {name: string, man_hours: number}[] = []
const taskSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers:{
        taskAdd: (state, task) => {
            state.push(task.payload)
        },
        taskChange: (state, newTasks) => {
            state = newTasks.payload
        }
    }
})

export const { taskAdd, taskChange } = taskSlice.actions
export default taskSlice.reducer