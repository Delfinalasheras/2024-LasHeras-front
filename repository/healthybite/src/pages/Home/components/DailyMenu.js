import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCircleXmark, faXmark, faCirclePlus, faCircleCheck } from '@fortawesome/free-solid-svg-icons'; // Agregué faCircleCheck y faCirclePlus
import { getWeeklyPlan, getDailyMenu } from '../../../firebaseService';
import emptyPlate from '../../../assets/emptyPlate.png';
import ProgressBar from '../../../components/ProgressBar';
import RecommendationItem from './RecomendationItem';

const DailyMenu = ({ setAddMeal, handleAddMeal, selection = [], setSelection, currentDate = new Date(), allFoods = [], allPlates = { mines: [], others: [] }, allDrinks = [] ,foodconsumed}) => {
    
    const [activeTab, setActiveTab] = useState('daily');
    const [userWeeklyPlan, setUserWeeklyPlan] = useState(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [dailyMenu, setDailyMenu] = useState(null); 
    const [loadingDaily, setLoadingDaily] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();

    // obtener lunes (getDay: 0=domingo, 1=lunes... 6=sábado)
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((day + 6) % 7));

    // evitar problemas de timezone
    monday.setHours(0, 0, 0, 0);

    return monday.toISOString().slice(0, 10);
};


    const getDayName = (date) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    };

    const getFormattedDate = (date) => {
        // Opción segura manual que respeta la zona horaria local
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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


    const toggleSelection = (foodItem) => {

        const currentSelection = Array.isArray(selection) ? selection : [];
        const exists = currentSelection.find(item => item.id_food === foodItem.id);

        if (exists) {

            const newSelection = currentSelection.filter(item => item.id_food !== foodItem.id);
            setSelection(newSelection);
        } else {

            const amount = foodItem.measure_portion || 1;
            const itemToAdd = { 
                id_food: foodItem.id, 
                name: foodItem.name, 
                amount, 
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

    const handleBatchAddMeal = async () => {
        if (isSubmitting || selection.length === 0) return;
        setIsSubmitting(true);
        try {

            await handleAddMeal(selection);
            setSelection([]); 
            setAddMeal(false);   
        } catch (error) {
            console.error('Error adding meals:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const foodAlreadyConsumed = (foodconsumed, itemtocheck) => {
        if(!foodconsumed) return false;
        for (const fooditem of foodconsumed) {
            const medida = itemtocheck.measure_portion ?? 1;
            if (fooditem.id_Food === itemtocheck.id && fooditem.amount_eaten == medida) {
                return true;
            }
        }
        return false;
    };
    

    const renderMyPlan = () => {
        if (loadingPlan) return <LoadingState message="Loading plan..." />;
        
        const dayName = getDayName(currentDate);
        console.log("HAY PLAN",userWeeklyPlan)
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
                const alreadyConsumed = foodAlreadyConsumed(foodconsumed, preparedItem);
                const isSelected = checkIsSelected(preparedItem.id);
                console.log("RECO CARACT",dbItem,planItem)

                return (
                    
                    <RecommendationItem 
                        key={`${mealType}-${index}`} 
                        food={preparedItem} 
                        toggleSelection={toggleSelection}
                        isSelected={isSelected}
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
                                const amount_eaten = (foodItem.measure_portion||1) * (obj.amount_eaten);
                                const alreadyConsumed = foodAlreadyConsumed(foodconsumed, foodItem);
                                const isSelected = checkIsSelected(foodItem.id);

                                return (
                                    <RecommendationItem 
                                        key={`rec-${key}-${index}`} 
                                        food={foodItem} 
                                        toggleSelection={toggleSelection}
                                        isSelected={isSelected}
                                        alredyconsumed={alreadyConsumed}
                                        amount_eaten ={amount_eaten}
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

                <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide pb-24">
                    {activeTab === 'daily' ? renderDailyMenu() : renderMyPlan()}
                </div>

                {/* FOOTER PARA MULTIPLE SELECCION */}
                {selection && selection.length > 0 && (
                    <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-center animate-fade-in-up z-50">
                         <div className="flex flex-1 flex-row items-center bg-white/90 backdrop-blur px-4 rounded-2xl py-2 shadow-lg border border-healthyOrange/20 mr-2 justify-between h-[52px]">
                            <div className='flex flex-col overflow-hidden w-full'>
                                <p className="font-quicksand font-bold text-darkGray text-sm truncate">
                                    {selection.length} item{selection.length > 1 ? 's' : ''} selected
                                </p>
                            </div>
                            <div 
                                onClick={() => setSelection([])}
                                className="ml-2 p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FontAwesomeIcon 
                                    icon={faXmark} 
                                    className="text-healthyGray1 hover:text-red-500 text-lg" 
                                />
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
                            {isSubmitting ? '...' : 'Add All'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
export default DailyMenu;