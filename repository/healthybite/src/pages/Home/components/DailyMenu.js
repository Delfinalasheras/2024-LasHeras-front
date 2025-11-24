import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleXmark, faXmark } from '@fortawesome/free-solid-svg-icons';
import RecommendationItem from './RecomendationItem'; 
import { getWeeklyPlan, getDailyMenu } from '../../../firebaseService';
import emptyPlate from '../../../assets/emptyPlate.png';
import ProgressBar from '../../../components/ProgressBar';

const DailyMenu = ({ setAddMeal, handleAddMeal, selection, setSelection, currentDate = new Date(), allFoods = [], allPlates = { mines: [], others: [] }, allDrinks = [] ,foodconsumed}) => {
    
    const [activeTab, setActiveTab] = useState('daily');
    const [userWeeklyPlan, setUserWeeklyPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [dailyMenu, setDailyMenu] = useState(null); 
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

//funciones
    const getStartOfWeek = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
    };

    const getDayName = (date) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    };


    const getFormattedDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const findItemDetails = (idToFind) => {
        if (!idToFind) return null;
        let found = allFoods.find(f => f.id === idToFind);
        if (found) return found;
        found = allPlates.mines?.find(p => p.id === idToFind);
        if (found) return found;
        found = allPlates.others?.find(p => p.id === idToFind);
        if (found) return found;
        found = allDrinks.find(d => d.id === idToFind);
        return found;
    };

    useEffect(() => {
        const loadData = async () => {

            if (activeTab === 'planned') {

                setLoadingPlan(true);
                try {
                    const weekStart = getStartOfWeek(currentDate);
                    const data = await getWeeklyPlan(weekStart);
                    if (data) setUserWeeklyPlan(data);
                } catch (error) {
                    console.error("Error fetching plan", error);
                } finally {
                    setLoadingPlan(false);
                }
            } 
            else if (activeTab === 'daily') {
                setLoadingDaily(true);
                try {
                    const dateStr = getFormattedDate(currentDate); 
                    const data = await getDailyMenu(dateStr); 
                    if (data) setDailyMenu(data);
                } catch (error) {
                    console.error("Error fetching daily menu", error);
                } finally {
                    setLoadingDaily(false);
                }
            }
        };

        loadData();
    }, [activeTab, currentDate]); 

    const handleSingleClickAddMeal = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            await handleAddMeal();
            setAddMeal(false);    
        } catch (error) {
            console.error('Error adding meal:', error);
        } finally {
            setIsSubmitting(false);
        }
    };
    const foodAlreadyConsumed = (foodconsumed, itemtocheck) => {
        for (const fooditem of foodconsumed) {
            const medida = itemtocheck.measure_portion ?? 1;
    
            if (
                fooditem.id_Food === itemtocheck.id &&
                fooditem.amount_eaten == medida
            ) {
                return true;
            }
        }
    
        return false; // 👉 se retorna false SOLO si recorrió todo y no encontró nada
    };
    

    const renderMyPlan = () => {
        if (loadingPlan) return <LoadingState message="Loading plan..." />;
        
        const dayName = getDayName(currentDate);
        const dayData = userWeeklyPlan?.days?.[dayName];

        if (!dayData) return <EmptyState message={`No plan for ${dayName}`} />;

        let planTotalCalories = 0;
        const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];

        const mealElements = mealOrder.map((mealType) => {
            const items = dayData[mealType] || [];
            if (items.length === 0) return null;

            const itemsList = items.map((planItem, index) => {
                const dbItem = findItemDetails(planItem.plate_id);
                if (!dbItem) return null; 
                
                let ratio = 1;
                if (dbItem.type === "food" || dbItem.measure_portion) {
                     const basePortion = dbItem.measure_portion || 1;
                     ratio = planItem.amount_eaten / basePortion;
                } else {
                    ratio = planItem.amount_eaten;
                }

                const itemCalories = (dbItem.calories_portion || dbItem.calories || 0) * ratio;
                planTotalCalories += itemCalories;

                const preparedItem = {
                    ...dbItem,
                    measure_portion: planItem.amount_eaten, 
                    measure: planItem.measure || dbItem.measure,
                    calories_portion: itemCalories,
                    carbohydrates_portion: (dbItem.carbohydrates_portion || 0) * ratio,
                    fats_portion: (dbItem.fats_portion || 0) * ratio,
                    protein_portion: (dbItem.protein_portion || 0) * ratio,
                    sodium_portion: (dbItem.sodium_portion || 0) * ratio,
                    name: planItem.name || dbItem.name 
                };
                const alreadyConsumed=foodAlreadyConsumed(foodconsumed, preparedItem)

                return (
                    <RecommendationItem 
                        key={`${mealType}-${index}`} 
                        food={preparedItem} 
                        setSelection={setSelection} 
                        alredyconsumed={alreadyConsumed}
                    />
                );
            }).filter(item => item !== null);

            if (itemsList.length === 0) return null;

            return (
                <div key={mealType} className="mb-4">
                     <p className='text-xs font-bold text-healthyGray1 font-quicksand pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left capitalize'>
                        {mealType}
                    </p>
                    {itemsList}
                </div>
            );
        }).filter(meal => meal !== null);
        
        return (
            <>
                <ProgressBar 
                    total={planTotalCalories} 
                    goal={userWeeklyPlan.calories_goal || 2000} 
                />
                {mealElements}
            </>
        );
    };


    const renderDailyMenu = () => {
        if (loadingDaily) return <LoadingState message="Loading recommendations..." />;
        if (!dailyMenu) return <EmptyState message="No recommendations found" />;

        const mapping = [
            { key: '1', label: 'Breakfast' },
            { key: '2', label: 'Lunch' },
            { key: '3', label: 'Snack' },
            { key: '4', label: 'Dinner' }
        ];
        
        const totalEstimado = dailyMenu.total_estimado || 0;
        const objetivo = dailyMenu.objetivo || 2000;

        const hasData = mapping.some(m => dailyMenu[m.key] && dailyMenu[m.key].length > 0);

        if (!hasData) return <EmptyState message="No recommendations for today" />;

        return (
            <>
                <ProgressBar 
                    total={totalEstimado} 
                    goal={objetivo} 
                />
                
                {mapping.map(({ key, label }) => {
                    const items = dailyMenu[key] || [];
                    if (items.length === 0) return null;

                    return (
                        <div key={key} className="mb-4">
                            <p className='text-xs font-bold text-healthyGray1 font-quicksand pb-1 border-b-2 border-healthyGray1 mb-1 w-full text-left'>
                                {label}
                            </p>
                            {items.map((obj, index) => {
                                const foodItem = obj.item ? obj.item : obj; 
                                const alreadyConsumed = foodAlreadyConsumed(foodconsumed, foodItem);
                                return (
                                    <RecommendationItem 
                                        key={`rec-${key}-${index}`} 
                                        food={foodItem} 
                                        setSelection={setSelection} 
                                        alredyconsumed={alreadyConsumed}
                                    />
                                );
                            })}
                        </div>
                    );
                })}
            </>
        );
    };

    const EmptyState = ({ message }) => (
        <div className='w-full h-[200px] flex justify-center flex-col items-center opacity-60'>
            <img src={emptyPlate} className='w-1/5 opacity-30' alt="Empty" />
            <p className='font-quicksand font-bold text-sm mt-3 text-healthyGray1'>{message}</p>
        </div>
    );

  
    const LoadingState = ({ message = "Loading..." }) => (
        <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthyOrange"></div>
            <p className="text-healthyGray1 mt-2 font-quicksand">{message}</p>
        </div>
    );

    return (
        <div className="w-full h-screen absolute top-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
            <div className="w-11/12 sm:w-full max-w-[600px] bg-healthyGray rounded-2xl px-4 pt-4 pb-14 relative shadow-xl flex flex-col max-h-[85vh]">
                {/* ... Header y Botón Cerrar siguen igual ... */}
                <div className="w-full flex justify-between items-center mb-4">
                    <h2 className="text-xl font-quicksand font-bold text-healthyDarkGray1">
                        Menu & Plan
                    </h2>
                    <button
                        onClick={() => setAddMeal(false)}
                        className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100/50 transition-colors z-50"
                        aria-label="Close menu"
                    >
                        <FontAwesomeIcon    
                            icon={faCircleXmark} 
                            className="text-darkGray/20 hover:text-darkGray/40 text-3xl cursor-pointer transition-colors"
                        />
                    </button>
                </div>


                <div className='flex mb-4 bg-white/50 rounded-lg p-1'> 
                    <button 
                        onClick={() => setActiveTab('daily')} 
                        className={`flex-1 py-2 rounded-md text-sm font-quicksand font-bold transition-all ${
                            activeTab === 'daily' 
                            ? 'bg-white text-healthyOrange shadow-sm' 
                            : 'text-healthyGray1 hover:bg-white/30'
                        }`}
                    >
                        Suggested
                    </button>
                    <button 
                        onClick={() => setActiveTab('planned')} 
                        className={`flex-1 py-2 rounded-md text-sm font-quicksand font-bold transition-all ${
                            activeTab === 'planned' 
                            ? 'bg-white text-healthyOrange shadow-sm' 
                            : 'text-healthyGray1 hover:bg-white/30'
                        }`}
                    >
                        My Plan
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                    {activeTab === 'daily' ? renderDailyMenu() : renderMyPlan()}
                </div>

                {selection && (
                    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-center animate-fade-in-up">
                        {/* ... contenido del footer ... */}
                         <div className="flex flex-1 flex-row items-center bg-white/90 backdrop-blur px-4 rounded-2xl py-2 shadow-lg border border-healthyOrange/20 mr-2 justify-between">
                            <div className='flex flex-col sm:flex-row sm:items-center overflow-hidden w-full'>
                                <p className="font-quicksand font-bold text-darkGray text-sm truncate mr-2">
                                    {selection.name}
                                </p>
                                <span className="text-xs text-healthyGray1 font-semibold whitespace-nowrap">
                                    ({Math.round(selection.amount * 100) / 100} {selection.measure})
                                </span>
                            </div>
                            <FontAwesomeIcon 
                                icon={faXmark} 
                                className="text-healthyGray1 hover:text-red-500 cursor-pointer ml-2 p-1" 
                                onClick={() => setSelection(null)} 
                            />
                        </div>

                        <button 
                            onClick={handleSingleClickAddMeal} 
                            disabled={isSubmitting}
                            className={`font-quicksand text-sm px-4 py-3 flex items-center rounded-xl shadow-lg transition-all ${
                                isSubmitting 
                                    ? 'bg-healthyOrange/50 cursor-not-allowed' 
                                    : 'bg-healthyOrange hover:bg-healthyDarkOrange hover:scale-105'
                            } text-white font-bold whitespace-nowrap`}
                        >
                            <FontAwesomeIcon icon={faCheck} className="mr-2" />
                            {isSubmitting ? '...' : 'Add'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyMenu;