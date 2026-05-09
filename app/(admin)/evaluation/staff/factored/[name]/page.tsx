'use client'
import { ChangeEvent, useState } from "react"
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/app/state/store'
import { taskAdd, taskChange } from "@/app/state/task/taskSlice";
import LoadingButton from '../../../../../components/ui/LoadingButton';


type factored_type = {
    id: number
    task: number
    observed: number
    estimated: number
}

type otherType = {
    pearson: number
    rating: number
    allowance: number
}

export default function Home({ params }: { params: { name: string} } ) {
    const init: factored_type = { 
        id: 0, 
        task: 1, 
        observed: 0, 
        estimated: 0, 
    }
    const initOther: otherType = { 
        pearson: 0, 
        rating: 0, 
        allowance: 0, 
    }
    const dispatch = useDispatch()
    const tasks = useSelector( (state: RootState) => state.task )
    const [ inputs, setInputs ] = useState([ init ])
    const [ otherInputs, setOtherInputs ] = useState(initOther)


    function handleTaskAdd(event: { preventDefault: () => void }) {
        event.preventDefault()
        setInputs([
            ...inputs, 
            { 
                id: inputs.length + 1, 
                task: inputs.length + 1, 
                observed: 0, 
                estimated: 0
            }
        ]);
    }

    function handleInputChange(num: number, event: ChangeEvent<HTMLInputElement>){
        const newInputs = inputs.map( input => 
            input.id === num ? { ...input, [ event.target.name ]: parseFloat(event.target.value) || 0 } : input
        );
        setInputs(newInputs);
    }

    function handleOtherInputChange(event: ChangeEvent<HTMLInputElement>){
        setOtherInputs((prev) => {
            return { ...prev, [event.target.name]: event.target.value }
        });
    }

    interface EvaluateEvent extends React.FormEvent<HTMLFormElement> {}

    async function evaluate(event: EvaluateEvent): Promise<void> {
        event.preventDefault()
        let temp: number = 0
        let c_factor: number = 0
        let c_estimate: number
        let basic_time: number
        let std_time: number

        for (let i = 0; i < inputs.length; i++) {
            temp += ( inputs[i].observed - inputs[i].estimated )
        }

        c_factor = temp / inputs.length
        c_estimate = otherInputs.pearson * ( 1 + c_factor )
        basic_time = c_estimate * (otherInputs.rating / 100)
        std_time = basic_time + ( basic_time * ( otherInputs.allowance/100 ) )

        interface Task {
            name: string
            man_hours: number
            [key: string]: any
        }

        const tempTasks: Task[] = tasks.map((input: Task) => 
            input.name === params.name ? { ...input, man_hours: std_time } : input
        );

        console.log('new tasks are', tempTasks, 'old tasks are', tasks)

        // dispatch( taskChange(tempTasks) )
    }

    return(
        <form onSubmit={ evaluate } className="flex flex-col m-4 p-4">
            <h1 className="font-bold text-3xl my-6">{ `Task ${ params.name }` }</h1>
            <a className="me-3 hover:underline hover:text-pes" href="/evaluation/staff">Back</a>

            { 
                inputs.map((index, key) => {
                    return(
                        <div key={key} className="flex flex-col">
                            <h2 className="font-bold text-xl my-2">{`Sub-task ${index.task}`}</h2>
            
                            <div className="flex flex-wrap">
                                <label htmlFor="" className="flex flex-col w-72">
                                    Task name
                                    <input id={ `${index.id + 1}` } onChange={(event) => handleInputChange(index.id, event)} name="task" required className="border m-1 px-16 py-2 rounded" type="text" />
                                </label>
            
                                <label htmlFor="observed" className="flex flex-col w-72">
                                    Observed time
                                    <input id={ `${index.id + 1}` } onChange={(event) => handleInputChange(index.id, event)} name="observed" required className="border m-1 px-16 py-2 rounded" type="number" />
                                </label>
            
                                <label htmlFor="estimated" className="flex flex-col w-72">
                                    Estimated time
                                    <input id={ `${index.id + 1}` } onChange={(event) => handleInputChange(index.id, event)} name="estimated" required className="border m-1 px-16 py-2 rounded" type="number" />
                                </label>   
                            </div>
                        </div>
        
                    )
                })
            } 

            <hr className="border-3 border-gray-300 border-dashed my-4"/>

            <div className="flex">
                <label htmlFor="" className="flex flex-col w-72">
                    Pearson estimate
                    <input onChange={ handleOtherInputChange } name="pearson" required className="border me-6 my-2 px-16 py-2 rounded" type="number" />
                </label>

                <label htmlFor="" className="flex flex-col w-72">
                    Observed rating
                    <input onChange={ handleOtherInputChange } name="rating" required className="border me-6 my-2 px-16 py-2 rounded" type="number" />
                </label>

                <label htmlFor="" className="flex flex-col w-72">
                    % allowance
                    <input onChange={ handleOtherInputChange } name="allowance" required className="border me-6 my-2 px-16 py-2 rounded" type="number" />
                </label>                 
            </div>
  

            <button className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3">Done</button>
            <div className="flex my-1">
                <LoadingButton className="bg-pes w-fit me-4 rounded text-white px-16 py-3" onClick={ handleTaskAdd }>Add task</LoadingButton>
                <a href="/downloadables/relax.doc" className="bg-pes w-fit me-4 rounded text-white px-16 py-3">relaxation time guide</a>                    
                <a href="/downloadables/factored-estimate.docx" className="bg-pes w-fit me-4 rounded text-white px-16 py-3">Print form for survey</a>                    
            </div>                
        </form>
    )
}
