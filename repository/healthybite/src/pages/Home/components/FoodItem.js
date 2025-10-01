import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const FoodItem = ({ food, setSelection, publicPlates }) => {
    const [amount, setAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State to track error message
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
            setSelection({ id_food: food.id, name: food.name, amount, measure: food.measure, carbohydrates_portion: food.carbohydrates_portion,fats_portion: food.fats_portion, protein_portion: food.protein_portion, sodium_portion: food.sodium_portion});
        } else {
            setErrorMessage("Please enter a valid amount greater than 0.");
        }
    };


    return (
        <div key={food.id} className={`flex flex-col font-quicksand ${publicPlates ? 'bg-healthyGreen/30 ':'bg-white/60'} p-2 rounded-lg mb-2`}>
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row justify-start items-center">
                    <FontAwesomeIcon 
                        onClick={handleAddFood} 
                        icon={faCirclePlus} 
                        className="text-xl sm:text-3xl text-darkGray mx-1 hover:text-healthyDarkGray1 hover:cursor-pointer"
                    />
                    <p className="font-bold text-sm sm:text-lg text-darkGray px-2">{food.name}</p>
                </div>
                <div className="flex flex-row items-center justify-end">
                    <div className='flex items-center justify-end max-w-[40px]'>
                        <input 
                            className="font-quicksand text-xs sm:text-md w-16 text-right outline-none border-none px-1 py-1 rounded-md bg-white mr-2" 
                            placeholder="000" 
                            type="number" 
                            value={amount} 
                            onChange={handleAmountChange} 
                        />
                    </div>
                    <div className='flex items-center justify-start w-[60px]'>
                        <p className='text-xs sm:text-md'>{food.measure ? food.measure : 'plate'}</p>
                    </div>
                </div>
            </div>
            {errorMessage && (
                <p className="text-red-500 text-xs mt-1">{errorMessage}</p> // Display error message
            )}
        </div>
    );
}

export default FoodItem;
