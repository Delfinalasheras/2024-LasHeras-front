import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSquarePlus} from '@fortawesome/free-solid-svg-icons'; 
import FoodItem from './FoodItem';
import SaveButton from './SaveButton';
import {   faIceCream, faCaretDown } from '@fortawesome/free-solid-svg-icons';
import Data from '../../Data'
import IconDrop from './IconDrop';
import Category from '../Category';
import { updateCategory } from '../../../firebaseService';


function EditCategory({setEditCategory, setAddFood, category, icon, food, handleUpdate, selection}) {
    const iconOptions = Data.iconOptions
    const [dropIcons,setDropIcons]=useState(false)
    const [iconSelected,setIconSelected]=useState(icon)
    const [catFoods, setCatFoods] = useState(category.foods.map((item) => food.find((element) => element.id === item)));
    const [name, setName]=useState(category.name)
    const [clickable, setClickable] = useState(true);

    const handleChanges= async ()=>{
        const data={
            name:name, 
            icon:iconSelected.name,
            foods: catFoods.map((items)=>items.id)
        }
        if(data !== category) {
            try{
                await updateCategory(data,category.id)
                console.log(data)
                setEditCategory(false)
                handleUpdate()
                console.log("Category updated succesfully")
            }catch(error){
                console.log("Error saving category changes by ID ", error)
            }
        }
        setEditCategory(false)
    }
    const handleSingleClick = () => {
        if (clickable) {
            setClickable(false); 
            handleChanges(); 
            setTimeout(() => {
                setClickable(true); 
            }, 1000); 
        }
    };
    const handleIcon=(icon)=>{
        setIconSelected(icon)
        setDropIcons(false)
    }

    useEffect(()=>{
        if(selection.category === category.id){
            selection.food.length>0 && setCatFoods(selection.food)
        }
    }, [selection])



  return (
    <div className='flex flex-col w-full bg-healthyOrange p-2 rounded-b-md font-quicksand'>
            <div className='flex flex-row justify-between items-center'>
                <div className='flex flex-row items-center justify-between w-2/3 '>
                    <p className='font-semibold text-sm text-white  text-center w-1/4'>Name</p>
                    <input onChange={(e)=>setName(e.target.value)} value={name} className=' rounded-sm p-1  bg-white text-sm w-3/4 ' type='text' placeholder={category.name} ></input>
                </div>
                <div className='flex flex-row items-center justify-between w-1/3 '>
                    <p className='font-semibold text-sm text-white  text-center w-1/2 lg:w-2/3'>Icon</p>
                    <div className='flex flex-row bg-white items-center justify-between rounded-sm py-1 px-2 w-1/2 lg:w-1/3'>
                        <FontAwesomeIcon className='text-healthyGray1 text-lg' icon={iconSelected.icon} />
                        <FontAwesomeIcon onClick={()=>setDropIcons(!dropIcons)} className='text-healthyGray1 text-lg hover:cursor-pointer hover:text-healthyDarkGray1' icon={faCaretDown} />
                    </div>
                </div>
            </div>
            {dropIcons && <IconDrop handleIcon={handleIcon} />}
            <div className='flex flex-col sm:flex-row justify-around sm:justify-between w-full items-center sm:items-start mt-3'>
                <div className='flex flex-row sm:flex-col items-center justify-between sm:justify-around w-full sm:w-1/3 lg:w-1/4'>
                    <p className='font-semibold text-sm text-white  text-left sm:text-center w-full mb-2'>Food</p>
                    <div onClick={()=>setAddFood(category)} className='hover:cursor-pointer hover:mt-1 w-4/5 flex flex-row items-center justify-between  py-1 px-2 rounded-md border-2 border-white'>
                        <p className='font-semibold text-xs text-white '>Add food</p>
                        <FontAwesomeIcon icon={faSquarePlus} className='text-xl text-white ' />
                    </div>
                </div>
                <div className='flex flex-col bg-white rounded-sm mt-2 sm:mt-0 w-full sm:w-2/3 lg:w-3/4 items-start justify-start p-1 max-h-32 overflow-y-auto'>
                    {catFoods.map((item, index)=>(<FoodItem key={index} food={item} setCatFoods={setCatFoods} catFoods={catFoods}/>))}
                </div>
            </div>
            <div className='flex w-full justify-center items-center pt-4 pb-2'>
                <SaveButton handleChanges={handleSingleClick} label="Save changes"/>
            </div>
        </div>
  )
}

export default EditCategory