import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIceCream, faTrash, faPen} from '@fortawesome/free-solid-svg-icons'; 

import EditCategory from './EditCategory';
import Data from '../../Data';
import { deleteCategory } from '../../../firebaseService';
import DeletePopUp from '../../../components/DeletePopUp';


function CategoryItem({setAddFood, category, food, handleUpdate, selection}) {
    const icon=Data.iconOptions.find((e)=>e.name===category.icon)

    const [editCategory, setEditCategory]=useState(false)
    const [deleteItem, setDeleteItem]=useState(false)
    const [clickable, setClickable] = useState(true);

    const handleDelete=async()=>{
        try{
            await deleteCategory(category.id)
            handleUpdate()
        }catch(error){
            console.log("Error deleting category: ", error)
        }
    }
    const handleSingleClick = () => {
        if (clickable) {
            setClickable(false); 
            handleDelete()
            setTimeout(() => {
                setClickable(true); 
            }, 1000); 
        }
    };

  return (
    <>
    {deleteItem ?
    <DeletePopUp handleDelete={handleSingleClick} setCancel={setDeleteItem}/>
    :<div className='flex flex-col w-full my-2'>
        <div className='w-full bg-healthyDarkOrange shadow-md py-1 px-2 sm:py-2 rounded-md flex flex-row justify-between items-center font-quicksand'>
            <div className='flex flex-row items-center justify-start'>
                <FontAwesomeIcon icon={icon.icon} className='text-white text-xl sm:text-3xl '/> 
                <p className='text-white font-semibold ml-2 text-sm sm:text-md'>{category.name}</p>
            </div>
            <div className='flex flex-row justify-end items-center'>
                <div onClick={()=>setDeleteItem(true)} className='sm:bg-white sm:hover:bg-healthyGray hover:cursor-pointer rounded-full  sm:py-1 sm:px-2 '>
                    <FontAwesomeIcon  icon={faTrash} className='text-sm sm:text-md text-white sm:text-healthyDarkOrange'/>
                </div>
                <div onClick={()=>setEditCategory(!editCategory)} className='bg-white hover:bg-healthyGray hover:cursor-pointer rounded-full py-1 px-2 ml-2 '>
                    <FontAwesomeIcon   icon={faPen} className='text-sm sm:text-md text-healthyDarkOrange'/>
                </div>
            </div>
        </div>
        {editCategory && <EditCategory key={category.id} handleUpdate={handleUpdate} food={food} icon={icon} category={category} setAddFood={setAddFood} setEditCategory={setEditCategory} selection={selection} />}
    </div>
    }</>
  )
}

export default CategoryItem