import { faBookmark, faCaretRight, faEllipsisVertical, faWineBottle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useEffect } from 'react';
import DeletePopUp from '../../../components/DeletePopUp';
import { deleteDrink, updateDrink } from '../../../firebaseService';

const DrinkItem = ({ drink, typeOfDrinks, handleUpdate }) => {
    const [deleteItem, setDeleteItem] = useState(false);
    const [edit, setEdit] = useState(false);
    const [caretClicked, setCaretClicked] = useState(false);

    const [options, setOption] = useState(false);
    const [message, setMessage] = useState('');
    const [typeSelected, setTypeSelected] = useState(drink.type);
    const [index, setIndex] = useState(() => {
        const initialIndex = typeOfDrinks.findIndex(item => item.id === drink.typeOfDrink);
        return initialIndex !== -1 ? initialIndex : 0; // Default to 0 if not found
    });
    const [clickable, setClickable] = useState(true);

    // Add state for each input field
    const [name, setName] = useState(drink.name || "");
    const [caffeine, setCaffeine] = useState(drink.caffeine_portion || "");
    const [sugar, setSugar] = useState(drink.sugar_portion || "");
    const [calories, setCalories] = useState(drink.calories_portion || "");
    const [amount, setAmount] = useState(drink.measure_portion || "");
    const [measure, setMeasure] = useState(drink.measure || "");

    useEffect(() => {
        // Reset input fields when drink changes
        setName(drink.name || "");
        setCaffeine(drink.caffeine_portion || "");
        setSugar(drink.sugar_portion || "");
        setCalories(drink.calories_portion || "");
        setAmount(drink.measure_portion || "");
        setMeasure(drink.measure || "");
        setTypeSelected(drink.type); // Reset typeSelected as well
    }, [drink]); // Add drink as a dependency

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage('');  // Clear the message after 3 seconds (3000ms)
            }, 3000);
            return () => clearTimeout(timer);  // Cleanup the timeout if the component unmounts or message changes
        }
    }, [message]);

    useEffect(() => {
        setOption(false);
    }, [typeSelected]);

    const handleOptions = () => {
        edit && setEdit(false);
        setOption(!options);
    };

    const handleEditDrink = async () => {
        console.log('Edit function triggered');
    
        if (!name || !measure || !amount || !calories) {
            setMessage("Please fill all the fields");
            return;  // Stop execution if validation fails
        }
    
        const data = {
            name: name,
            sugar_portion: sugar,
            caffeine_portion: caffeine || 0,
            calories_portion: calories || 0,
            measure: measure|| 0,
            measure_portion: amount|| 0,
            typeOfDrink: typeSelected,
        };
    
        try {
            await updateDrink(drink.id, data);
            console.log("Data to update:", data);  // Check the data object structure
    
            setMessage('Drink updated successfully'); // Success message
            setEdit(false);  // Close the edit form
            handleUpdate();  // Trigger the parent component to re-fetch the updated data
            console.log('Drink updated successfully');
        } catch (error) {
            setMessage('Error updating drink: ' + error.message); // Error message
            console.log('Error updating drink: ', error);
        }
    };
    
    const handleDelete = async () => {
        try {
            await deleteDrink(drink.id);
            handleUpdate();
            setDeleteItem(false);
        } catch (error) {
            console.log("Error deleting category: ", error);
        }
    };

    const handleSingleClick = () => {
        if (clickable) {
            setClickable(false);
            handleDelete();
            setTimeout(() => {
                setClickable(true);
            }, 1000);
        }
    };

    // handleChange logic
    const handleInputChange = (newValue, min, max, setValue) => {
        if (newValue < min) {
            setValue(min);
        } else if (newValue > max) {
            setValue(max);
        } else {
            setValue(newValue);
        }
    };

    const handleChange = (e, setValue) => {
        const newValue = e.target.value;

        if (newValue === "") {
            setValue(""); 
            return;
        }
        const parsedValue = parseInt(newValue, 10);
        if (!isNaN(parsedValue)) {
            handleInputChange(parsedValue, 0, 1000, setValue); // Here the min is 0 and max is 1000, you can adjust accordingly
        }
    };

    return (
        <>
            {deleteItem ? (
                <DeletePopUp handleDelete={handleSingleClick} setCancel={setDeleteItem} />
            ) : (
                <div className='w-full lg:w-full flex flex-col justify-center items-center'>
                    {message && (
                        <div className={`w-full text-center p-2 mb-2 rounded-lg ${message.includes('successfully') ? 'text-healthyGreen' : 'bg-red-100 text-red-800'}`}>
                            {message}
                        </div>
                    )}
                    <div className='z-5 flex w-full justify-between mt-2 bg-white p-1 items-center rounded-full shadow-md'>
                        <div className='flex items-center'>
                            <FontAwesomeIcon icon={faWineBottle} className='border-4 border-healthyDarkOrange text-healthyDarkOrange py-2 px-2 text-2xl rounded-full' />
                            <div className='flex flex-col justify-center items-start'>
                                <p className='font-semibold text-healthyDarkOrange ml-3'>{drink.name}</p>
                            </div>
                        </div>
                        <div className='flex items-center'>
                            {options && (
                                <div className='flex items-center border-2 justify-center text-xs text-healthyOrange font-semibold border-healthyOrange px-2 rounded-full mr-3'>
                                    <p onClick={() => setEdit(!edit)} className='cursor-pointer hover:text-healthyDarkOrange'>Edit</p>
                                    <p onClick={() => setDeleteItem(true)} className='ml-1 border-l-2 border-l-healthyOrange pl-1 hover:text-healthyDarkOrange cursor-pointer'>Delete</p>
                                </div>
                            )}
                            <FontAwesomeIcon onClick={handleOptions} icon={faEllipsisVertical} className='text-healthyDarkOrange cursor-pointer text-2xl mr-4' />
                        </div>
                    </div>
                    {edit && (
                        <div className='flex flex-col w-11/12 bg-healthyDarkOrange p-2 rounded-b-md justify-center items-center'>
                            <div className='w-full'>
                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Drink name</p>
                                    <input type="text" onChange={(e) => setName(e.target.value)} value={name} className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Caffeine</p>
                                    <input 
                                        type="number" 
                                        placeholder='0'
                                        value={caffeine} 
                                        onChange={(e) => handleChange(e, setCaffeine)} 
                                        className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' 
                                    />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Sugar</p>
                                    <input 
                                        type="number" 
                                        placeholder='0'
                                        value={sugar} 
                                        onChange={(e) => handleChange(e, setSugar)} 
                                        className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' 
                                    />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Calories</p>
                                    <input 
                                        type="number" 
                                        value={calories} 
                                        onChange={(e) => handleChange(e, setCalories)} 
                                        className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' 
                                    />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Amount</p>
                                    <input 
                                        type="number" 
                                        value={amount} 
                                        onChange={(e) => handleChange(e, setAmount)} 
                                        className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' 
                                    />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Measure</p>
                                    <input 
                                        type="text" 
                                        placeholder='cup'
                                        value={measure} 
                                        onChange={(e) => setMeasure(e.target.value)} 
                                        className='bg-white focus:outline-none px-2 py-1 w-full text-sm text-darkGray rounded-full' 
                                    />
                                </div>

                                <div className='flex flex-col w-full my-2'>
                                    <p className='text-white font-bold text-sm'>Type of Drink</p>
                                    <div className='flex items-center justify-between'>
                                        <p className='flex flex-col w-full my-2 bg-white px-2 py-1 w-32 text-left rounded-l-full text-sm text-darkGray'>
                                            {caretClicked 
                                                ? typeOfDrinks.find(type => type.id === typeSelected)?.name 
                                                : typeOfDrinks.find(type => type.id === drink.typeOfDrink)?.name || "Unknown Type"}
                                        </p>
                                        <FontAwesomeIcon 
                                            onClick={() => {
                                                const nextIndex = (typeOfDrinks.findIndex(type => type.id === typeSelected) + 1) % typeOfDrinks.length;
                                                setTypeSelected(typeOfDrinks[nextIndex]?.id);
                                                setCaretClicked(true);  // Set caretClicked to true once the user clicks the caret
                                            }} 
                                            icon={faCaretRight} 
                                            className='text-white cursor-pointer bg-healthyOrange p-1 px-2 text-xl hover:bg-healthyOrange/70 rounded-r-full' 
                                        />
                                    </div>
                                </div>


                                <div onClick={handleEditDrink} className='hover:cursor-pointer bg-healthyOrange shadow-md py-1 rounded-full mx-3 my-1 flex flex-row items-center justify-center w-36'>
                                    <FontAwesomeIcon icon={faBookmark} className='text-white text-sm' />
                                    <p className='font-semibold text-xs text-center text-white ml-2'>Save changes</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default DrinkItem;


