import React, { useEffect, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheck, faCircleXmark, faAngleRight, faTrashCan } from '@fortawesome/free-solid-svg-icons'; 
import FoodItem from './FoodItem';
import RecommendationItem from './RecomendationItem'; 
import Search from './Search';
import messidepaul from '../../../assets/messidepaul.png'
import NewFood from './NewFood';
import { getProducts, getRecomendations } from '../../../firebaseService';
import Menu from './Menu';
import emptyPlate from '../../../assets/emptyPlate.png'
import emptyGlass from '../../../assets/emptyGlass.png'

const PopUp = ({newFood, setAddMeal, foodData, handleAddMeal, setNewFood, selection = [], setSelection, platesData, drinksData, user, }) => {
    const [searchFood, setSearchFood] = useState(foodData);
    const [addFood, setAddFood] = useState(false);
    const [openMenu, setOpenMenu]=useState(false)
    const [menu, setMenu]=useState([])
    const [idFoodMenu, setIdFoodMenu]=useState([])
    const [loading, setLoading]=useState(true)
    const [message, setMessage] = useState(false);
    const [show, setShow] =useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recommendations, setRecommendations] = useState({});
    const [recsLoading, setRecsLoading] = useState(false);
    
    // Cache
    const recommendationsCache = useRef(null);
    const lastFetchTime = useRef(null);
    const needsRefresh = useRef(false);

    // --- LÓGICA DE SELECCIÓN MÚLTIPLE ---
    // PopUp.js (alrededor de la línea 40)
    const toggleSelection = (foodItem, amountInput) => {
        const currentSelection = Array.isArray(selection) ? selection : [];
        const exists = currentSelection.find(item => item.id_food === foodItem.id);

        if (exists) {

            setSelection(currentSelection.filter(item => item.id_food !== foodItem.id));
        } else {
            
            const finalAmount = Number(amountInput || foodItem.measure_portion || 1); 
            if (finalAmount <= 0) return;

            const itemToAdd = { 
                id_food: foodItem.id, 
                name: foodItem.name, 

                amount: finalAmount, 
                measure: foodItem.measure, 
                carbohydrates_portion: foodItem.carbohydrates_portion,
                fats_portion: foodItem.fats_portion, 
                protein_portion: foodItem.protein_portion, 
                sodium_portion: foodItem.sodium_portion
            };
            setSelection([...currentSelection, itemToAdd]);
        }
    };
    const checkIsSelected = (id) => {
        return Array.isArray(selection) && selection.some(s => s.id_food === id);
    };

    const getSelectedAmount = (id) => {
        const item = Array.isArray(selection) ? selection.find(s => s.id_food === id) : null;
        return item ? item.amount : '';
    };

    // -------------------------------------

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

    const fetchRecommendations = async (forceRefresh = false) => {
        if (!forceRefresh && recommendationsCache.current && !needsRefresh.current) {
            setRecommendations(recommendationsCache.current);
            return;
        }

        setRecsLoading(true);
        const recs = {};
        
        try {
            // const promises = [1, 2, 3, 4].map(i => 
            //     getRecomendations(i).catch(error => {
            //         console.log(`Error fetching recommendations for time ${i}`);
            //         return [];
            //     })
            // );
            
            // const results = await Promise.all(promises);
            // results.forEach((result, index) => {
            //     recs[index + 1] = result;
            // });
            const recs = await getRecomendations();
            
            recommendationsCache.current = recs;
            lastFetchTime.current = Date.now();
            needsRefresh.current = false;
            setRecommendations(recs);
        } catch (error) {
            console.log('Error fetching recommendations:', error);
            setRecommendations({});
        } finally {
            setRecsLoading(false);
        }
    };

    const handleOpenMenu=()=>{
        if (openMenu){
            setOpenMenu(false) 
        } else{
            setOpenMenu(true)
            fetchMenu()
        }
    }

    const handleBatchAddMeal = async () => {
        if (isSubmitting || selection.length === 0) return;
        setIsSubmitting(true);
        
        try {
            await handleAddMeal(selection);
            needsRefresh.current = true;
             setSelection([]);
        } catch (error) {
            console.error('Error in handleBatchAddMeal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(()=>{
        message && setInterval(()=>setMessage(false), 3000)
    },[message])

    useEffect(() => {
        if (newFood) {
            setMessage('Food was added successfully!');
            setTimeout(() => setMessage(false), 3000);
        }
    }, [newFood]);

    useEffect(()=>{
        show === 1 && searchFood!==foodData && setSearchFood(foodData)
        show === 2 && setSearchFood(platesData)
        show === 3 && setSearchFood(drinksData)
    },[show])

    useEffect(() => {
        if (show === 4) {
            fetchRecommendations();
        }
    }, [show]);

    return (
        <div className="w-full h-screen absolute top-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
            <div className={`w-11/12 sm:w-full flex flex-col justify-center shadow-lg items-center max-w-[600px] ${openMenu ? 'bg-messidepaul': 'bg-healthyGray'} rounded-2xl px-3 pt-2 pb-14 relative overflow-hidden max-h-[90vh]`}>
                
                {/* Header */}
                <div className="w-full flex justify-between items-start mb-2">
                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-start w-10/12 '>
                        <button onClick={handleOpenMenu} className={ `pl-1 pr-3 py-1 mb-3 sm:mb-0 rounded-full mr-3  font-quicksand font-bold ${openMenu ? 'bg-white hover:bg-healthyGray text-messidepaul' : 'bg-messidepaul hover:bg-messidepaulDark text-white'} flex justify-start items-center w-10/12 sm:w-2/5`}>
                            <img src={messidepaul} alt="logo icon" className='w-2/12 sm:w-1/5'/>
                            <p className='ml-3'>{openMenu ? 'Close' : 'Open' } C&V menu</p>
                        </button>
                        {message  && <p className='text-sm text-white py-1 px-3 rounded-xl bg-healthyGreen flex flex-row items-center font-bold '><FontAwesomeIcon className='text-md mr-2 font-bold' icon={faCheck}/>Food added</p>}
                    </div>
                    <FontAwesomeIcon    
                        onClick={() => setAddMeal(false)} 
                        icon={faCircleXmark} 
                        className={`hover:cursor-pointer ${openMenu ? 'text-white hover:text-healthyGray' : 'text-darkGray/20  hover:text-darkGray/40'} text-3xl text-right w-2/12`}
                    />
                </div>
                
                {/* Content */}
                {openMenu ? <Menu foodData={foodData} menu={menu} loading={loading} idFoodMenu={idFoodMenu} handleAddMeal={handleAddMeal} setSelection={setSelection} selection={selection} />
                :
                <>
                {!addFood && (
                    <>
                        {/* Search Bar & Add Custom Button */}
                        <div className="flex flex-row w-full">
                            <Search foodData={show===1 ? foodData : null } platesData={show === 2 ? platesData : null}  drinksData={show === 3 ? drinksData : null}   setSearchFood={setSearchFood} />
                            <div 
                                onClick={() => setAddFood(true)} 
                                className="flex w-2/12 sm:w-2/12 flex-row ml-3 justify-center items-center py-2 px-4 rounded-2xl font-semibold text-md text-darkGray font-quicksand hover:cursor-pointer bg-white/70 hover:bg-white/90 shadow-sm"
                            >
                                <FontAwesomeIcon icon={faPlus} className="text-darkGray text-lg sm:text-xl" />
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className='flex mt-2 justify-around w-full items-center font-quicksand font-semibold text-sm text-healthyGray'> 
                            <button onClick={()=>setShow(1)} className={`${show===1 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1 hover:bg-white/20'} transition-all w-1/4 py-2`}>Food</button>
                            <button onClick={()=>setShow(2)} className={`${show===2 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1 hover:bg-white/20'} transition-all w-1/4 py-2`}>Plate</button>
                            <button onClick={()=>setShow(3)} className={`${show===3 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1 hover:bg-white/20'} transition-all w-1/4 py-2`}>Drinks</button>
                            <button onClick={()=>setShow(4)} className={`${show===4 ? 'text-healthyDarkGray1  bg-white/40 rounded-t-md font-bold' : 'text-healthyGray1 hover:bg-white/20'} transition-all w-1/4 py-2`}>Recomendation</button>
                        </div>
                        
                        {/* List Area */}
                        {show === 4 && recsLoading ? (
                            <div className='w-full h-[350px] md:h-[500px] lg:h-[330px] bg-white/40 overflow-y-auto flex justify-center flex-col items-center'>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-healthyOrange"></div>
                                <p className='font-quicksand font-bold text-sm mt-4 text-healthyGray1'>Loading...</p>
                            </div>
                        ) : !addFood && ( ((show===1 || show===3) && searchFood?.length > 0) || (show===2 && (searchFood?.mines?.length>0 || searchFood?.others?.length>0) ) || (show===4 && Object.values(recommendations).some(arr => arr.length > 0)) ? (
                            <div className="bg-white/40 p-2 rounded-b-lg w-full max-h-[50vh] overflow-y-auto scrollbar-hide pb-20">
                                {show===4 ? (
                                    <div className='flex flex-col w-full'>
                                         {needsRefresh.current && (
                                            <div onClick={() => fetchRecommendations(true)} className="bg-healthyOrange/20 border border-healthyOrange rounded-lg p-2 mb-2 flex items-center justify-center cursor-pointer">
                                                <p className='text-xs text-healthyDarkOrange font-quicksand font-bold'>Click to Refresh Recommendations</p>
                                            </div>
                                        )}
                                        {['Breakfast', 'Lunch', 'Snack', 'Dinner'].map((time, i) => (
                                            <div key={i}>
                                                <p className='text-xs font-bold text-healthyGray1 font-quicksand pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>{time}</p>
                                                {recommendations[i+1]?.length > 0 ? recommendations[i+1].map((food, index) => (
                                                    <RecommendationItem 
                                                        key={`${i}-${index}`} 
                                                        food={food} 
                                                        toggleSelection={toggleSelection}
                                                        isSelected={checkIsSelected(food.id)}
                                                        alreadyconsumed= {false}

                                                    />
                                                )) : <p className='text-xs text-healthyGray1 mb-2'>No recommendations</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : show===2 && searchFood.mines && searchFood.others ?
                                <div className='flex flex-col w-full '>
                                    <p className='text-xs font-bold text-healthyGray1 font-quicksand  pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>My plates</p>
                                    {searchFood.mines.map((food, index) => (
                                        <FoodItem 
                                            key={food.id || index} 
                                            food={food} 
                                            toggleSelection={toggleSelection}
                                            isSelected={checkIsSelected(food.id)}
                                            initialAmount={getSelectedAmount(food.id)}
                                        />
                                    ))}
                                    <p className='text-xs font-bold text-healthyGray1 font-quicksand pt-2 pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>Other plates</p>
                                    {searchFood.others.map((food, index) => (
                                        <FoodItem 
                                            key={food.id || index} 
                                            food={food} 
                                            toggleSelection={toggleSelection} 
                                            isSelected={checkIsSelected(food.id)}
                                            initialAmount={getSelectedAmount(food.id)}
                                            publicPlates={true}  
                                        />
                                    ))}
                                </div>
                                : searchFood.length > 0 && searchFood.map((food, index) => (
                                    <FoodItem 
                                        key={food.id || index} 
                                        food={food} 
                                        toggleSelection={toggleSelection} 
                                        isSelected={checkIsSelected(food.id)}
                                        initialAmount={getSelectedAmount(food.id)}
                                    />
                                ))}
                            </div>
                        ) :
                        <div className='w-full h-[350px] bg-white/40  overflow-y-auto flex justify-center flex-col items-center'>
                            <img src={show===3 ? emptyGlass : emptyPlate} className='w-1/3 md:w-1/5 opacity-30 ' alt='Empty' />
                            <p className='font-quicksand font-bold text-sm mt-3 text-healthyGray1 text-center w-3/4'>Nothing found here.</p>
                        </div>)}
                    </>
                )}
                {addFood && <NewFood setAddFood={setAddFood} setNewFood={setNewFood} />}
                </>}

                {selection && selection.length > 0 && (
                    <div className="absolute bottom-3 left-0 w-full px-3 flex justify-between items-center z-50 animate-fade-in-up">
                        <div className="flex flex-1 flex-row items-center bg-white/95 backdrop-blur px-4 rounded-2xl py-2 shadow-xl border border-healthyOrange/20 mr-2 justify-between h-[52px]">
                            <div className="flex flex-col w-full overflow-hidden">
                                <p className="font-quicksand font-bold text-darkGray text-sm">
                                    {selection.length} item{selection.length !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                            <div 
                                onClick={() => setSelection([])}
                                className="ml-2 p-2 cursor-pointer hover:bg-gray-100 rounded-full text-healthyGray1 hover:text-red-500 transition-colors"
                            >
                                <FontAwesomeIcon icon={faTrashCan} />
                            </div>
                        </div>

                        <button 
                            onClick={handleBatchAddMeal} 
                            disabled={isSubmitting}
                            className={`h-[52px] font-quicksand text-sm px-5 flex items-center rounded-xl shadow-lg transition-all ${
                                isSubmitting 
                                    ? 'bg-healthyOrange/50 cursor-not-allowed' 
                                    : 'bg-healthyOrange hover:bg-healthyDarkOrange hover:scale-105'
                            } text-white font-bold whitespace-nowrap`}
                        >
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            {isSubmitting ? 'Saving...' : 'Add All'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PopUp;