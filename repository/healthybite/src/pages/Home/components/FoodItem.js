import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus, faCircleCheck } from '@fortawesome/free-solid-svg-icons';

const FoodItem = ({ food, toggleSelection, isSelected, initialAmount, publicPlates }) => {
    const [amount, setAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Si el item ya está seleccionado, mostramos la cantidad que se eligió
    useEffect(() => {
        if (isSelected && initialAmount) {
            setAmount(initialAmount);
        } else if (!isSelected) {
            // Si se deselecciona desde fuera (ej: botón Clear All), limpiamos el input
            setAmount('');
        }
    }, [isSelected, initialAmount]);

    const handleAmountChange = (e) => {
        // Si está seleccionado, no permitimos editar directamente (UX decision: toggle off first)
        // Opcional: Podrías permitir editar y que actualice el array, pero toggle off es más claro.
        if(isSelected) return; 

        const value = Number(e.target.value);
        if (!isNaN(value) && value >= 0 && value <= 1000) {
            setAmount(value);
            setErrorMessage('');
        }
    };

    const handleToggle = () => {
        if (isSelected) {
            // Si ya está seleccionado, el click lo quita
            toggleSelection(food);
            setErrorMessage('');
        } else {
            // Si NO está seleccionado, intentamos agregar
            if (amount > 0) {
                toggleSelection(food, amount);
            } else {
                setErrorMessage("Enter amount");
            }
        }
    };

    // Estilos dinámicos
    const containerClasses = isSelected 
        ? "bg-healthyOrange/20 border-l-4 border-healthyOrange" 
        : (publicPlates ? 'bg-healthyGreen/20 hover:bg-healthyGreen/30' : 'bg-white/60 hover:bg-white/80');

    const iconColor = isSelected 
        ? "text-healthyOrange drop-shadow-sm" 
        : "text-darkGray hover:text-healthyOrange";

    return (
        <div className={`flex flex-col font-quicksand p-2 rounded-lg mb-2 transition-all duration-200 ${containerClasses}`}>
            <div className="flex flex-row items-center justify-between">
                <div className="flex flex-row justify-start items-center flex-1">
                    <FontAwesomeIcon 
                        onClick={handleToggle} 
                        icon={isSelected ? faCircleCheck : faCirclePlus} 
                        className={`text-xl sm:text-3xl mx-1 cursor-pointer transition-transform active:scale-95 ${iconColor}`}
                    />
                    <div className="flex flex-col justify-center px-2">
                        <p className={`font-bold text-sm sm:text-lg text-darkGray leading-tight ${isSelected ? 'text-healthyDarkOrange' : ''}`}>
                            {food.name}
                        </p>
                        {isSelected && <span className="text-[10px] text-healthyOrange font-bold">ADDED TO LIST</span>}
                    </div>
                </div>
                
                <div className="flex flex-row items-center justify-end">
                    <div className='flex items-center justify-end'>
                        <input 
                            className={`font-quicksand text-xs sm:text-md w-16 text-right outline-none border border-transparent focus:border-healthyOrange/50 px-1 py-1 rounded-md mr-2 transition-colors ${isSelected ? 'bg-white/50 text-gray-500 cursor-not-allowed' : 'bg-white text-darkGray'}`}
                            placeholder="0" 
                            type="number" 
                            value={amount} 
                            disabled={isSelected} // Deshabilitar input si ya está agregado
                            onChange={handleAmountChange} 
                            onKeyDown={(e) => e.key === 'Enter' && handleToggle()} // Permitir enter para agregar
                        />
                    </div>
                    <div className='flex items-center justify-start w-[50px] sm:w-[60px]'>
                        <p className='text-xs sm:text-md truncate text-healthyGray1'>
                            {food.measure ? food.measure : 'plate'}
                        </p>
                    </div>
                </div>
            </div>
            {errorMessage && (
                <p className="text-red-500 text-xs mt-1 ml-9 font-bold animate-pulse">{errorMessage}</p>
            )}
        </div>
    );
}

export default FoodItem;