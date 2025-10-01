import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useEffect, useState } from 'react'
import { faSquareMinus } from '@fortawesome/free-solid-svg-icons'
import {handleInputChange} from '../../inputValidation'

const EditFood = ({ item, onQuantityChange, onRemove }) => {
  const [value, setValue] = useState(item.amount); 

  const handleChange = (e) => {
      const newValue = e.target.value;
      handleInputChange(newValue, 0, 1000, (validatedValue) => {
        setValue(validatedValue);
        onQuantityChange(validatedValue); // Use validated value
    });
  };

  useEffect(() => {
    setValue(item.amount);
  }, [item]);

  return (
      <div className='flex justify-between mt-1'>
          <div className='flex items-center w-2/3'>
              <FontAwesomeIcon
                icon={faSquareMinus}
                className='text-white cursor-pointer hover:text-healthyDarkOrange2 text-sm mr-1'
                onClick={onRemove}  
              />
              <p className='text-white text-xs font-bold'>{item.name}</p>
          </div>
          
          <input 
            type="number"
            value={value}
            onChange={handleChange}
            className=' bg-healthyOrange text-center text-white px-1 text-sm rounded-md w-12 ml-1'
            min="0"
          /> 
          <p className='text-white text-xs font-bold ml-1 w-10'>{item.measure}</p>
      </div>
  );
};

export default EditFood;


