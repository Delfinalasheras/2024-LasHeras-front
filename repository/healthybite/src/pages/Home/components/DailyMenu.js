import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUtensils, faCheckCircle, faTimesCircle, faCoffee, faBurger, faAppleAlt, faMoon, faTimes } from '@fortawesome/free-solid-svg-icons';

const DailyMenu = ({ dailyMenuData, onAddMeal,setSelection, onClose }) => {
    const [expandedMeal, setExpandedMeal] = useState(null);

    const mealIcons = {
        1: faCoffee,
        2: faBurger,
        3: faAppleAlt,
        4: faMoon
    };

    const mealNames = {
        1: 'Breakfast',
        2: 'Lunch',
        3: 'Snack',
        4: 'Dinner'
    };

    const formatNumber = (num) => {
        return num ? Math.round(num) : 0;
    };

    // Updated to handle individual items with amount_eaten
    const handleAddToLog = (mealKey, itemDict) => {
        const item = itemDict.item;
        const amount = itemDict.amount_eaten;
        if (onAddMeal) {
            onAddMeal({
                id_Food: item.id,
                name: item.name,
                measure_portion: amount,  // Use amount_eaten as the portion count
                measure: 'plate',  // Or 'serving' if preferred
                calories_portion: item.calories_portion * amount,  // Scale nutrients
                carbohydrates_portion: item.carbohydrates_portion * amount,
                sodium_portion: item.sodium_portion * amount,
                fats_portion: item.fats_portion * amount,
                protein_portion: item.protein_portion * amount,
                public: item.public || false,
                verified: item.verified || false
            });
            setSelection({id_food: item.id, name: item.name, amount, measure: item.measure, carbohydrates_portion: item.carbohydrates_portion,fats_portion: item.fats_portion, protein_portion: item.protein_portion, sodium_portion: item.sodium_portion})
        }
    };

    if (!dailyMenuData) {
        return (
            <div className="w-full p-4 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Daily Menu</h3>
                <p className="text-sm text-gray-500">No menu available for today</p>
            </div>
        );
    }

    const { total_estimado, objetivo, cumple_90_por_ciento } = dailyMenuData;
    const progressPercentage = objetivo > 0 ? (total_estimado / objetivo) * 100 : 0;

    return (
        <div className="w-full p-4 bg-white rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Today's Menu</h3>
                <div className="flex items-center gap-2">
                    <FontAwesomeIcon 
                        icon={faTimes} 
                        className="text-gray-500 cursor-pointer hover:text-gray-700" 
                        onClick={onClose} 
                    />
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Total Estimated</span>
                    <span>{formatNumber(total_estimado)} / {objetivo} cal</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                            progressPercentage >= 90 ? 'bg-green-500' : 'bg-orange-400'
                        }`}
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Meals List */}
            <div className="space-y-2">
                {[1, 2, 3, 4].map((mealKey) => {
                    const mealItems = dailyMenuData[mealKey.toString()];  // Now a list of item dicts
                    
                    if (!mealItems || mealItems.length === 0) {
                        return (
                            <div key={mealKey} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <FontAwesomeIcon 
                                        icon={mealIcons[mealKey]} 
                                        className="text-gray-400"
                                    />
                                    <span className="text-sm text-gray-500">{mealNames[mealKey]}</span>
                                    <span className="text-xs text-gray-400 ml-auto">Not assigned</span>
                                </div>
                            </div>
                        );
                    }

                    const isExpanded = expandedMeal === mealKey;
                    // Calculate total calories for the meal header (sum of scaled items)
                    const mealTotalCalories = mealItems.reduce((sum, itemDict) => 
                        sum + (itemDict.item.calories_portion * itemDict.amount_eaten), 0
                    );

                    return (
                        <div 
                            key={mealKey} 
                            className="p-3 bg-orange-50 rounded-lg border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setExpandedMeal(isExpanded ? null : mealKey)}
                        >
                            <div className="flex items-center gap-2">
                                <FontAwesomeIcon 
                                    icon={mealIcons[mealKey]} 
                                    className="text-healthyOrange"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {mealNames[mealKey]} ({mealItems.length} item{mealItems.length > 1 ? 's' : ''})
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        {formatNumber(mealTotalCalories)} cal
                                    </p>
                                </div>
                                <span className="text-xs text-gray-500">{mealNames[mealKey]}</span>
                            </div>

                            {isExpanded && (
                                <div className="mt-3 pt-3 border-t border-orange-200 space-y-3">
                                    {mealItems.map((itemDict, idx) => {
                                        const item = itemDict.item;
                                        const amount = itemDict.amount_eaten;
                                        const scaledCalories = item.calories_portion * amount;
                                        const scaledProtein = item.protein_portion * amount;
                                        const scaledCarbs = item.carbohydrates_portion * amount;
                                        const scaledFats = item.fats_portion * amount;
                                        const scaledSodium = item.sodium_portion * amount;

                                        return (
                                            <div key={idx} className="bg-white p-2 rounded border">
                                                <div className="flex justify-between items-center mb-2">
                                                    <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                                    <span className="text-xs text-gray-500">{amount} portion{amount > 1 ? 's' : ''}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                                    <div>
                                                        <span className="text-gray-600">Calories:</span>
                                                        <span className="font-semibold ml-1">{formatNumber(scaledCalories)} cal</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Protein:</span>
                                                        <span className="font-semibold ml-1">{formatNumber(scaledProtein)}g</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Carbs:</span>
                                                        <span className="font-semibold ml-1">{formatNumber(scaledCarbs)}g</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-600">Fats:</span>
                                                        <span className="font-semibold ml-1">{formatNumber(scaledFats)}g</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-600">Sodium:</span>
                                                        <span className="font-semibold ml-1">{formatNumber(scaledSodium)}mg</span>
                                                    </div>
                                                </div>
                                                {item.ingredients && item.ingredients.length > 0 && (
                                                    <div className="mb-2">
                                                        <p className="text-xs font-semibold text-gray-700 mb-1">Ingredients:</p>
                                                        <ul className="text-xs text-gray-600 space-y-1">
                                                            {item.ingredients.map((ing, ingIdx) => (
                                                                <li key={ingIdx}>
                                                                    - {ing.name || `Ingredient ${ingIdx + 1}`} - {ing.quantity} {ing.measure || 'g'}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToLog(mealKey, itemDict);
                                                    }}
                                                    className="w-full py-1 bg-healthyOrange hover:bg-orange-600 text-white rounded text-xs font-semibold transition-colors"
                                                >
                                                    Add to Log
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DailyMenu;
