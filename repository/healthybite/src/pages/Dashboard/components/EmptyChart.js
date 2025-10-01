import { faChartLine } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React from 'react'

export const EmptyChart = () => {
  return (
    <div className='flex w-full h-64 flex-col  rounded-xl font-quicksand font-semibold text-healthyGreen justify-center items-center'>
      <FontAwesomeIcon icon={faChartLine} className='text-5xl '/>
      <p className='text-md text-center my-4'>There is no data to display</p>
    </div>
  )
}
