import {  faStar} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

const Comment = ({data}) => {
  return (
    <div className='flex w-full justify-start items-center p-1 '>
      {data.comment !== "" && (
        <>
        <div className='py-1 px-2 h-full rounded-l-full flex items-center bg-healthyGreen'>
          <p className='text-hbGreen font-semibold text-sm'>{data.score}</p>
          <FontAwesomeIcon icon={faStar} className='text-xs text-hbGreen pl-1'/>
        </div>
        <div className={`py-1 px-2 rounded-r-full flex justify-between items-center text-left text-xs md:text-sm font-semibold text-healthyGreen bg-hbGreen shadow-sm`}>
          {<p>{data.comment}</p>}
            
        </div>
        </>
      )}
    </div>
  )
}

export default Comment