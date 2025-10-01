import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faXmark, faCheck } from '@fortawesome/free-solid-svg-icons'; 
import FoodItemMenu from './FoodItemMenu';
import MenuItem from './MenuItem';
import { editCalories } from '../../../firebaseService';

function Menu({ menu, loading, idFoodMenu, setSelection }) {
    const [addCalories, setAddCalories] = useState(false);
    const [calories, setCalories] = useState(0);
    const [message, setMessage] = useState(false);
    const [menuCalories, setMenuCalories] = useState([]);
    const [menuWithoutCal, setMenuWithoutCal] = useState([]);
    const [newCalories, setNewCalories] = useState(null);

    const handleNewCalories = async () => {
        try {
            editCalories(newCalories.id, newCalories.calories);
            setNewCalories(null);
        } catch (error) {
            console.log("Error adding calories to food menu: ", error);
        }
    };

    useEffect(()=>{
        message && setInterval(()=>setMessage(false), 5000)
    },[message])

    useEffect(() => {
        if (newCalories) {
            setMenuCalories(prev => [newCalories, ...prev]);
            setMenuWithoutCal(prev => prev.filter(item => item.id !== newCalories.id));
            handleNewCalories();
            setMessage(true)
        }
    }, [newCalories]);

    useEffect(() => {
        setMenuCalories(menu.filter(item => item.calories > 0)
            .sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1));
        setMenuWithoutCal(menu.filter(food => food.calories === 0)
            .sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1));
    }, [menu]);

    return (
        <div className='relative flex flex-col w-full p-2 bg-white/20 rounded-md font-quicksand font-semibold text-white text-md'>
            {loading ? (
                <div className='w-full flex justify-center items-center py-6'>
                    <h1 className='text-white font-belleza text-2xl'>Loading...</h1>
                </div>
            ) : (
                <div className='flex flex-col w-full'>
                    {message && <div className='w-full flex justify-start items-center mb-2'>
                        <p className='text-sm text-white py-1 px-3 rounded-xl bg-healthyGreen font-bold flex flex-row items-center '><FontAwesomeIcon className=' text-md mr-2 font-bold' icon={faCheck}/>Calories were successfully added!</p>
                    </div>}
                    <div className='w-full flex flex-row items-center justify-between my-1 px-4'>
                        <div className='flex flex-row items-center w-2/3 sm:w-3/4 justify-start '>
                            <p className='text-left text-sm font-bold mr-3'>Menu</p>
                        </div>
                        <div className='w-1/3 sm:w-1/4 flex items-center justify-between'>
                            <p className='text-right text-xs sm:text-sm font-bold mr-2 w-1/2'>Portion</p>
                            <p className='text-right text-xs sm:text-sm font-bold w-1/2'>Calories</p>
                        </div>
                    </div>
                    <div className={`bg-white/40 p-2 rounded-lg mt-1 w-full max-h-[250px] sm:max-h-[350px] md:max-h-[500px] ${ addCalories ?  'lg:max-h-[100px]' :'lg:max-h-[300px]'} overflow-y-auto`}>
                        {menuCalories.map((item, index) => (
                            <FoodItemMenu key={index} food={item} setSelection={setSelection} />
                        ))}
                    </div>
                    <div className='flex w-full justify-center items-center flex-col mt-2'>
                        <div className='flex items-center justify-center'>
                            <button onClick={() => setAddCalories(!addCalories)} className='px-3 rounded-md py-1 bg-messidepaul hover:border-2 hover:border-white'>
                                <FontAwesomeIcon icon={addCalories ? faXmark : faList} /> {addCalories ? 'Close this menu' :'Set calories to menu food'}
                            </button>
                        </div>
                        {addCalories && (
                            <div className='w-full flex justify-start flex-col mt-4 bg-messidepaul p-2 rounded-md'>
                                <div className='sticky top-0 flex justify-between items-center font-bold text-xs underline-2 mb-2'>
                                    <p>Food name</p>
                                    <p>Calories per unit</p>
                                </div>
                                <div className='max-h-52 overflow-y-auto'>
                                    {menuWithoutCal.length > 0 ? (
                                        menuWithoutCal.map((item, index) => (
                                            <MenuItem key={index} item={item} setNewCalories={setNewCalories} />
                                        ))
                                    ) : (
                                        <p className='text-white/90 text-sm font-bold text-center w-full'>
                                            All menu items have set calories
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
                
            )}
            
        </div>
    );
}

export default Menu;
