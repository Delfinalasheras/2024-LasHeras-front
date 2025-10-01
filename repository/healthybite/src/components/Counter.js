import React,{useState} from 'react'
import { faAngleDown, faAngleUp} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Counter = ({value,setValue, colour}) => {
  return (
    <div className='flex ml-2 rounded-md bg-healthyGray2 justify-center items-center '>
        <p className='text-md px-2 text-healthyDarkGray1 py-1'>{value}</p>
        <div className={`flex flex-col justify-around items-center ${colour} rounded-r-md text-white font-bold text-xs h-full`}>
            <FontAwesomeIcon icon={faAngleUp} onClick={()=>setValue(value+1)} className={`cursor-pointer text-xs rounded-tr-md  px-2  ${colour} `}/>
            <FontAwesomeIcon icon={faAngleDown} onClick={()=>value>0 && setValue(value-1)} className={`cursor-pointer text-xs rounded-br-md  px-2  ${colour}  `} />
        </div>
    </div>
  )
}

export default Counter