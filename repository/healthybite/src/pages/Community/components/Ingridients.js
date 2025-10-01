import React from 'react'

const Ingridients = ({data}) => {
  return (
    <div className='flex flex-col justify-start items-start w-full p-1 max-h-40 overflow-y-auto px-2'>
        {data.map((item,index)=>
            (<div key={index} className='flex flex-row w-full justify-between items-center  py-1 rounded-md  px-2 bg-white text-healthyOrange my-1  '>
                <p className='text-sm sm:text-md font-semibold'>{item.name}</p>
                <p className='text-sm '>{item.quantity} {item.measure}</p>
            </div>)
        )}
    </div>
  )
}

export default Ingridients