import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Data from '../../Data';
import { faXmark } from '@fortawesome/free-solid-svg-icons'; 

function FilterSelected({filter, setFilterSelected}) {
    const iconCat=Data.iconOptions.find((e)=>e.name===filter.icon).icon
  return (
    <div className='flex flex-row justify-between bg-healthyGreen items-center my-2 w-full rounded-xl px-3 py-1 '>
        <FontAwesomeIcon icon={iconCat} />
        <p className=' text-left font-semibold text-sm w-full ml-2 '>{filter.name}</p>
        <FontAwesomeIcon onClick={()=>setFilterSelected(null)} className='cursor-pointer ' icon={faXmark} />
    </div>
  )
}

export default FilterSelected