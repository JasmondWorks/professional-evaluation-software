import Link from "next/link"
import Profile from '../../components/profile'

export default function Home() {
   return(
      <main className="w-full flex flex-col border bg-canvas">
         <Profile />
      </main>     
   )
}

