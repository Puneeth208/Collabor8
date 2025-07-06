import React from 'react'
import Navbar from "./Navbar"
import { useQuery } from "@tanstack/react-query"
const Layout = ({children}) => {
  const {data:authUser,isLoading}=useQuery({queryKey:["authUser"]});
  console.log("authuser is in layout ",authUser)
  return (
    <div className='min-h-screen bg-base-100'>
        <Navbar/>
        <main className='max-w-7xl mx-auto px-3 py-6'>
            {children}
        </main>
    
    </div>
  )
}

export default Layout