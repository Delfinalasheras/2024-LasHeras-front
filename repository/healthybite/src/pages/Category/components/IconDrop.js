import React from 'react'
import Data from '../../Data'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function IconDrop({handleIcon}) {

    const iconOptions = Data.iconOptions

    return (
    <div className='w-full flex justify-end items-start relative'>
        <div className='w-2/12 max-h-48 overflow-y-auto  absolute shadow-lg bg-white p-1 rounded-md mb-1 flex flex-col items-center justify-center overflow-x-auto'>
            {iconOptions.map((item)=>
                <FontAwesomeIcon onClick={()=>handleIcon(item)} key={item.name} icon={item.icon} className='text-xl text-healthyGray1 mt-2 hover:cursor-pointer  hover:text-healthyDarkGray1' />)}
        </div>
    </div>
    )
}
