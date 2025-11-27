import React, { useEffect, useState } from 'react';
import InputDrink from './InputDrink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faPlus } from '@fortawesome/free-solid-svg-icons';
import { createDrink, createDrinkType } from '../../../firebaseService';
import DrinkType from './DrinkType';

export const NewDrink = ({ setNewDrink, handleUpdate, categorydrinks, drinktypes, handleDrinkTypeUpdate, setDrinksData }) => {
    const [name, setName] = useState('');
    const [sugar, setSugar] = useState('');
    const [caffeine, setCaffeine] = useState('');
    const [calories, setCalories] = useState('');
    const [measure, setMeasure] = useState('');
    const [amount, setAmount] = useState('');
    const [typeOptions, setTypeOptions] = useState(false);
    const [typePersonalize, setTypePersonalize] = useState('');
    const [typeSelected, setTypeSelected] = useState(null);
    const [newType, setNewType] = useState([]);  // This can be removed if not used elsewhere
    const [message, setMessage] = useState('');
    const [type, setTypeId] = useState('');
    const [nameError, setNameError] = useState('');
    
    // New: Local state for drink types to enable optimistic updates
    const [localDrinkTypes, setLocalDrinkTypes] = useState(drinktypes);

    // New: Sync localDrinkTypes with the prop drinktypes whenever it changes
    useEffect(() => {
        setLocalDrinkTypes(drinktypes);
    }, [drinktypes]);

    const handleNewType = async () => {
        if (!typePersonalize.trim()) {
            setMessage("Please enter a type name");
            return;
        }

        const optimisticType = {
            id: `temp-${Date.now()}`,  // Temporary ID for optimistic update
            name: typePersonalize,
        };

        // Optimistic update: Add to local state immediately
        setLocalDrinkTypes(prev => [...prev, optimisticType]);
        setTypePersonalize('');
        setTypeOptions(false);  // Close the dropdown

        try {
            const data = { name: typePersonalize };
            const newTypeId = await createDrinkType(data);
            
            // On success: Update the optimistic entry with the real ID
            setLocalDrinkTypes(prev =>
                prev.map(type =>
                    type.id === optimisticType.id ? { ...type, id: newTypeId } : type
                )
            );
            setTypeId(newTypeId);
            
            // Call the parent's update function to sync globally
            handleDrinkTypeUpdate();
        } catch (error) {
            setMessage("Failed to add new type. Please try again.");
            
            // Revert optimistic update on failure
            setLocalDrinkTypes(prev =>
                prev.filter(type => type.id !== optimisticType.id)
            );
        }
    };

    useEffect(() => {
        setTypeOptions(false);
    }, []);
    const handleTextInputChange = (value, setValue, setError) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (regex.test(value)) {
            setValue(value);
            setError("");
        } else {
            setError("Only letters are allowed.");
        }
    };

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
                    sugar_portion: sugar ? Number(sugar) : 0,
                    caffeine_portion: caffeine ? Number(caffeine) : 0,
                    calories_portion: calories,
                    measure: measure,
                    measure_portion: amount,
                    typeOfDrink: type,
                };
                await createDrink(data);
                setName('');
                setCaffeine('');
                setSugar('');
                setMessage('');
                setNameError('');
                setAmount('');
                setTypeId('');
                setTypeSelected('');
                setMeasure('');
                setNewDrink(false);
                handleUpdate();
                setDrinksData(prev => [...prev, data]);
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
                    onChange={(e) => handleTextInputChange(e.target.value, setName, setNameError)}
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
                                {/* Updated: Use localDrinkTypes instead of drinktypes for optimistic updates */}
                                {localDrinkTypes.map((drinkType) => (
                                    <DrinkType
                                        key={drinkType.id}
                                        drinkType={drinkType}
                                        setTypeSelected={setTypeSelected}
                                        setTypeId={setTypeId}
                                        setTypeOptions={setTypeOptions}
                                        handleDrinkTypeUpdate={handleDrinkTypeUpdate}
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
                                        onChange={(e) => handleTextInputChange(e.target.value, setTypePersonalize, setNameError)}

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
                                onChange={(e) => handleTextInputChange(e.target.value, setMeasure, setNameError)}

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
