import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

const RecommendationItem = ({ food, setSelection, alredyconsumed }) => {
    
    const handleAddRecommendation = () => {
        // Doble seguridad: si ya está consumido, no hacemos nada aunque fuercen el click
        if (alredyconsumed) return;

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

    // Definimos clases dinámicas para no ensuciar tanto el JSX
    const containerClasses = alredyconsumed
        ? "bg-gray-100 border-gray-300" // Estilo GRIS (Deshabilitado)
        : "bg-healthyOrange/20 border-healthyOrange/40"; // Estilo NARANJA (Activo)

    const iconClasses = alredyconsumed
        ? "text-gray-400 cursor-not-allowed" // Icono gris y cursor de prohibido
        : "text-healthyOrange hover:text-healthyDarkOrange hover:cursor-pointer"; // Icono interactivo

    const textClasses = alredyconsumed 
        ? "text-gray-500" 
        : "text-darkGray";

    const badgeClasses = alredyconsumed
        ? "bg-gray-200 text-gray-500"
        : "bg-healthyOrange/30 text-healthyDarkOrange";

    return (
        <div 
            key={food.id} 
            className={`flex flex-col font-quicksand border p-2 rounded-lg mb-2 transition-colors duration-200 ${containerClasses}`}
        >
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row justify-start items-center">
                    <FontAwesomeIcon 
                        onClick={handleAddRecommendation} 
                        icon={faCirclePlus} 
                        className={`text-xl sm:text-3xl mx-1 ${iconClasses}`}
                    />
                    <p className={`font-bold text-sm sm:text-lg px-2 ${textClasses}`}>
                        {food.name} {alredyconsumed && <span className="text-xs font-normal">(Already Consumed)</span>}
                    </p>
                </div>
                <div className="flex flex-row items-center justify-end">
                    {/* Badge de cantidad */}
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