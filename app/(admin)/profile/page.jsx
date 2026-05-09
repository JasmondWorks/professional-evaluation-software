import Link from "next/link"
import Profile from '../../components/profile'

export default function Home() {
   return(
      <main className="w-full flex flex-col border bg-gray-50">
         <Profile />
      </main>     
   )
}

