import React, { useEffect, useState } from 'react';
import Search from '../../Home/components/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSquareCheck, faSquare } from '@fortawesome/free-solid-svg-icons'; 
import NewFood from '../../Home/components/NewFood';
import FoodItem from './FoodItem';
import { handleInputChange } from '../../inputValidation'; // Input validation function

export default function PopUpPlate({ plate, foodData, setAddFood, setSelection }) {
    const [reset, setReset] = useState(false);
    const [searchFood, setSearchFood] = useState(foodData);
    const [selectedFoods, setSelectedFoods] = useState(
        foodData.map((item) => {
            const thatFood = plate.ingredients.find(e => e.ingredientId === item.id);
            return thatFood ? thatFood : { ingredientId: item.id, quantity: 0 };
        })
    );
    const [message, setMessage] = useState('');
    const [newFood, setNewFood] = useState(null);
    const [createFood, setCreateFood] = useState(false);

    const handleAddFood = () => {
        const foodSelected = selectedFoods.filter((item) => item.quantity > 0);
        
        if (foodSelected.length > 0) {
            setSelection({ ingredients: foodSelected, plate: plate.id });
            setAddFood(false);
            setMessage('');
        } else {
            setMessage('Please select at least one item');
        }
    };

    const handleFoodChange = (food, quantity) => {
        // Apply input validation for quantity (e.g., range: 0-1000)
        handleInputChange(quantity, 0, 1000, (validatedValue) => {
            setSelectedFoods([
                ...selectedFoods.filter((item) => item.ingredientId !== food.id),
                { ingredientId: food.id, quantity: validatedValue },
            ]);
        });
    };

    useEffect(() => {
        if (createFood) {
            setSelectedFoods((prev) => [createFood, ...prev]);
        }
        setCreateFood(false);
    }, [createFood]);

    const handleResetComplete = () => {
        setReset(false);
    };

    return (
        <div className='w-full z-40 h-screen absolute z-15 bg-black/60 top-0 flex items-center justify-center overflow-y-hidden'>
            <div className='flex flex-col w-10/12 sm:w-2/3 md:w-1/2 h-4/5 sm:h-2/3 overflow-y-scroll px-2 pb-2 bg-healthyDarkGreen rounded-xl font-quicksand'>
                <div className='sticky top-0 bg-healthyDarkGreen'>
                    {message && 
                    <div className='flex w-full justify-center items-center pt-2'>
                        <p className='bg-white/80 text-healthyDarkGreen font-bold text-sm py-1 px-3 rounded-xl'>{message}</p>
                    </div>}
                    <div className='flex w-full justify-around items-center'>
                        <button onClick={handleAddFood} className='bg-healthyGreen py-1 my-2 px-3 rounded-md text-white font-semibold font-quicksand text-center w-1/2'>
                            Add food
                        </button>
                        <button onClick={() => setAddFood(null)} className='bg-healthyOrange py-1 my-2 px-3 rounded-md text-white font-semibold font-quicksand text-center w-1/2 ml-2'>
                            Cancel
                        </button>
                    </div>
                    <div className="flex flex-row w-full justify-center z-5 bg-healthyDarkGreen py-2">
                        <Search foodData={foodData} setSearchFood={setSearchFood} />
                    </div>
                </div>
                {createFood ? (
                    <NewFood setAddFood={setNewFood} setNewFood={setCreateFood} />
                ) : (
                    <div className='flex flex-col justify-center w-full bg-white rounded-md my-3 px-1 xs:px-2 lg:px-3 pb-2 pt-1'>
                        {searchFood && searchFood.map((food, index) => (
                            <FoodItem
                                key={index}
                                food={food}
                                onFoodAdd={handleFoodChange}
                                reset={reset}
                                onResetComplete={handleResetComplete}
                                selectedFood={selectedFoods}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
