import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faXmark, faCircleXmark } from '@fortawesome/free-solid-svg-icons'; 
import FoodItem from './FoodItem';
import Search from './Search';
import messidepaul from '../../../assets/messidepaul.png'
import NewFood from './NewFood';
import { getProducts } from '../../../firebaseService';
import Menu from './Menu';
import emptyPlate from '../../../assets/emptyPlate.png'
import emptyGlass from '../../../assets/emptyGlass.png'

const PopUp = ({newFood, setAddMeal, foodData, handleAddMeal, setNewFood, selection, setSelection, platesData, drinksData }) => {
    const [searchFood, setSearchFood] = useState(foodData);
    const [addFood, setAddFood] = useState(false);
    const [openMenu, setOpenMenu]=useState(false)
    const [menu, setMenu]=useState([])
    const [idFoodMenu, setIdFoodMenu]=useState([])
    const [loading, setLoading]=useState(true)
    const [message, setMessage] = useState(false);
    const [show, setShow] =useState(1);
    const [clickable, setClickable] = useState(true);

    const fetchMenu=async()=>{
        try{
            const data= await getProducts()
            setMenu(data)
            setIdFoodMenu(data.map((item)=>item.id))
            setLoading(false)
        }catch(error){
            console.log("Error fetching products from Messi and DePaul APP")
        }
    }

    const handleOpenMenu=()=>{
        if (openMenu){
            setOpenMenu(false) 
        } else{
            setOpenMenu(true)
            fetchMenu()
        }
    }
    const handleSingleClickAddMeal = () => {
        if (clickable) {
            setClickable(false); // Disable further clicks
            handleAddMeal(); // Call your existing handleAddMeal logic
            setTimeout(() => {
                setClickable(true); // Re-enable after a delay (or based on a condition)
            }, 1000); // Optional delay to prevent excessive clicks
        }
    };

    useEffect(()=>{
        message && setInterval(()=>setMessage(false), 3000)
    },[message])

    useEffect(()=>{
        newFood && setMessage('The food was added succesfully!')
    },[newFood])

    useEffect(()=>{

        setSearchFood(foodData)
        
    },[foodData])

    useEffect(()=>{
        show === 1 && searchFood!==foodData && setSearchFood(foodData)
        show === 2 && setSearchFood(platesData)
        show === 3 && setSearchFood(drinksData)
    },[show])

    return (
        <div className="w-full h-screen absolute top-0 z-50 flex justify-center items-center bg-black/30">
            <div className={`w-11/12 sm:w-full flex flex-col justify-center shadow-lg items-center max-w-[600px] ${openMenu ? 'bg-messidepaul': 'bg-healthyGray'} rounded-2xl px-3 pt-2 pb-12 relative`}>
                <div className="w-full flex justify-between items-start mb-2">
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-start w-10/12 '>
                        <button onClick={handleOpenMenu} className={ `pl-1 pr-3 py-1 mb-3 sm:mb-0 rounded-full mr-3  font-quicksand font-bold ${openMenu ? 'bg-white hover:bg-healthyGray text-messidepaul' : 'bg-messidepaul hover:bg-messidepaulDark text-white'} flex justify-start items-center w-10/12 sm:w-2/5`}>
                            <img src={messidepaul} alt="logo icon" className='w-2/12 sm:w-1/5'/>
                            <p className='ml-3'>{openMenu ? 'Close' : 'Open' } C&V menu</p>
                        </button>
                        {message  && <p className='text-sm text-white py-1 px-3 rounded-xl bg-healthyGreen flex flex-row items-center font-bold '><FontAwesomeIcon className='text-md mr-2 font-bold' icon={faCheck}/>Food was added successfully</p>}
                    </div>
                    <FontAwesomeIcon    
                        onClick={() => setAddMeal(false)} 
                        icon={faCircleXmark} 
                        className={`hover:cursor-pointer ${openMenu ? 'text-white hover:text-healthyGray' : 'text-darkGray/20  hover:text-darkGray/40'} text-3xl text-right w-2/12`}
                    />
                </div>
                
                {openMenu ? <Menu foodData={foodData} menu={menu} loading={loading} idFoodMenu={idFoodMenu} handleAddMeal={handleAddMeal} setSelection={setSelection} selection={selection} />
                :
                <>
                {!addFood && (
                    <>
                        <div className="flex flex-row w-full">
                            <Search foodData={show===1 ? foodData : null } platesData={show === 2 ? platesData : null}  drinksData={show === 3 ? drinksData : null}   setSearchFood={setSearchFood} />
                            <div 
                                onClick={() => setAddFood(true)} 
                                className="flex w-2/12 sm:w-4/12 flex-row ml-3 justify-center items-center py-2 px-4 rounded-2xl font-semibold text-md text-darkGray font-quicksand hover:cursor-pointer bg-white/70 hover:bg-white/90"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-darkGray text-lg sm:text-xl" />
                                {window.innerWidth > '650' && <p className="ml-2 text-center"></p>}
                            </div>
                        </div>
                        <div className='flex mt-3 justify-around w-full items-center  font-quicksand font-semibold text-sm text-healthyGray'> 
                            <button onClick={()=>setShow(1)} className={`${show===1 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1  '} w-1/3 py-2`}>Food</button>
                            <button onClick={()=>setShow(2)} className={`${show===2 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1  '} w-1/3 py-2`}>Plate</button>
                            <button onClick={()=>setShow(3)} className={`${show===3 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1  '} w-1/3 py-2`}>Drinks</button>
                        </div>
                        {!addFood && ( ((show===1 || show===3) && searchFood?.length > 0) || (show===2 && (searchFood?.mines?.length>0 || searchFood?.others?.length>0) ) ? (
                            <div className="bg-white/40 p-2 rounded-b-lg w-full max-h-[350px] md:max-h-[500px] lg:max-h-[330px]  overflow-y-auto">
                                {show===2 && searchFood.mines && searchFood.others ?
                                <div className='flex flex-col w-full '>
                                    <p className='text-xs font-bold text-healthyGray1 font-quicksand  pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>My plates</p>
                                    {show===2 && searchFood.mines.map((food, index) => (
                                        <FoodItem key={index} food={food} setSelection={setSelection} />
                                    ))}
                                    <p className='text-xs font-bold text-healthyGray1 font-quicksand pt-2 pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>Another plates</p>
                                    {show===2 && searchFood.others.map((food, index) => (
                                        <FoodItem key={index} food={food} setSelection={setSelection} publicPlates={true}/>
                                    ))}
                                </div>
                                : searchFood.length > 0 && searchFood.map((food, index) => (
                                    <FoodItem key={index} food={food} setSelection={setSelection} />
                                ))}
                            </div>
                        ) :
                        <div className='w-full h-[350px] md:h-[500px] lg:h-[330px] bg-white/40  overflow-y-auto flex justify-center flex-col items-center'>
                            <img src={show===3 ? emptyGlass : emptyPlate} className='w-1/3 md:w-1/5 opacity-30 ' alt={show===3 ? 'Empty glass' :'Empty plate'} />
                            <p className='font-quicksand font-bold text-sm mt-3 text-healthyGray1 text-center w-3/4'>There are no {show==1 ? 'food' : show===2 ? 'plates' : 'drinks'}&nbsp;created</p>
                        </div>)}
                    </>
                )}
                {addFood && <NewFood setAddFood={setAddFood} setNewFood={setNewFood} />}
                </>}
                {selection && (
                    <div className="flex items-center justify-center w-full mt-2">
                        <div className="flex flex-row justify-center items-center font-quicksand text-darkGray text-sm bg-white/70 px-5 rounded-3xl py-2">
                            <p className="font-semibold">{selection.name}</p>
                            <div className="flex justify-end items-center ml-4">
                                <p>{selection.amount}</p>
                                <p className="ml-1">{selection.measure}</p>
                            </div>
                            <FontAwesomeIcon 
                                icon={faXmark} 
                                className="text-darkGray text-xl hover:cursor-pointer hover:text-healthyDarkGray1 ml-4" 
                                onClick={() => setSelection(null)} 
                            />
                        </div>
                    </div>
                )}
                {selection && (
                    <button 
                    onClick={handleSingleClickAddMeal} 
                    className="absolute bottom-2 right-2 font-quicksand text-sm px-3 py-1 flex items-center rounded-xl bg-healthyOrange text-white font-bold hover:cursor-pointer hover:bg-healthyDarkOrange"
                >
                    <FontAwesomeIcon icon={faCheck} className="text-white text-lg mr-2" />
                    Save changes
                </button>
                
                )}
            </div>
        </div>
    );
};

export default PopUp;
