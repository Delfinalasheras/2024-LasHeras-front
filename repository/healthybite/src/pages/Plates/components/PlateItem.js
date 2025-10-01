import React, { useEffect, useRef, useState } from 'react'
import { faBookmark, faCirclePlus, faEllipsisVertical, faEye, faEyeSlash, faUtensils } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Counter from '../../../components/Counter'
import EditFood from './EditFood'
import DeletePopUp from '../../../components/DeletePopUp'
import {deleteplate,updatePlate,createReview} from '../../../firebaseService'
import { Visibility } from './Visibility'
import { uploadImageToStorage } from '../../../firebaseConfig'

export const PlateItem = ({ plateDetail, foodData, handleupdatePlates,setSuccessMessage , setAddFood,selection, setPlate}) => {
    const [plate, setPlateDetail]=useState(plateDetail)
    const [options, setOption] = useState(false)
    const [edit, setEdit] = useState(false)
    const [deleteItem, setDeleteItem] = useState(false)
    const [clickable, setClickable] = useState(true);
    const [publicPlate, setPublicPlate]=useState(plateDetail.public)
    const fileInputRef = useRef(null);
    const [ingredientsUpdate, setIngredientsUpdate] = useState(
        plate.ingredients.map((item) => ({ ...item })) // Clone ingredients
    );
    const [foodPlate, setFoodPlate]=useState(ingredientsUpdate.map((item) => {
        const foodItem = foodData.find((food) => food.id === item.ingredientId);
        return foodItem ? { ...foodItem, amount: item.quantity } : null;
    }).filter(Boolean))
    
    const handleRemoveIngredient = (index) => {
        const updatedIngredients = ingredientsUpdate.filter((_, idx) => idx !== index);
        setIngredientsUpdate(updatedIngredients);
    };

    useEffect(()=>{
        if(plate && foodData.length>0 && selection?.ingredients.length>0 && selection){
            const newFoodData=selection.ingredients.map((item)=>{
                const foodItem = foodData.find((food) => food.id === item.ingredientId);
                return { ...foodItem, amount: item.quantity } ;
            })
            setFoodPlate(newFoodData)}
        
    },[selection])

    
    useEffect(() => {
        const updatedFoodPlate = ingredientsUpdate.map((item) => {
            const foodItem = foodData.find((food) => food.id === item.ingredientId);
            return foodItem ? { ...foodItem, amount: item.quantity } : null;
        }).filter(Boolean);
        
        setFoodPlate(updatedFoodPlate);
    }, [ingredientsUpdate, foodData]);
    

    const handleUpdateIngredient = (index, newQuantity) => {
        const updatedIngredients = ingredientsUpdate.map((ingredient, idx) => 
            idx === index ? { ...ingredient, quantity: newQuantity } : ingredient
        );
        setIngredientsUpdate(updatedIngredients);
    };
    const createReviewForPublicPlate = async () => {
        const review = {
            id_plate: plate.id,
            comments: [],
            score: 0
        };
        try {
            // Assume createReviewAPI is the function that saves the review to Firebase
            await createReview(review);
            console.log("Review created successfully!");
        } catch (error) {
            console.error("Error creating review:", error);
        }
    };

    const updateData = async () => {
        const updatedPlate = {
            ...plate,
            ingredients: foodPlate.map((item) => ({
                ingredientId: item.id,
                quantity: Number(item.amount) || 0
            })),
            calories_portion: foodPlate.reduce(
                (acc, item) => acc + ((Number(item.calories_portion) || 0) * (Number(item.amount) || 0)),
                0
            ),
            sodium_portion: foodPlate.reduce(
                (acc, item) => acc + ((Number(item.sodium_portion) || 0) * (Number(item.amount) || 0)),
                0
            ),
            carbohydrates_portion: foodPlate.reduce(
                (acc, item) => acc + ((Number(item.carbohydrates_portion) || 0) * (Number(item.amount) || 0)),
                0
            ),
            protein_portion: foodPlate.reduce(
                (acc, item) => acc + ((Number(item.protein_portion) || 0) * (Number(item.amount) || 0)),
                0
            ),
            fats_portion: foodPlate.reduce(
                (acc, item) => acc + ((Number(item.fats_portion) || 0) * (Number(item.amount) || 0)),
                0
            ),
            public: publicPlate
        };

        try {
            await updatePlate(updatedPlate, plate.id);
            setSuccessMessage("Plate updated successfully!");

            // Trigger review creation if the plate was made public
            if (publicPlate && !plate.public) {
                await createReviewForPublicPlate();
            }
            setEdit(false)
            setTimeout(() => setSuccessMessage(""), 2500);
            setOption(false)
        } catch (error) {
            console.error("Error updating plate:", error);
        }
    };
    const handleOptions = () => {
        edit && setEdit(false)
        setOption(!options)
    }

    const handleDelete = async() => {
        try{
            await deleteplate(plate.id)
            handleupdatePlates()
            setDeleteItem(false)

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
    
    const handleAddFood=()=>{
        setPlate(plate)
        setAddFood(true)
    }

    const updateImage=async(e)=>{
        const imageUrl = await uploadImageToStorage(e.target.files[0]);
        setPlateDetail({...plate, image: imageUrl })
        setPlate({...plate, image: imageUrl});
        await updatePlate({...plate, image: imageUrl}, plate.id);
        
    }

    return (
        <>
            {deleteItem ? (
                <DeletePopUp handleDelete={handleSingleClick} setCancel={setDeleteItem} />
            ) : (
                <div className="w-full flex flex-col justify-center items-center">
                    <div className="z-5 flex w-full justify-between mt-2 bg-white p-1 items-center rounded-full shadow-md">
                        <div className="flex items-center">
                            {plate.image ? (
                                <img
                                    src={plate.image}
                                    alt={plate.name}
                                    className="w-12 h-12 object-cover border-2 border-healthyDarkOrange rounded-full"
                                />
                            ) : (
                                <div className='group'>
                                    <input type="file" ref={fileInputRef} accept="image/*" onChange={(e)=>updateImage(e)} className='hidden'/>
                                    <FontAwesomeIcon
                                        onClick={()=>fileInputRef.current.click()}
                                        icon={faUtensils}
                                        className="border-2 cursor-pointer border-healthyDarkOrange text-healthyDarkOrange py-2 px-2 text-2xl rounded-full"
                                    />
                                    <p className='absolute  text-white text-xs font-semibold px-2 py-1 rounded-md bg-healthyDarkOrange shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300'>Update image</p>
                                </div>
                            )}
                            <div className="flex flex-col justify-center items-start ml-3">
                                <p className="font-semibold text-healthyDarkOrange">{plate.name}</p>
                                <p className="text-xs text-healthyDarkOrange">
                                    {foodPlate.reduce((acc, item) => acc + (item.calories_portion * item.amount), 0)} calories
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="flex justify-end items-center mx-2">
                                <FontAwesomeIcon
                                    className="p-1 rounded-full bg-healthyOrange text-white shadow-sm text-sm"
                                    icon={publicPlate ? faEye : faEyeSlash}
                                />
                            </div>

                            {!plate.public && options && (
                                <div className="flex items-center border-2 justify-center text-xs text-healthyOrange font-semibold border-healthyOrange px-2 rounded-full mr-3">
                                    <p onClick={() => setEdit(!edit)} className="cursor-pointer hover:text-healthyDarkOrange">
                                        Edit
                                    </p>
                                    <p
                                        onClick={() => setDeleteItem(true)}
                                        className="ml-1 border-l-2 border-l-healthyOrange pl-1 hover:text-healthyDarkOrange cursor-pointer"
                                    >
                                        Delete
                                    </p>
                                </div>
                            )}
                            {!publicPlate && !edit && (
                                <FontAwesomeIcon
                                    onClick={handleOptions}
                                    icon={faEllipsisVertical}
                                    className="text-healthyDarkOrange cursor-pointer text-2xl mr-4"
                                />
                            )}
                        </div>
                    </div>

                    {/* Render editing section only if edit is active and plate is not public */}
                    {edit && !plate.public && (
                        <div className="flex flex-col w-11/12 bg-healthyDarkOrange p-2 rounded-b-md">
                            <div className="flex flex-row justify-between items-start">
                                <div className="flex flex-col w-10/12">
                                    {foodPlate.map((item, index) => (
                                        <EditFood
                                            item={item}
                                            key={index}
                                            onQuantityChange={(newQuantity) => handleUpdateIngredient(index, newQuantity)}
                                            onRemove={() => handleRemoveIngredient(index)}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col justify-center items-center  bg-white/30 p-1 rounded-full w-8">
                                    <FontAwesomeIcon
                                        onClick={handleAddFood}
                                        icon={faCirclePlus}
                                        className="text-2xl w-full mb-2 text-white hover:text-healthyDarkOrange2 cursor-pointer"
                                    />
                                    <Visibility publicPlate={publicPlate} setPublicPlate={setPublicPlate} vertical />
                                </div>
                            </div>
                            <div className="w-full flex justify-center items-center ">
                                <div
                                    onClick={updateData}
                                    className="hover:cursor-pointer bg-white shadow-md rounded-2xl px-2 lg:px-4 py-1 flex flex-row items-center justify-center mt-2 w-full lg:w-1/2"
                                >
                                    <FontAwesomeIcon icon={faBookmark} className="text-healthyOrange text-sm" />
                                    <p className="font-semibold text-xs text-center text-healthyOrange ml-2">Save changes</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
