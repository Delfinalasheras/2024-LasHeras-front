import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const RecommendationItem = ({ food, setSelection }) => {
    const handleAddRecommendation = () => {
        // Use the measure_portion as the fixed amount
        const amount = food.measure_portion || 1;
        
        setSelection({ 
            id_food: food.id, 
            name: food.name, 
            amount, 
            measure: food.measure, 
            carbohydrates_portion: food.carbohydrates_portion,
            fats_portion: food.fats_portion, 
            protein_portion: food.protein_portion, 
            sodium_portion: food.sodium_portion
        });
    };

    return (
        <div key={food.id} className="flex flex-col font-quicksand bg-healthyOrange/20 border border-healthyOrange/40 p-2 rounded-lg mb-2">
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row justify-start items-center">
                    <FontAwesomeIcon 
                        onClick={handleAddRecommendation} 
                        icon={faCirclePlus} 
                        className="text-xl sm:text-3xl text-healthyOrange mx-1 hover:text-healthyDarkOrange hover:cursor-pointer"
                    />
                    <p className="font-bold text-sm sm:text-lg text-darkGray px-2">{food.name}</p>
                </div>
                <div className="flex flex-row items-center justify-end">
                    <div className="flex items-center justify-end bg-healthyOrange/30 px-3 py-1 rounded-md mr-2">
                        <p className="font-semibold text-xs sm:text-md text-healthyDarkOrange">
                            {food.measure_portion || 1}
                        </p>
                    </div>
                    <div className='flex items-center justify-start w-[60px]'>
                        <p className='text-xs sm:text-md text-healthyDarkGray1'>
                            {food.measure ? food.measure : 'plate'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecommendationItem;