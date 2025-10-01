import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleMinus} from '@fortawesome/free-solid-svg-icons'; 


function FoodItem({food, setCatFoods,catFoods}) {

  const handleDeleteFood=()=>{
    setCatFoods(catFoods.filter((item)=>item!==food))
  }

  return (
    <div className='flex flex-row items-center justify-between p-2 w-full border-2 border-healthyGray rounded-sm'>
        <p className='text-healthyDarkGray1 text-sm text-left '>{food.name}</p>
        <FontAwesomeIcon onClick={handleDeleteFood} icon={faCircleMinus} className='text-healthyDarkGray text-xl text-healthyDarkGray1 hover:cursor-pointer  hover:text-darkGray ' />
    </div>
  )
}

export default FoodItem