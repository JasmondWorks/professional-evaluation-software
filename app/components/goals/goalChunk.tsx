"use client"
import { useEffect, useState } from "react"

// type goal = {
//    name: string
//    status: number
//    daysleft: any
//    user_id: string
// }

export default function Goals(){
   const [goals, setGoals] = useState<any[]>([])

   async function getGoals() {
      const access_token = localStorage.getItem('access_token');
      
      let res =  await fetch(`/api/getGoals`, {
         method: 'POST',
         headers:{
            'Content-Type': 'application/json'
         },
         body:JSON.stringify({
            token: access_token
         })
      })
      let data =  await res.json()

      console.log(data)
      setGoals(data)
   }

   function colorGrade( num: any ): string{
      if( typeof(num) == 'number' ){
        return (num < 50)? 'red' : 'green';       
      }
      else if ( typeof(num) == 'string' ) return 'yellow'
      return ''
   }

   useEffect(() => {
      getGoals()
   }, [])
   
   return(
      <>
         {
         !goals?
            <div className="p-4 m-2 bg-gray-50 rounded-sm flex justify-between">
               <p>Loading info....</p>
               <img src="loading.svg" alt="loading" className="h-6 w-6 animate-spin my-auto"/>
            </div>
         :
         <div className='metrics flex flex-col justify-normal p-4 py-1'>
            {
               goals?.map((i, key) => {
               return(
                  <>
                     <div key={ key } className='goal-metrics w-full flex justify-between my-4 text-sm'>
                        <p>{ i.name }</p>
                        <p className={ ` text-${ colorGrade(i.status) }-500 ` }> { typeof( i.status ) == 'string'? `${ i.status }` : `${ i.status }% Completed` } </p>
                        <p className={ ` text-${ colorGrade(i.daysleft) }-500 ` }>{ `${ i.daysleft } days left` }</p>        
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