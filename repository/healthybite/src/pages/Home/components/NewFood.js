import React, { useState } from 'react';
import Input from '../../../components/Input';
import { handleInputChange, handleInputChange2 } from '../../inputValidation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCookieBite } from '@fortawesome/free-solid-svg-icons';

const NewFood = ({ setAddFood, setNewFood }) => {
    const [inValidation, setInValidation] = useState(false);
    const [name, setName] = useState('');
    const [measure, setMeasure] = useState('');
    const [amount, setAmount] = useState(null);
    const [calories, setCalories] = useState('');
    const [sodium, setSodium] = useState('');
    const [carbohydrate, setCarbohydrate] = useState('');
    const [fat, setFat] = useState('');
    const [protein, setProtein] = useState('');
    const [timeDay, setTimeDay] = useState([]);


    const toggleTimeDay = (value) => {
        setTimeDay(prev => {
            if (prev.includes(value)) {
                return prev.filter(v => v !== value);
            } else {
                return [...prev, value];
            }
        });
    };
    
    // Updated: Only validate required fields (name, measure, amount > 0, calories > 0)
    const validateInputs = () => {
        return (
            name.trim() !== '' &&
            measure.trim() !== '' &&
            amount > 0 &&
            calories > 0 &&
            timeDay.length > 0
        );
    };
    
    

    const handleCaloriesChange = (e) => {
        handleInputChange2(parseInt(e.target.value), 0, 500, setCalories);
    };

    const save = () => {
        if (validateInputs()) {
            setInValidation(false);
            setNewFood({ name, measure, amount, calories, sodium, carbohydrate, fat, protein,timeday: timeDay });
            setName('');
            setMeasure('');
            setAmount('');
            setCalories('');
            setSodium('');
            setCarbohydrate('');
            setFat('');
            setProtein('');
            setAddFood(false);
            setTimeDay([]);
        } else {
            setInValidation(true);
        }
    };

    return (
        <div className='w-full h-full flex flex-col'>
            <div className='w-full h-full flex flex-row'>
                <h2 className='text-2xl font-semibold font-quicksand text-center mb-4'>CREATE NEW FOOD</h2>
                <FontAwesomeIcon icon={faCookieBite} />
            </div>

            <div className='flex-1 flex flex-col'>
                <div className='flex flex-col md:flex-row w-full items-start justify-start sm:h-full max-h-84 overflow-y-scroll'>
                    <div className='flex-1 pb-0 px-2 sm:p-2 rounded-md w-full md:w-1/2 flex flex-col '>
                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-semibold font-quicksand text-sm'>Name</p>
                            <input
                                required={inValidation && name === ''}
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                label='Name'
                                placeholder='Chicken'
                                value={name}
                                inputType='text'
                                onChange={e => setName(e.target.value)}
                            />
                            {inValidation && name === '' && <p className='text-red-500 text-xs'>Name is required.</p>}
                        </div>


                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-semibold font-quicksand text-sm'>Measure</p>
                            <input
                                required={inValidation && measure === ''}
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                placeholder='gr'
                                value={measure}
                                inputType='text'
                                onChange={e => setMeasure(e.target.value)}
                            />
                            {inValidation && measure === '' && <p className='text-red-500 text-xs'>Measure is required.</p>}
                        </div>
                        <div className='flex flex-col font-quicksand font-semibold text-darkGray text-sm w-full mb-2'>
                            <p className='text-black font-quicksand font-semibold text-sm'>Portion</p>
                            {inValidation && <p className="font-quicksand mt-2 md:mt-0 text-xs md:text-sm text-healthyDarkOrange font-semibold">This field is required</p>}
                            <input 
                                placeholder="250" 
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                type="number" 
                                value={amount} 
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setAmount)}
                            />
                            {inValidation && amount <= 0 && <p className='text-red-500 text-xs'>Amount must be a positive number.</p>}
                        </div>
                        <div className='flex flex-col w-full mb-2 sm:mb-0'>
                            <p className='text-black font-quicksand  font-semibold text-sm'>Calories</p>
                            <input
                                required={inValidation && calories <= 0}
                                label="Calories"
                                placeholder="448"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                value={calories}
                                inputType='number'
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setCalories)}
                            />
                            {inValidation && calories <= 0 && <p className='text-red-500 text-xs'>Calories must be a positive number.</p>}
                        </div>
                    </div>
                    <div className='flex-1 pt-0 px-2 sm:p-2 rounded-md w-full md:w-1/2 flex flex-col justify-start '>
                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-quicksand  font-semibold text-sm'>Sodium</p>
                            <input
                                placeholder="448"
                                value={sodium}
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                inputType='number'
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setSodium)}
                            />
                            {/* Removed: Error message for sodium (not required, 0 allowed) */}
                        </div>
                        <div className='flex flex-col w-full mb-2 '>
                            <p className='text-black font-quicksand font-semibold text-sm'>Carbohidrates</p>
                            <input
                                label="Carbohydrate"
                                placeholder="448"
                                value={carbohydrate}
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                inputType='number'
                                // Updated: Use handleInputChange for consistency (defaults to 0 if empty)
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setCarbohydrate)}
                            />
                            {/* Removed: Error message for carbohydrate (not required, 0 allowed) */}
                        </div>
                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-quicksand  font-semibold text-sm'>Fats</p>
                            <input
                                label="Fat"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                placeholder="448"
                                value={fat}
                                inputType='number'
                                // Updated: Use handleInputChange for consistency (defaults to 0 if empty)
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setFat)}
                            />
                            {/* Removed: Error message for fat (not required, 0 allowed) */}
                        </div>
                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-quicksand font-semibold text-sm'>Protein</p>
                            <input
                                label="Protein"
                                placeholder="448"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                value={protein}
                                inputType='number'
                                // Updated: Use handleInputChange for consistency (defaults to 0 if empty)
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setProtein)}
                            />
                            {/* Removed: Error message for protein (not required, 0 allowed) */}
                        </div>
                        <div className='flex flex-col w-full mb-2'>
                            <p className='text-black font-semibold font-quicksand text-sm mb-2'>Time of Day</p>

                            <div className='flex flex-wrap gap-3'>
                                <label className='flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all'>
                                    <input
                                        type="checkbox"
                                        checked={timeDay.includes(1)}
                                        onChange={() => toggleTimeDay(1)}
                                        className='w-4 h-4 text-healthyGreen focus:ring-healthyGreen'
                                    />
                                    <span className='font-medium text-sm'>Desayuno</span>
                                </label>

                                <label className='flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all'>
                                    <input
                                        type="checkbox"
                                        checked={timeDay.includes(2)}
                                        onChange={() => toggleTimeDay(2)}
                                        className='w-4 h-4 text-healthyGreen focus:ring-healthyGreen'
                                    />
                                    <span className='font-medium text-sm'>Almuerzo</span>
                                </label>

                                <label className='flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all'>
                                    <input
                                        type="checkbox"
                                        checked={timeDay.includes(3)}
                                        onChange={() => toggleTimeDay(3)}
                                        className='w-4 h-4 text-healthyGreen focus:ring-healthyGreen'
                                    />
                                    <span className='font-medium text-sm'>Snack</span>
                                </label>

                                <label className='flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all'>
                                    <input
                                        type="checkbox"
                                        checked={timeDay.includes(4)}
                                        onChange={() => toggleTimeDay(4)}
                                        className='w-4 h-4 text-healthyGreen focus:ring-healthyGreen'
                                    />
                                    <span className='font-medium text-sm'>Cena</span>
                                </label>
                            </div>

                            {inValidation && timeDay.length === 0 && (
                                <p className='text-red-500 text-xs mt-2'>Elige al menos una opción.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className='flex justify-end gap-2 p-2'>
                    <button 
                        onClick={save} 
                        className='bg-healthyGreen px-3 py-1 hover:cursor-pointer hover:bg-healthyDarkGreen rounded-md text-white font-semibold'
                    >
                        Save
                    </button>
                    <button 
                        onClick={() => setAddFood(false)} 
                        className='bg-healthyOrange px-3 py-1 hover:cursor-pointer hover:bg-healthyDarkOrange rounded-md text-white font-semibold'
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewFood;