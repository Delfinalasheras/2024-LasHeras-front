import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faCirclePlus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const RecommendationItem = ({ food, toggleSelection, isSelected, alredyconsumed }) => {
    
    const handleClick = () => {
        if (alredyconsumed) return;
        toggleSelection(food);
    };

    // Clases dinámicas
    let containerClasses = "transition-colors duration-200 ";
    let iconClasses = "";
    let textClasses = "";
    let badgeClasses = "";

    if (alredyconsumed) {
        containerClasses += "bg-gray-100 border-gray-300";
        iconClasses = "text-gray-400 cursor-not-allowed";
        textClasses = "text-gray-500";
        badgeClasses = "bg-gray-200 text-gray-500";
    } else if (isSelected) {
        // Estilo cuando está seleccionado (Naranja oscuro/fuerte)
        containerClasses += "bg-healthyOrange/30 border-healthyOrange border-2 shadow-sm";
        iconClasses = "text-healthyOrange scale-110";
        textClasses = "text-healthyDarkOrange font-extrabold";
        badgeClasses = "bg-healthyOrange text-white";
    } else {
        // Estilo normal (No seleccionado)
        containerClasses += "bg-white border border-gray-200 hover:border-healthyOrange/50";
        iconClasses = "text-healthyGray1 hover:text-healthyOrange cursor-pointer";
        textClasses = "text-darkGray";
        badgeClasses = "bg-healthyOrange/10 text-healthyDarkOrange";
    }

    return (
        <div 
            className={`flex flex-col font-quicksand p-2 rounded-lg mb-2 cursor-pointer select-none ${containerClasses}`}
            onClick={handleClick} // Hacemos clickeable toda la tarjeta para mejor UX
        >
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row justify-start items-center">
                    <FontAwesomeIcon 
                        icon={isSelected ? faCircleCheck : faCirclePlus} 
                        className={`text-xl sm:text-3xl mx-1 transition-all ${iconClasses}`}
                    />
                    <p className={`font-bold text-sm sm:text-lg px-2 truncate max-w-[180px] sm:max-w-[250px] ${textClasses}`}>
                        {food.name} {alredyconsumed && <span className="text-xs font-normal">(Already Consumed)</span>}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-end">
                    <div className={`flex items-center justify-end px-3 py-1 rounded-md mr-2 ${badgeClasses}`}>
                        <p className="font-semibold text-xs sm:text-md">
                            {food.measure_portion || 1}
                        </p>
                    </div>
                    <div className='flex items-center justify-start w-[60px]'>
                        <p className={`text-xs sm:text-md ${alredyconsumed ? 'text-gray-400' : 'text-healthyDarkGray1'}`}>
                            {food.measure ? food.measure : 'plate'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecommendationItem;