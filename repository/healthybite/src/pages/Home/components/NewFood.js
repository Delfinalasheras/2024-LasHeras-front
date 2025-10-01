import React, { useState } from 'react';
import Input from '../../../components/Input';
import {handleInputChange, handleInputChange2} from '../../inputValidation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCookieBite } from '@fortawesome/free-solid-svg-icons'; 

const NewFood = ({ setAddFood, setNewFood}) => {
    const [inValidation, setInValidation] = useState(false);
    const [name, setName] = useState('');
    const [measure, setMeasure] = useState('');
    const [amount, setAmount] = useState(null);
    const [calories, setCalories] = useState('');
    const [sodium, setSodium] = useState('');
    const [carbohydrate, setCarbohydrate] = useState('');
    const [fat, setFat] = useState('');
    const [protein, setProtein]=useState('')


    const validateInputs = () => {
        return (
            name !== '' &&
            measure !== '' 
        );
    };

    const handleCaloriesChange= (e) => {
        handleInputChange2(parseInt(e.target.value), 0, 500, setCalories);
    }

    const save = () => {
        if (validateInputs()) {
            setInValidation(false);
            setNewFood({ name, measure, amount, calories, sodium, carbohydrate, fat, protein });
            setName('');
            setMeasure('');
            setAmount('');
            setCalories('');
            setSodium('');
            setCarbohydrate('');
            setFat('');
            setProtein('')
            setAddFood(false);
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
                                required={inValidation && sodium <= 0}
                                placeholder="448"
                                value={sodium}
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                inputType='number'
                                onChange={(e)=> handleInputChange(e.target.value, 0, 1000, setSodium)}
                            />
                            {inValidation && sodium <= 0 && <p className='text-red-500 text-xs'>Sodium must be a positive number.</p>}
                        </div>
                        <div className='flex flex-col w-full mb-2 '>
                        <p className='text-black font-quicksand font-semibold text-sm'>Carbohidrates</p>
                            <input
                                required={inValidation && carbohydrate <= 0}
                                label="Carbohydrate"
                                placeholder="448"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                value={carbohydrate}
                                inputType='number'
                                onChange={(e)=> handleInputChange(parseInt(e.target.value), 0, 500, setCarbohydrate)}
                            />
                            {inValidation && carbohydrate <= 0 && <p className='text-red-500 text-xs'>Carbohydrate must be a positive number.</p>}
                        </div>
                        <div className='flex flex-col w-full mb-2'>
                        <p className='text-black font-quicksand  font-semibold text-sm'>Fats</p>
                            <input
                                required={inValidation && fat <= 0}
                                label="Fat"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                placeholder="448"
                                value={fat}
                                inputType='number'
                                onChange={(e)=> handleInputChange(parseInt(e.target.value), 0, 500, setFat)}
                            />
                            {inValidation && fat <= 0 && <p className='text-red-500 text-xs'>Fat must be a positive number.</p>}
                        </div>
                        <div className='flex flex-col w-full mb-2'>
                        <p className='text-black font-quicksand font-semibold text-sm'>Protein</p>
                            <input
                                required={inValidation && protein <= 0}
                                label="Protein"
                                placeholder="448"
                                className='bg-white rounded-md text-left text-darkGray text-sm p-1 focus:outline-none  py-2 px-3 focus:ring-2 focus:ring-healthyGreen'
                                value={protein}
                                inputType='number'
                                onChange={(e)=> handleInputChange(parseInt(e.target.value), 0, 500, setProtein)}
                            />
                            {inValidation && protein <= 0 && <p className='text-red-500 text-xs'>Protein must be a positive number.</p>}
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
}

export default NewFood;



