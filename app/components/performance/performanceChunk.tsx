import { useEffect, useState } from "react"
import { ArrowUp, ArrowDown } from 'iconsax-react';


type userData = {
   id: number
   dept: string
   type: string
   yield: string
   user_id:string
}

export default function Performance(){
   const [performance, setPerformance] = useState<{ goodPerformance: userData[] | null, badPerformance: userData[] | null }>({ goodPerformance: null, badPerformance: null })

   async function getPerformance(){
      const access_token = localStorage.getItem('access_token');
      let res =  await fetch(`http://localhost:3000/api/getUserData`, {
         method: 'POST',
         headers:{
            'Content-Type': 'application/json'
         },
         body:JSON.stringify({
            token: access_token
         })
      })
      let data =  await res.json()
      console.log('performance is: ',data)
      setPerformance(data)
   }

   useEffect(() => {
      getPerformance()
   }, [])

   return(
      <>
         <p className='text-xl text-black  my-auto px-4 py-1'>Overperforming Employees</p>
         {
            !(performance.goodPerformance)?
               <div className="p-4 m-2 bg-gray-50 rounded-sm flex justify-between">
                  <p>Loading info....</p>
                  <img src="loading.svg" alt="loading" className="h-6 w-6 animate-spin my-auto"/>
               </div>
            :
            <div className='flex flex-col p-4'>
               {
                  performance?.goodPerformance.map((i, key) => {
                  return(
                     <>
                        <div key={ key } className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ i.user_id }</p>
                        <p> { i.dept } </p>
                        <p className={ ` text-green-500 flex` }>
                           <ArrowUp className='mt-auto font-thin'/>
                           { `${ i.yield }%` }
                        </p>        
                        </div>
                        <hr />                          
                     </>
                  )
                  })                    
               }  
            </div>                     
         }

         <p className='text-xl text-black  my-auto px-4 py-1'>Underperforming Employees</p>

         {
            !performance.badPerformance?
               <div className="p-4 m-2 bg-gray-50 rounded-sm flex justify-between">
                  <p>Loading info....</p>
                  <img src="loading.svg" alt="loading" className="h-6 w-6 animate-spin my-auto"/>
               </div>
            :
            <div className="flex flex-col p-4">
               {
                  performance?.badPerformance.map((i, key) => {
                  return(
                     <>
                        <div key={ key } className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ i.user_id }</p>
                        <p> { i.dept } </p>
                        <p className={ ` text-red-500 flex` }>
                           <ArrowDown className='mt-auto mx-1 font-thin' />
                           { `${ i.yield }%` }
                        </p>        
                        </div>
                        <hr />                          
                     </>
                  )
                  })                    
               }
            </div>
         }                     
      </>
   )
}