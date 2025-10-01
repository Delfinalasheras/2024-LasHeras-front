import React from 'react'

function DataUser({label,value }) {
  return (
    <div className="flex flex-col my-1 w-full min-w-64 mr-0  sm:mr-3">
        <div className="flex flex-col md:flex-row justify-between">
            <p className="font-quicksand text-start text-sm font-bold text-darkGray">{label}</p>
        </div>
        <p  className={`focus:outline-none focus:ring focus:ring-healthyGreen decoration-none bg-white p-1 md:p-2 rounded-md md:rounded-xl font-quicksand my-1 text-sm md:text-md`}>{value}</p>
    </div>
  )
}

export default DataUser