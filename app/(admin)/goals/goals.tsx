'use client'
import Image from "next/image"
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { newGoal, viewGoal } from "@/app/state/goals/goalSlice";
import { Status, CalendarRemove } from 'iconsax-react'
import jwt from "jsonwebtoken";
import { getAccessToken } from '@/app/utils/auth';


function colorGrade( num: any ): string{
    return (num < 50)? 'red' : 'green';       
}

type Goal = {
    name: string;
    status: number | string;
    daysLeft: number;
    due_date: string;
    evaluation_type?: string;
}

type EvaluationType = 'appraisal' | 'performance' | 'stress'

const EVAL_LABELS: Record<EvaluationType, string> = {
    appraisal: 'Appraisal',
    performance: 'Performance',
    stress: 'Stress',
}

export default function Goals(){
    const [grid, setGrid] = useState(false)
    const [goals, setGoals] = useState<Goal[]>([])
    const [loadingGoals, setLoadingGoals] = useState(true)
    const dispatch = useDispatch()
    const [user, setUser] = useState({name: '', role: '', org: '', id: ''})
    const [evaluation, setEvaluation] = useState<EvaluationType[]>([])
    const [toggling, setToggling] = useState<EvaluationType | null>(null)

    useEffect(() => {
        const access_token = getAccessToken() as string
        const tokenData = jwt.decode(access_token) as any

        if (tokenData && typeof tokenData === 'object' && 'name' in tokenData) {
            setUser({
                name: tokenData.name ?? '',
                role: tokenData.role ?? '',
                org: tokenData.org ?? '',
                id: tokenData.id ?? ''
            });
        }

        async function fetchGoal() {
            const data = await fetch('/api/getGoals', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(tokenData)
            })
            const goalData = await data.json()
            setGoals(goalData)
            setLoadingGoals(false)
        }

        fetchGoal()
    }, [])

    // Fetch current org evaluation state for admin
    useEffect(() => {
        if (!user.org || user.role !== 'admin') return

        fetch(`/api/org/${encodeURIComponent(user.org)}`)
            .then(r => r.json())
            .then(res => {
                if (res?.data?.evaluation) setEvaluation(res.data.evaluation)
            })
            .catch(console.error)
    }, [user.org, user.role])

    async function handleToggle(type: EvaluationType, currentlyEnabled: boolean) {
        setToggling(type)
        try {
            const token = getAccessToken()
            const res = await fetch('/api/toggleEvaluation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, evaluation_type: type, enabled: !currentlyEnabled })
            })
            const data = await res.json()
            if (res.ok) setEvaluation(data.evaluation)
            else alert(data.error || 'Failed to update')
        } catch (err) {
            console.error(err)
            alert('Error updating evaluation')
        } finally {
            setToggling(null)
        }
    }

    return(
        <main className="m-6">
            <div className="goals flex justify-between">
                <h1 className="text-2xl font-bold my-auto">Goals</h1>

                <div className="actions flex justify-between">
                    <div className={ `${ grid? 'border-pes text-pes': '' } grid rounded-md border hover:border-pes mx-3 my-auto p-1` } onClick={ () => setGrid(true) }>
                        <Image width={ 25 } height={ 25 } src={ `/grid.svg` } alt={`grid`}/>
                    </div>
                    <div className={`${ grid? '': 'border-pes text-pes' } list border rounded-md mx-3 my-auto p-1 hover:border-pes`} onClick={ () => setGrid(false) }>
                        <Image width={ 25 } height={ 25 } src={ `/list.svg` } alt={`list`}/>
                    </div>

                    {
                        user?.role == 'admin' &&
                        <div className="bg-pes py-3 px-8 rounded-md text-white new ms-12 cursor-pointer" onClick={ () => dispatch( newGoal() )}>
                            Set new Goal
                        </div>
                    }
                </div>
            </div>

            {/* Admin evaluation toggle controls */}
            {user.role === 'admin' && (
                <div className="my-6 bg-white border rounded-md p-6">
                    <h2 className="font-semibold text-lg mb-1">Data Entry Access Controls</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Enable or disable each form type for staff. Changes take effect immediately.
                    </p>
                    <div className="flex gap-6 flex-wrap">
                        {(Object.keys(EVAL_LABELS) as EvaluationType[]).map((type) => {
                            const isEnabled = evaluation.includes(type)
                            const isLoading = toggling === type

                            // Find the most recent goal for this type to show due date
                            const relatedGoal = goals.find(
                                (g: any) => g.name?.toLowerCase().includes(type) || g.evaluation_type === type
                            )
                            const dueDate = relatedGoal?.due_date
                                ? new Date(relatedGoal.due_date).toLocaleDateString()
                                : null
                            const isPastDue = relatedGoal?.due_date
                                ? new Date(relatedGoal.due_date) < new Date()
                                : false

                            return (
                                <div key={type} className="flex flex-col gap-2 border rounded-md p-4 min-w-[180px]">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="font-medium">{EVAL_LABELS[type]}</span>
                                        <button
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => handleToggle(type, isEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none
                                                ${isEnabled ? 'bg-pes' : 'bg-gray-300'}
                                                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                                ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                                            />
                                        </button>
                                    </div>
                                    <span className={`text-xs font-semibold ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                        {isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                    {dueDate && (
                                        <span className={`text-xs ${isPastDue ? 'text-red-500' : 'text-gray-400'}`}>
                                            Due: {dueDate}{isPastDue ? ' (past due)' : ''}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            <div className="flex flex-col justify-center">
            {
                loadingGoals ? 
                <div className="flex flex-col my-8">
                    <div className="h-12 w-full rounded-md animate-pulse bg-gray-100 m-1"></div>
                    <div className="h-12 w-full rounded-md animate-pulse bg-gray-100 m-1"></div>
                    <div className="h-12 w-full rounded-md animate-pulse bg-gray-100 m-1"></div>
                    <div className="h-12 w-full rounded-md animate-pulse bg-gray-100 m-1"></div>
                </div>
                : goals.length === 0 ?
                <div className="flex flex-col items-center justify-center my-16 text-gray-400">
                    <p className="text-lg">No goals set yet.</p>
                    {user.role === 'admin' && <p className="text-sm mt-1">Click "Set new Goal" to get started.</p>}
                </div>
                : 
                <div className={ `${ grid? 'grid grid-cols-3 gap-4': 'flex flex-col' } my-8 ` } >
                    {
                        goals?.map((i, key) => {
                            return(
                                <div key={key} className={ `${ grid? 'w-72 py-6': 'flex justify-between w-full py-1' } bg-white rounded-md border border-gray-100 px-12` } onClick={ async () => { console.log(i); dispatch( viewGoal({ payload: i, type: 'view' }) )} }>
                                    <h1 className={ `${ grid? 'text-xl font-bold': '' } my-2` }>
                                        { i.name }
                                    </h1>

                                    <p className='flex my-auto'>
                                        <Status />
                                        <span className={ `mx-2 text-${ typeof(i.status) == 'number' ? colorGrade(i.status): 'yellow' }-500 ` }>
                                            { 
                                                typeof(i.status) == 'number'? 
                                                    `${ i.status }% completed`
                                                : 
                                                    i.status 
                                            }
                                        </span>
                                    </p>

                                    <p className='flex my-auto'>
                                        <CalendarRemove />
                                        <span className={ `mx-2 text-${ typeof(i.daysLeft) == 'number' ? colorGrade(i.daysLeft): 'yellow' }-500 ` }>
                                            { i.daysLeft } days left
                                        </span>
                                    </p>
                                </div>                                    
                            )
                        })
                    }
                </div>
            }
            </div>
        </main>
    )
}