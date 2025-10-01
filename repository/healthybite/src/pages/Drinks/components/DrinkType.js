// DrinkType.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {deleteDrinkType} from '../../../firebaseService'

const DrinkType = ({ drinkType, setTypeSelected, setTypeId,setTypeOptions, handleDrinkTypeUpdate }) => {
    const typeselected = async () => {
        setTypeSelected(drinkType.name);
        setTypeId(drinkType.id);
        setTypeOptions(false)
    };
    const handleDelete=async()=>{
        try{
            await deleteDrinkType(drinkType.id)
            handleDrinkTypeUpdate()
            console.log("deletetype", drinkType.id)
            
            // handleUpdate()
        }catch(error){
            console.log("Error deleting category: ", error)
        }
    }

    return (
        <div className='flex justify-between items-center mt-1 bg-hbGreen rounded-sm hover:border-healthyGreen border-2 border-hbGreen'>
            <button
                onClick={typeselected}
                className='w-11/12 text-sm text-left bg-hbGreen  text-healthyDarkGreen px-2 rounded-sm'
            >
                {drinkType.name}
            </button>
            {drinkType.id_user !== 'default' && (
                <button onClick={() => handleDelete(drinkType.id)} className='ml-2 border-hbGreen border-2'>
                    <FontAwesomeIcon icon={faTimes} className='text-red-500' />
                </button>
            )}
        </div>
    );
};

export default DrinkType;

