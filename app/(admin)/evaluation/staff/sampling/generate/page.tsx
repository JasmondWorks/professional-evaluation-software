'use client'
import { useEffect, useRef, useState } from "react"
import LoadingButton from '../../../../../components/ui/LoadingButton';

export default function Generate(){
    const [workDays, setWorkDays] = useState<{ day: number, time: number }[]>([])
    const [visible, setVisible] = useState(false)
    const [values, setValues] = useState({ct: 0, hw: 0, md: 0, no: 0})

    function handleGeneratedStudy() {
        let randArr = []
        let randNo = Math.random()
        let val  = ((60 * values.hw * 2) - (values.no * values.md)) / values.no
        randArr.push({ 
            day: Math.round(1 + (randNo * 27)), 
            time: values.ct + ( values.md + (( val - values.md) * randNo) ) 
        })

        console.log( values, val )
        console.log( `${ values.ct } + ( ${values.md} + (( ${val} - ${values.md}) * ${randNo}) ) }` )

        for(let i = 0; i < 4; i++){
            let randNo = Math.random()
            randArr.push({
                day: Math.round(1 + (randNo * 29)),
                time: values.ct + ( values.md + (( val - values.md) * randNo) ) 
            })
        }

        for(let i = 0; i < 7; i++){
            let randNo = Math.random()
            randArr.push({
                day: Math.round(1 + (randNo * 30)),
                time: values.ct + ( values.md + (( val - values.md) * randNo) ) 
            })
        }

        setWorkDays(randArr)
        setVisible(prev => !prev)
    }

    function handleChange(event: { target: { name: any; value: any } }){
        setValues((prev) => {
            return { ...prev, [event.target.name] : Number(event.target.value) }
        })
    }
    
    return(
        <div className="flex flex-wrap">
            <div style={{ display: visible ? '' : 'none' }} className="text-xl bg-white p-6 px-20 rounded-md flex flex-col absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg">
                <h1 className="font-bold text-pes text-2xl my-2">Generated work study days/hours</h1>
                
                <p>jan - { workDays[5]?.day }, { workDays[5]?.time }</p> 
                <p>feb - { workDays[0]?.day }, { workDays[0]?.time }</p>
                <p>mar - { workDays[6]?.day }, { workDays[6]?.time }</p>
                <p>Apr - { workDays[1]?.day }, { workDays[1]?.time }</p>
                <p>may - { workDays[7]?.day }, { workDays[7]?.time }</p>
                <p>jun - { workDays[2]?.day }, { workDays[2]?.time }</p>
                <p>jul - { workDays[8]?.day }, { workDays[8]?.time }</p>
                <p>Aug - { workDays[9]?.day }, { workDays[9]?.time }</p>
                <p>Sept - { workDays[3]?.day }, { workDays[3]?.time }</p>
                <p>Oct - { workDays[10]?.day }, { workDays[10]?.time }</p>
                <p>Nov - { workDays[4]?.day }, { workDays[4]?.time }</p>
                <p>Dec - { workDays[11]?.day }, { workDays[11]?.time }</p>
            </div>

            <label htmlFor="" className="flex flex-col w-72">
                Commencement time
                <input onChange={ handleChange } name="ct" required className="border m-1 px-16 py-2 rounded" type="number" />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
                Minimum duration
                <input onChange={ handleChange } name="md" required className="border m-1 px-16 py-2 rounded" type="number" />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
                hours of work
                <input onChange={ handleChange } name="hw" required className="border m-1 px-16 py-2 rounded" type="number" />
            </label>

            <label htmlFor="" className="flex flex-col w-72">
                No of Observations
                <input onChange={ handleChange } name="no" required className="border m-1 px-16 py-2 rounded" type="number" />
            </label>

            <LoadingButton className="bg-pes w-fit my-3 me-2 rounded text-white px-32 py-3" onClick={ handleGeneratedStudy }>Generate random study day/hours</LoadingButton>

        </div>
    )
}