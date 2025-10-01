import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

const FoodItem = ({ food, onFoodAdd, reset, onResetComplete, selectedFood }) => {
  // Ensure selectedFood is defined and is an array
  /*const foodSeledted = Array.isArray(selectedFood)
    ? selectedFood.find((item) => item.ingredientId === food.id && item.quantity > 0)
    : null;
*/
  const [value, setValue] = useState(food.quantity ? food.quantity: 0);
  const [isAdded, setIsAdded] = useState(food.quantity ? true : false);
  const [errorMessage, setErrorMessage] = useState(''); // State for error message

  // Trigger reset of the component when reset prop changes to true
  useEffect(() => {
    if (reset) {
      setValue(0);
      setIsAdded(false);
      setErrorMessage(''); // Clear the error message on reset
      onResetComplete(); // Notify parent component that reset is complete
    }
  }, [reset, onResetComplete]);

  const handleAddClick = () => {
    if (value === 0) {
      setErrorMessage('Please select a value greater than 0 before adding.');
      return;
    }
    setIsAdded(!isAdded);
    onFoodAdd(food, isAdded ? 0 : value);
    setErrorMessage(''); // Clear error message on successful add
  };

  return (
    <div className='flex flex-col w-full mt-1'>
      <div className='flex justify-between items-center'>
        <p className='text-sm font-semibold w-2/3'>{food.name}</p>
        <div className='flex justify-end items-center'>
          <p className='text-xs'>{food.measure}</p>
          <input
            type='number'
            placeholder='000'
            value={value}
            onChange={(e) => e.target.value >= 0 && setValue(e.target.value)}
            className='bg-healthyGray2 pr-1 text-healthyDarkGray1 text-md text-right pl-1 py-1 rounded-md w-12 ml-1'
          />
          <button
            className={`ml-2 px-2 py-1 text-xs border-2 border-healthyGreen ${isAdded ? 'bg-healthyGreen  text-white' : 'bg-white text-healthyGreen'} rounded`}
            onClick={handleAddClick}
          >
            <FontAwesomeIcon icon={faPlus} className='text-md cursor-pointer'/>
          </button>
        </div>
      </div>
      {errorMessage && (
        <p className="text-red-500 text-xs mt-1">{errorMessage}</p> // Display the error message
      )}
    </div>
  );
};

export default FoodItem;






