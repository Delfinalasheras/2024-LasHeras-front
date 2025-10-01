import React from 'react'
import loader from '../assets/loader.gif'
function Loading() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
        <img src={loader} alt='Loading...' className="w-10/12 sm:w-1/2 md:w-1/3 lg:w-1/4 "/>
    </div>
  )
}

export default Loading