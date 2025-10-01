import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const FoodItemMenu = ({ food, setSelection }) => {
    const [amount, setAmount] = useState('');
    console.log("food en fooditem",food)
    const [errorMessage, setErrorMessage] = useState('');
    const handleAmountChange = (e) => {
        const value = Number(e.target.value);
        // Only update the state if the value is a non-negative number
        if (!isNaN(value) && value >= 0 && value <= 1000) {
            setAmount(value);
            setErrorMessage(''); // Clear error message if valid input
        }
    };

    const handleAddFood = () => {
        if (amount > 0) { // Ensure amount is greater than 0
            setSelection({ id_food: food.id, name: food.name, amount, measure: 'Portion' });
        } else {
            setErrorMessage("Please enter a valid amount greater than 0.");
        }
    };

    return (
        <div key={food.id_Food} className="w-full flex flex-row items-center justify-between font-quicksand bg-white/60 py-1 px-1 rounded-lg mb-2">
            <div className="flex flex-row justify-start items-center w-3/4">
                <FontAwesomeIcon 
                    onClick={handleAddFood} 
                    icon={faCirclePlus} 
                    className="text-xl sm:text-xl text-darkGray mx-1 hover:text-healthyDarkGray1 hover:cursor-pointer" 
                />
                <p className="font-bold text-sm sm:text-md text-darkGray px-2">{food.name}</p>
            </div>
            <div className="flex flex-row items-center justify-end w-1/4">
                <div className='flex items-center justify-end w-1/2'>
                
                    <input 
                        className="font-quicksand text-black text-xs sm:text-md w-16 text-right outline-none border px-1 py-1 rounded-md bg-gray-100 mr-2" 
                        placeholder="000" 
                        type="number" 
                        value={amount} 
                        onChange={handleAmountChange} 
                    />
                </div>
                <div className='flex items-center justify-start w-1/2'>
                    <p className='text-xs sm:text-md text-black text-right'>{food.calories} kcal</p>
                </div>
            </div>
        </div>
    );
}

export default FoodItemMenu;