import React, { useEffect, useState } from 'react';
import InputDrink from './InputDrink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { createDrink,createDrinkType } from '../../../firebaseService';
import DrinkType from './DrinkType';

export const NewDrink = ({ setNewDrink, handleUpdate, categorydrinks, drinktypes,handleDrinkTypeUpdate, setDrinksData }) => {
    const [name, setName] = useState('');
    const [sugar, setSugar] = useState('');
    const [caffeine, setCaffeine] = useState('');
    const [calories, setCalories] = useState('');
    const [measure, setMeasure] = useState('');
    const [amount, setAmount] = useState('');
    const [typeOptions, setTypeOptions] = useState(false);
    const [typePersonalize, setTypePersonalize] = useState('');
    const [typeSelected, setTypeSelected] = useState(null);
    const [newType, setNewType] = useState([])
    const [message, setMessage] = useState('');
    const [type,setTypeId] = useState('');

    const handleNewType = async () => {
        const data = {
            name: typePersonalize,
        };
    
        try {
            // Create new drink type in the backend
            const newTypeId = await createDrinkType(data);
            setTypeId(newTypeId);
            setTypePersonalize('');
    
            handleDrinkTypeUpdate()
        } catch (error) {
            console.log("Error creating new drink type: ", error);
        }
    };


    useEffect(() => {

        setTypeOptions(false);
    }, []);

    const handleNewDrink = async () => {
        if (!name) {
            setMessage("The drink's name is missing");
            return;
        }
        if (!type) {
            setMessage("Please select a type");
            return;
        }
        if (!measure) {
            setMessage("Please select a measure");
            return;
        }
        if (!amount) {
            setMessage("The amount is required");
            return;
        }
        if (!calories) {
            setMessage("The calories per portion are required");
            return;
        }

        if (name && typeSelected && measure && amount && calories) {
            try {
                const data = {
                    name: name,
                    sugar_portion: sugar,
                    caffeine_portion: caffeine,
                    calories_portion: calories,
                    measure: measure,
                    measure_portion: amount,
                    typeOfDrink: type,
                };
                console.log(data);
                await createDrink(data);
                setName('');
                setCaffeine('');
                setSugar('');
                setMessage('');
                setAmount('');
                setTypeId('');
                setTypeSelected('');
                setMeasure('');
                setNewDrink(false);
                handleUpdate();
                setDrinksData(prev=>[...prev,data ])
                console.log('Drink added successfully');
            } catch (error) {
                console.log('Error adding new drink: ', error);
            }
        }
    
    };

    return (
        <div className='bg-white border-2 flex flex-col justify-start items-center rounded-b-xl border-healthyGreen border-t-none w-full max-h-[300px] md:max-h-[550px] lg:max-h-[400px] overflow-y-auto'>
            <div className='flex flex-col md:sticky md:top-0 py-2 w-full justify-center items-center text-healthyDarkGreen bg-white'>
                {/* Display validation messages */}
                {message && <p className='bg-red-600 text-white text-xs px-3 py-1 rounded-full text-center font-bold mb-2'>{message}</p>}
                
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className='text-sm font-semibold bg-healthyGray p-1 text-healthyDarkGreen focus:outline-none rounded-lg text-center w-10/12 focus:ring focus:ring-healthyGreen'
                    type='text'
                    placeholder='Drink name'
                />

                <div className='w-11/12 flex items-start mt-2 justify-between'>
                    <p className='text-sm font-semibold text-healthyGreen'>Type of drink</p>
                    <div className='w-2/3 flex flex-col items-end'>
                        <div className='flex justify-end items-center w-11/12'>
                            <p className={`bg-healthyGray px-2 py-1 ${typeOptions ? 'rounded-tl-md' : 'rounded-l-md'} w-4/5 text-xs`}>
                                {typeSelected ? typeSelected : 'Select...'}
                            </p>
                            <button
                                onClick={() => setTypeOptions(!typeOptions)}
                                className={`flex items-center justify-center bg-healthyGreen text-white text-sm font-semibold ${typeOptions ? 'rounded-tr-md' : 'rounded-r-md'} py-1 px-3 w-1/5`}
                            >
                                <FontAwesomeIcon icon={faCaretDown} />
                            </button>
                        </div>
                        {typeOptions && (
                            <div className='w-11/12 flex flex-col justify-end'>
                                {drinktypes.map((drinkType) => (
                                    <DrinkType
                                        key={drinkType.id}
                                        drinkType={drinkType}
                                        setTypeSelected={setTypeSelected}
                                        setTypeId = {setTypeId}
                                        setTypeOptions = {setTypeOptions}
                                        handleDrinkTypeUpdate = {handleDrinkTypeUpdate}
                                    />
                                ))}
                                <div className='flex w-full justify-between items-center mt-2'>
                                    {typePersonalize && (
                                        <button
                                            onClick={handleNewType}
                                            className='w-1/5 bg-healthyGreen text-white text-sm text-center py-1 rounded-l-sm hover:bg-healthyDarkGreen'
                                        >
                                            <FontAwesomeIcon icon={faPlus} />
                                        </button>
                                    )}
                                    <input
                                        type='text'
                                        placeholder='Other type'
                                        value={typePersonalize}
                                        onChange={(e) => setTypePersonalize(e.target.value)}
                                        className={`bg-healthyGray2 text-right text-sm py-1 px-2 text-healthyGreen focus:outline-none ${typePersonalize ? 'w-4/5 rounded-r-sm' : 'w-full rounded-sm'}`}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex flex-col justify-center w-11/12 mx-2 mt-1'>
                    <InputDrink name='Sugar' measure='gr' setValue={setSugar} value={sugar} />
                    <InputDrink name='Caffeine' measure='mg' setValue={setCaffeine} value={caffeine} />
                    <div className='flex items-center justify-between w-full text-sm mt-2 text-healthyDarkGray1 font-quicksand'>
                        <p className='w-2/3 font-semibold text-healthyGreen'>{'Measure'}</p>
                        <div className='flex w-1/3 items-baseline justify-end'>
                            <input
                                type='text'

                                value={measure}
                                onChange={(e) => setMeasure(e.target.value)}
                                placeholder='cup'
                                className='bg-healthyGray p-1 w-2/3 text-center rounded-md focus:outline-none focus:ring focus:ring-healthyGreen'
                            />
                            <p className='text-xs ml-1 w-1/3'>{''}</p>
                        </div>
                        
                    </div>
                    <InputDrink name='Amount' measure={measure} setValue={setAmount} value={amount} />
                    <InputDrink name='Calories' measure='cal' setValue={setCalories} value={calories} />
                </div>
            </div>

            <div className='flex justify-center items-center sticky mt-2 bottom-0 w-full py-2 cursor-pointer bg-healthyGreen'>
                <button onClick={handleNewDrink} className='font-quicksand text-white font-bold text-sm'>Save changes</button>
            </div>
        </div>
    );
};


