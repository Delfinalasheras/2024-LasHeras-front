import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export const Visibility = ({publicPlate, setPublicPlate, vertical}) => {
    return (
    <div className={`flex   rounded-full mx-2 text-white shadow-sm ${vertical ? 'flex-col justify-center items-center' : 'flex-row justify-around items-center'} `} >
        <div onClick={()=>setPublicPlate(false)} className={` ${vertical ? 'py-2 px-1 text-sm rounded-t-full':  'rounded-l-full px-2 py-1'} flex justify-center items-center cursor-pointer  ${publicPlate ? 'bg-healthyGray  ': 'bg-healthyGray1'} `}>
            <FontAwesomeIcon icon={faEyeSlash}/>
        </div>
        <div onClick={()=>setPublicPlate(true)} className={` ${vertical ? 'py-2 px-1 text-sm rounded-b-full':  'px-2 py-1 rounded-r-full'} flex justify-center items-center cursor-pointer ${publicPlate ? 'bg-healthyGray1': 'bg-healthyGray  '} `}>
            <FontAwesomeIcon icon={faEye}/>
        </div>
    </div>
    )
}
