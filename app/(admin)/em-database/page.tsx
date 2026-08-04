'use client'

import React, { useState } from 'react'
import Employee from '@/app/components/em-database routes/Employee';
import Roles from '@/app/components/em-database routes/Roles';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';

export default function Database() {
   const [databaseView, setDatabaseView] = useState('employee')

   return (
      <div className="flex flex-col w-full min-h-screen">
         <Tabs value={databaseView} onValueChange={setDatabaseView} className="w-full">
            <div className="px-4 sm:px-6 lg:px-8 pt-6 pb-3 border-b border-line bg-surface">
               <h1 className="text-xl sm:text-2xl font-semibold text-strong tracking-tight mb-3">
                  Employee database
               </h1>
               <TabsList>
                  <TabsTrigger value="employee">Employees</TabsTrigger>
                  <TabsTrigger value="roles">Roles &amp; permissions</TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="employee" className="mt-0">
               <Employee />
            </TabsContent>
            <TabsContent value="roles" className="mt-0">
               <Roles />
            </TabsContent>
         </Tabs>
      </div>
   )
}
