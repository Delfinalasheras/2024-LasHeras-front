import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faCircleDown  } from '@fortawesome/free-solid-svg-icons'; 

function MenuItem({item, key, setNewCalories}) {
    const [calories, setCalories]=useState(0)

    const handleChange= (value)=>{
        setCalories(value)
        setNewCalories({...item, calories:calories})
        setCalories(0)
    }

  return (
    <div className='flex justify-between items-center text-md mt-1'>
        <p key={key} className='text-sm'>{item.name}</p>
        <div>
           {calories>0 && <button onClick={handleChange} className='px-3 text-sm rounded-md py-1 bg-healthyGreen mr-3 hover:bg-healthyDarkGreen'><FontAwesomeIcon icon={faCircleDown} className='mr-2'/>Save</button>}
            <input placeholder='000' type='number' value={calories>0 && calories} onChange={(e)=>e.target.value>0 && setCalories(e.target.value)} className='focus:outline-none focus:ring focus:ring-messidepaul decoration-none text-messidepaulDark bg-white/60 px-2 py-1 rounded-md text-sm text-right w-16'/>
        </div>
    </div>
  )
}

export default MenuItem