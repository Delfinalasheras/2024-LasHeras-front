

import React from 'react'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MyComment = ({ data }) => {
  return (
    <div className='flex w-full justify-end items-center p-1'>
      {/* Render the score and comment only if the comment is not empty */}
      {data.comment !== "" && (
        <>
          <div className='py-1 px-2 h-full rounded-l-full flex items-center bg-healthyOrange'>
            <p className='text-healthyLightOrange font-semibold text-sm'>{data.score}</p>
            <FontAwesomeIcon icon={faStar} className='text-xs text-healthyLightOrange pl-1'/>
          </div>
          <div className={`py-1 px-2 rounded-r-full flex justify-between items-center text-left text-xs md:text-sm font-semibold text-healthyOrange bg-healthyLightOrange shadow-sm`}>
            <p>{data.comment}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default MyComment;

