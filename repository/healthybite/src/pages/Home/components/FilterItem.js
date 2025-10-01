import React,{useEffect, useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Data from '../../Data';

export default function FilterItem({category, setFilterSelected}) {
    const iconCat=Data.iconOptions.find((e)=>e.name===category.icon).icon
  return (
    <button key={category.id}  onClick={()=>setFilterSelected(category)} className='flex flex-row  categorys-center text-healthyGreen border-2  border-healthyGreen hover:bg-healthyGreen hover:text-white w-full font-semibold hover:cursor-pointer text-left text-sm px-4 py-1 rounded-md mt-2'>
        <FontAwesomeIcon icon={iconCat} className=' text-xl mr-3'/>
        <p>{category.name}</p>
    </button>
  )
}
