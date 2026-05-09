'use client'
import { useEffect, useRef, useState } from "react"
import number_of_staff from "@/app/api/modules/numberOfstaff/numberOfStaff"
import grand_total_man_hours from "@/app/api/modules/numberOfstaff/method1/main"
import LoadingButton from '../../../components/ui/LoadingButton';

type DataEntry = {
    observed_time: number[],
    rating: number[],
    estimated_time: number[],
    relaxation_time: number[],
    contingency_time: number[],
    number_of_workers: number[],
    annual_frequency: number[],
};

type numberDataEntry = {
    available_hours: number,
    use_factor: number
};

export default function Home() {
    const [newExtra, setNewExtra] = useState< JSX.Element[] >([])
    const [arrayDataEntry, setArrayDataEntry] = useState<DataEntry>({
        observed_time: [0],
        rating: [0],
        estimated_time: [0],
        relaxation_time: [0],
        contingency_time: [0],
        number_of_workers: [0],
        annual_frequency: [0],
    });
    const [numberDataEntry, setNumberDataEntry] = useState<numberDataEntry>({
        available_hours: 0,
        use_factor: 0
    });
    const [evaluation, setEvaluation] = useState<number | null>(null)

    function handleDataEntry<K extends keyof DataEntry>(event: React.ChangeEvent<HTMLInputElement>, index: number, data: K) {
        event.preventDefault();
        setArrayDataEntry((prev) => ({
            ...prev,
            [data]: [
                ...prev[data].slice(0, index),
                parseInt(event.target.value),
                ...prev[data].slice(index + 1)
            ]
        }));
    }

    function handleNumberDataEntry(event: React.ChangeEvent<HTMLInputElement>){
        event.preventDefault()
        setNumberDataEntry(prev => (
            {...prev, [event.target.name]: Number(event.target.value)}
        ))
    }

    function handleTaskAdd(event: { preventDefault: () => void }) {
        event.preventDefault()
        let tempTask =
                <div className="flex flex-col">
                    <h1 className="font-bold text-lg my-2">{`Task ${ newExtra.length + 2 }`}</h1>

                    <div className="flex flex-wrap">
                        <label htmlFor="" className="flex flex-col w-72">
                            Observed time
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number" onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "observed_time")} }/>
                        </label>

                        <label htmlFor="" className="flex flex-col w-72">
                            {`Observed rating (0 - 200)`}
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "rating")} }/>
                        </label>

                        <label htmlFor="" className="flex flex-col w-72">
                            Relaxation time
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "relaxation_time")} }/>
                        </label>

                        <label htmlFor="" className="flex flex-col w-72">
                            Contingency allowance
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "contingency_time")} }/>
                        </label>  

                        <label htmlFor="" className="flex flex-col w-72">
                            Number of workers
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "number_of_workers")} }/>
                        </label>
        
                        <label htmlFor="" className="flex flex-col w-72">
                            Annual frequency
                            <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, (newExtra.length + 1), "annual_frequency")} }/>
                        </label>                       
                    </div>
                </div> 

        setNewExtra( prev => [ ...prev, tempTask ] )
    }

    function hanndleTaskRemove(event: { preventDefault: () => void }) {
        event.preventDefault()
        setNewExtra( prev => [ ...prev.slice(0, prev.length - 1) ] )
    }

    function handleEvaluate(event: { preventDefault: () => void }) {
        event.preventDefault()
        let grand_total = grand_total_man_hours(
            arrayDataEntry.observed_time,
            arrayDataEntry.rating,
            arrayDataEntry.relaxation_time, 
            arrayDataEntry.contingency_time,
            arrayDataEntry.number_of_workers,
            arrayDataEntry.annual_frequency
        )
        console.log(grand_total)
        let evaluated = number_of_staff(grand_total, numberDataEntry.available_hours, numberDataEntry.use_factor)
        console.log(`the evaluated number of staff is ${ evaluated }`)
        setEvaluation(evaluated)
    }

    return(
        <form className="flex flex-col m-4" onSubmit={() => {}}>
            <div className="p-2">
                <h1 className="font-bold text-3xl my-6">Plain estimating data entry</h1>

                <div>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg my-2">Task 1</h1>

                        <div className="flex flex-wrap">
                            <label htmlFor="" className="flex flex-col w-72">
                                Observed time
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number" onChange={ (e)=>{handleDataEntry(e, 0, "observed_time")} }/>
                            </label>

                            <label htmlFor="" className="flex flex-col w-72">
                                {`Observed rating (0 - 200)`}
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, 0, "rating")} }/>
                            </label>

                            <label htmlFor="" className="flex flex-col w-72">
                                Relaxation time
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, 0, "relaxation_time")} }/>
                            </label>

                            <label htmlFor="" className="flex flex-col w-72">
                                Contingency allowance
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, 0, "contingency_time")} }/>
                            </label>  

                            <label htmlFor="" className="flex flex-col w-72">
                                Number of workers
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, 0, "number_of_workers")} }/>
                            </label>
            
                            <label htmlFor="" className="flex flex-col w-72">
                                Annual frequency
                                <input name="" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={ (e)=>{handleDataEntry(e, 0, "annual_frequency")} }/>
                            </label>                      
                        </div>
                    </div> 

                    {
                        (newExtra.length == 0) ?
                            <></>
                        :
                        newExtra?.map((index: JSX.Element, key) => {
                            return(
                                <div key={key}>
                                    { index }
                                </div>
                            )
                        })
                    }                    
                </div>



                <hr className="border-dashed border-2 my-6"/>

                <label htmlFor="" className="flex flex-col w-72">
                    Available hours
                    <input name="available_hours" required className="border me-6 my-2 px-16 py-2 rounded" type="number" onChange={handleNumberDataEntry}/>
                </label>   

                <label htmlFor="" className="flex flex-col w-72">
                    Use factor
                    <input name="use_factor" required className="border me-6 my-2 px-16 py-2 rounded" type="number"  onChange={handleNumberDataEntry}/>
                </label>                 
            </div>

            <div className="flex flex-wrap my-4">
                <LoadingButton className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3" type="submit" onClick={ handleEvaluate }>Evaluate number of staff</LoadingButton>
                <a href="downloadables/relax.doc" className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3" >Relaxation time guide</a>
                <a href="/downloadables/plain-estimate.docx" className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3">Print task form</a>
                <LoadingButton className="bg-pes w-fit my-3 me-2 rounded text-white px-16 py-3" onClick={ handleTaskAdd } >Add new task +</LoadingButton>
            </div>
            <>    
                {
                    evaluation? (
                        <p>
                            The number of staff required for the following information is { evaluation }
                        </p>
                    ) : <></>              
                }
            </>
        </form>
    )
}