import React, { useState, useEffect, useContext } from "react";
import PopUp from "../Home/components/PopUp";
import ShoppingList from "./components/ShoppingList";
import Loading from "../../components/Loading";
import { 
    fetchAllFoods, getUserPlates, getPlatesNotUser, getUserDrinks, 
    fetchUser, 
    getWeeklyPlan, 
    updateWeeklyPlan 
} from "../../firebaseService";
import { UserContext } from "../../App";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, faTrash, faShoppingCart, faChevronLeft, faChevronRight, 
    faUtensils, faCalendarDays, faSave, faCircleExclamation, faCopy, faCheck, faTimes 
} from '@fortawesome/free-solid-svg-icons';
import NavBar from "../../components/NavBar";

const MEALS = ["breakfast", "lunch", "snack", "dinner"];
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const MEAL_CONFIG = {
    breakfast: { label: "Breakfast", icon: "🍳" },
    lunch: { label: "Lunch", icon: "🍽️" },
    snack: { label: "Snack", icon: "🍎" },
    dinner: { label: "Dinner", icon: "🌙" }
};


const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); 
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0); 
    return monday;
};

const formatDateISO = (date) => {
    return date.toISOString().split('T')[0];
};

const generateEmptyWeek = (startMondayDate) => {
    const daysObj = {};
    const currentIterDate = new Date(startMondayDate);

    DAYS.forEach((dayName, index) => {
        const dayDate = new Date(currentIterDate);
        dayDate.setDate(startMondayDate.getDate() + index);

        daysObj[dayName] = {
            date: formatDateISO(dayDate),
            breakfast: [],
            lunch: [],
            snack: [],
            dinner: []
        };
    });
    return daysObj;
};



function Planner() {
    const { user_id } = useContext(UserContext);
    const [weekStart, setWeekStart] = useState(() => {
        const monday = getStartOfWeek(new Date());
        return formatDateISO(monday);
    });
    const [plan, setPlan] = useState(() => {
        const monday = getStartOfWeek(new Date());
        return {
            week_start: formatDateISO(monday),
            days: generateEmptyWeek(monday) 
        };
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [addMeal, setAddMeal] = useState(false);
    const [selection, setSelection] = useState(null);
    const [copyConfig, setCopyConfig] = useState(null);
    const [selectedDaysToCopy, setSelectedDaysToCopy] = useState([]);

    const [foodData, setFoodData] = useState([]);
    const [platesData, setPlatesData] = useState([]);
    const [drinksData, setDrinksData] = useState([]);
    const [user, setUser] = useState(null);
    const [currentDay, setCurrentDay] = useState(null);
    const [currentMeal, setCurrentMeal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);
    const [allPlatesMap, setAllPlatesMap] = useState({});
    const [showShoppingList, setShowShoppingList] = useState(false);
    const [shoppingListCache, setShoppingListCache] = useState(null);
    // Efecto al cambiar de semana
    useEffect(() => { fetchPlan(); }, [weekStart]);

    useEffect(() => {
        const fetchData = async () => {
            if (!user_id) return;
            setLoading(true);
            try {
                const [food, privatePlates, otherPlates, drinks, userInfo] = await Promise.all([
                    fetchAllFoods(), getUserPlates(user_id), getPlatesNotUser(user_id), getUserDrinks(user_id), fetchUser()
                ]);
                const allPlatesMap = {};
                const allFoods = [...food, ...privatePlates, ...otherPlates, ...drinks];
                allFoods.forEach(item => {
                    allPlatesMap[item.id] = item; 
                });
                setAllPlatesMap(allPlatesMap);
                console.log("allFoods", allFoods);
                const sortedFood = food.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1);
                setFoodData(sortedFood);
                setPlatesData({ mines: privatePlates, others: otherPlates });
                setDrinksData(drinks);
                setUser(userInfo);
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchData();
    }, [user_id]);
    const calculateDayTotalCalories = (dayData) => {
        let totalCalories = 0;
        MEALS.forEach(meal => {
            const mealList = dayData[meal] || [];
            mealList.forEach(item => {
                const plateDetails = allPlatesMap[item.plate_id];
    
                if (plateDetails) {
                    // B. Obtener los valores necesarios
                    
                    const caloriesPerPortion = plateDetails.calories_portion || 0;
                    const portionAmount = plateDetails.measure_portion || 1; // Asumimos 1 si no está definido
                    const amountEaten = item.amount_eaten || 0; 
                    
                    // C. Aplicar la fórmula: (cant consumida * calorías x porción) / porción
                    if (portionAmount > 0) {
                        const calories = (amountEaten * caloriesPerPortion) / portionAmount;
                        totalCalories += calories;
                    }
                }
            });
        });
        return Math.round(totalCalories); 
    };
    const fetchPlan = async () => {
        setLoading(true);
        try {
            const existingPlan = await getWeeklyPlan(weekStart); 

            if (existingPlan) {
                setPlan({
                    week_start: weekStart,
                    days: existingPlan.days 
                });
                setHasUnsavedChanges(false);
            } else {
                const currentMonday = new Date(weekStart + 'T00:00:00'); 
                setPlan({
                    week_start: weekStart,
                    days: generateEmptyWeek(currentMonday)
                });
            }
        } catch (err) {
            console.error("Error fetching plan, initializing empty plan:", err);
            const currentMonday = new Date(weekStart + 'T00:00:00'); 
            setPlan({
                week_start: weekStart,
                days: generateEmptyWeek(currentMonday)
            });
        } finally {
             setLoading(false);
        }
    };
    const openShoppingList = () => {
        setShowShoppingList(true);
    };


    const handleSaveChanges = async () => {
        console.log("GUARDANDO PAYLOAD CON FECHAS:", JSON.stringify(plan, null, 2));
        setLoading(true);
        
        try {
            const response = await updateWeeklyPlan(plan); 

            if (response) {
                setHasUnsavedChanges(false);
                setShoppingListCache(null);
                console.log("Guardado exitoso!");
            } else {
                 throw new Error("API did not return a successful response.");
            }
        } catch (error) {
            console.error("Error al guardar el plan:", error);
            alert("Error saving plan. Check the console.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMealForPlan = async (batchSelection) => {
        const selectionSource = batchSelection || selection;
        const itemsToProcess = Array.isArray(selectionSource) ? selectionSource : (selectionSource ? [selectionSource] : []);

        if (itemsToProcess.length === 0 || !currentDay || !currentMeal) {
            setSelection([]); 
            setAddMeal(false); 
            setCurrentDay(null); 
            setCurrentMeal(null);
            return;
        }
        const updatedPlan = { ...plan };
        const currentDayObj = updatedPlan.days[currentDay];
        let currentList = currentDayObj[currentMeal] || [];

        if (!selection || !currentDay || !currentMeal) return;
        const newItems = itemsToProcess.map(item => ({
            plate_id: item.id_food, 
            name: item.name,
            amount_eaten: item.amount 
        }));
        console.log("Adding to plan:", newItems);

        
        updatedPlan.days[currentDay] = {
            ...currentDayObj,
            [currentMeal]: [...currentList, ...newItems]
        };

        setPlan(updatedPlan);
        setHasUnsavedChanges(true);
        setSelection([]); 
        setAddMeal(false); 
        setCurrentDay(null); 
        setCurrentMeal(null);
    };

    const handleRemoveMeal = (day, meal, indexToRemove) => {
        const updatedPlan = { ...plan };
        const currentList = updatedPlan.days[day][meal];
        updatedPlan.days[day][meal] = currentList.filter((_, index) => index !== indexToRemove);
        setPlan(updatedPlan);
        setHasUnsavedChanges(true);
    };

    const openCopyModal = (day, meal) => {
        const itemsToCopy = plan.days[day][meal];
        setCopyConfig({ sourceDay: day, mealType: meal, items: itemsToCopy });
        setSelectedDaysToCopy([]); 
    };

    const toggleDaySelection = (day) => {
        if (selectedDaysToCopy.includes(day)) setSelectedDaysToCopy(prev => prev.filter(d => d !== day));
        else setSelectedDaysToCopy(prev => [...prev, day]);
    };

    const executeCopy = () => {
        if (!copyConfig || selectedDaysToCopy.length === 0) return;
        const updatedPlan = { ...plan };
        
        selectedDaysToCopy.forEach(targetDay => {
            updatedPlan.days[targetDay][copyConfig.mealType] = copyConfig.items.map(item => ({ ...item }));
        });

        setPlan(updatedPlan);
        setHasUnsavedChanges(true);
        setCopyConfig(null);
    };

    const changeWeek = (direction) => {
        if(hasUnsavedChanges) {
            if(!window.confirm("You have unsaved changes. Discard them?")) return;
        }
        setShoppingListCache(null);
        const current = new Date(weekStart + 'T00:00:00'); 
        current.setDate(current.getDate() + (direction * 7));
        const newWeekStart = formatDateISO(current);
        
        setWeekStart(newWeekStart);
    };

    const dayHasMeals = (day) => {
        if (!plan?.days?.[day]) return false;
        return MEALS.some(meal => plan.days[day][meal] && plan.days[day][meal].length > 0);
    };

    return (
        <div className="h-screen w-full overflow-y-auto bg-healthyGray relative">
            <NavBar />
            
            {loading ? (
                
                <div className="flex justify-center bg-white items-center h-screen">
                    <Loading />

                </div>
                
            ) : (
                <div className="w-full px-4 pb-10 pt-16 md:pt-24 transition-all duration-300 "> 
                    
                    {/* Header */}
                    <div className="max-w-[1800px] mx-auto bg-white/50 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/50">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl md:text-2xl font-bold font-quicksand text-healthyDarkGray1">
                                    Weekly Planner
                                </h1>
                                {hasUnsavedChanges && (
                                    <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse">
                                        <FontAwesomeIcon icon={faCircleExclamation} /> Unsaved changes
                                    </span>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {hasUnsavedChanges && (
                                    <button onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl shadow-md transition font-bold flex items-center gap-2">
                                        <FontAwesomeIcon icon={faSave} /> Save
                                    </button>
                                )}
                                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-1 shadow-sm">
                                    <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-gray-100 rounded-lg text-healthyOrange">
                                        <FontAwesomeIcon icon={faChevronLeft} />
                                    </button>
                                    <span className="font-quicksand font-semibold text-sm whitespace-nowrap w-32 text-center">
                                        {/* Mostramos fecha formateada bonita */}
                                        Week of {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                    <button onClick={() => changeWeek(1)} className="p-2 hover:bg-gray-100 rounded-lg text-healthyOrange">
                                        <FontAwesomeIcon icon={faChevronRight} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block max-w-[1800px] mx-auto">
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            <div className="grid grid-cols-7 gap-3 flex-1">
                                {DAYS.map((day, index) => {
                                    const isSelected = selectedDayIndex === index;
                                    // Obtenemos la fecha específica de este día para mostrarla
                                    const dayDate = plan?.days?.[day]?.date 
                                        ? new Date(plan.days[day].date + 'T00:00:00') 
                                        : new Date();

                                    return (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDayIndex(index)}
                                            className={`relative p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 ${isSelected ? 'bg-healthyGreen text-white shadow-lg scale-105 z-10' : 'bg-white text-healthyDarkGray1 hover:bg-orange-50 shadow-sm'}`}
                                        >
                                            <span className="capitalize font-quicksand font-bold text-lg">{day.substring(0, 3)}</span>
                                            {/* Mostramos el número del día (ej: 18) */}
                                            <span className={`text-xs font-quicksand ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                {dayDate.getDate()}
                                            </span>
                                            {dayHasMeals(day) && !isSelected && <span className="w-2 h-2 bg-healthyGreen rounded-full absolute top-2 right-2"></span>}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="w-px bg-gray-300 mx-2"></div>
                            <button onClick={() => setSelectedDayIndex(7)} className={`w-32 p-3 rounded-xl transition-all duration-200 flex flex-col items-center justify-center gap-1 ${selectedDayIndex === 7 ? 'bg-healthyDarkGray1 text-white shadow-lg' : 'bg-white text-healthyDarkGray1 border border-gray-200'}`}>
                                <FontAwesomeIcon icon={faCalendarDays} className="text-lg" />
                                <span className="font-quicksand font-bold text-sm">Full Week</span>
                            </button>
                        </div>

                        {/* VISTA ZOOM */}
                        {selectedDayIndex < 7 ? (
                            <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[300px]">
                                <div className="bg-healthyGray/10 p-6 border-b border-gray-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-healthyOrange text-white w-10 h-10 rounded-full flex items-center justify-center text-xl">
                                            <FontAwesomeIcon icon={faUtensils} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold font-quicksand text-healthyDarkGray1 capitalize flex items-center gap-3">
                                                {DAYS[selectedDayIndex]}
                                                {/* Mostramos la fecha completa en el título */}
                                                <span className="text-lg font-normal text-gray-400">
                                                    {plan?.days?.[DAYS[selectedDayIndex]]?.date}
                                                </span>
                                            </h2>
                                            <p className="text-lg font-semibold text-healthyGreen mt-1">
            Total Calories: {calculateDayTotalCalories(plan.days[DAYS[selectedDayIndex]])} Kcal
        </p>
                                        </div>
                                    </div>
                                </div>
                                {/* ... Resto del componente igual ... */}
                                <div className="p-6 grid grid-cols-4 gap-6">
                                    {MEALS.map((meal) => {
                                        const mealList = plan?.days?.[DAYS[selectedDayIndex]]?.[meal] || [];
                                        return (
                                            <div key={meal} className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
                                                {/* ... Mismo contenido de comidas ... */}
                                                 <div className="absolute top-0 right-0 w-20 h-20 bg-healthyOrange/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                                                
                                                <div className="flex items-center justify-between mb-4 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-quicksand font-bold text-gray-600 uppercase text-sm tracking-wider">
                                                            {MEAL_CONFIG[meal].label}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => { setCurrentDay(DAYS[selectedDayIndex]); setCurrentMeal(meal); setAddMeal(true); }}
                                                        className="bg-healthyOrange hover:bg-healthyDarkOrange text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md transition"
                                                    >
                                                        <FontAwesomeIcon icon={faPlus} />
                                                    </button>
                                                </div>

                                                <div className="flex-1 flex flex-col gap-2 relative z-10">
                                                    {mealList.length > 0 ? (
                                                        <>
                                                            <div className="space-y-2 w-full">
                                                                {mealList.map((item, idx) => (
                                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                        <span className="text-sm font-quicksand font-bold text-healthyDarkGray1 line-clamp-1">{item.name}</span>
                                                                        <button onClick={() => handleRemoveMeal(DAYS[selectedDayIndex], meal, idx)} className="text-gray-400 hover:text-red-500 ml-2 p-1">
                                                                            <FontAwesomeIcon icon={faTrash} className="text-xs" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button onClick={() => openCopyModal(DAYS[selectedDayIndex], meal)} className="mt-3 text-xs font-bold text-healthyOrange hover:text-healthyDarkOrange flex items-center justify-center gap-1 py-2 border-t border-gray-100 w-full hover:bg-orange-50 rounded-b-lg transition">
                                                                <FontAwesomeIcon icon={faCopy} /> Repeat this meal
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div onClick={() => { setCurrentDay(DAYS[selectedDayIndex]); setCurrentMeal(meal); setAddMeal(true); }} className="border-2 border-dashed border-gray-200 rounded-xl w-full h-full flex items-center justify-center text-gray-400 text-sm font-quicksand cursor-pointer hover:border-healthyOrange/50 hover:text-healthyOrange transition min-h-[100px]">Add Item</div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* VISTA FULL WEEK */
                            <div className="grid grid-cols-7 gap-3">
                                {DAYS.map((day) => (
                                    <div key={day} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
                                        <div className="bg-gray-50 p-2 border-b border-gray-100 text-center">
                                            <h2 className="font-bold font-quicksand text-healthyDarkGray1 capitalize text-sm">{day}</h2>
                                            {/* Fecha pequeña en vista semanal */}
                                            <span className="text-[10px] text-gray-400 block">
                                                {plan?.days?.[day]?.date}
                                            </span>
                                        </div>
                                        <div className="p-2 space-y-2 flex-1">
                                            {MEALS.map((meal) => {
                                                const mealList = plan?.days?.[day]?.[meal] || [];
                                                return (
                                                    <div key={meal} className="bg-white rounded-lg p-1.5 border border-gray-100 min-h-[50px]">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-xs text-gray-400 font-quicksand uppercase">{MEAL_CONFIG[meal].label.substring(0,1)}</span>
                                                            <button onClick={() => { setCurrentDay(day); setCurrentMeal(meal); setAddMeal(true); }} className="text-healthyOrange text-[10px] hover:font-bold px-1">+</button>
                                                        </div>
                                                        {mealList.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {mealList.map((item, idx) => (
                                                                    <div key={idx} className="text-[10px] font-quicksand text-healthyDarkGray1 bg-gray-50 px-1 rounded truncate">{item.name}</div>
                                                                ))}
                                                            </div>
                                                        ) : <div className="h-2"></div>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    {/* --- VISTA MÓVIL (CORREGIDA) --- */}
                    <div className="md:hidden">
                        <div className="bg-white rounded-2xl shadow-sm p-2 mb-4 sticky top-16 z-20">
                            <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-1">
                                {DAYS.map((day, index) => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDayIndex(index)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl font-quicksand font-semibold capitalize transition whitespace-nowrap ${
                                            selectedDayIndex === index
                                                ? 'bg-healthyOrange text-white shadow-md'
                                                : 'bg-gray-100 text-gray-500'
                                        }`}
                                    >
                                        {day.substring(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        {DAYS.map((day, index) => (
                            selectedDayIndex === index && (
                                <div key={day} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-fadeIn min-h-[60vh]">
                                    <div className="bg-healthyOrange p-4">
                                        <h2 className="font-bold font-quicksand text-white text-center text-xl capitalize">
                                            {day}
                                        </h2>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        {MEALS.map((meal) => {
                                            const mealList = plan?.days?.[day]?.[meal] || [];
                                            return (
                                                <div key={meal} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <div className="flex items-center gap-2">
                                                            {/* Usa el icono/emoji de MEAL_CONFIG */}
                                                            <span className="text-2xl">{MEAL_CONFIG[meal].icon}</span>
                                                            <span className="font-quicksand font-bold text-healthyDarkGray1">
                                                                {MEAL_CONFIG[meal].label}
                                                            </span>
                                                        </div>
                                                        {mealList.length === 0 && (
                                                            <button 
                                                                onClick={() => { setCurrentDay(day); setCurrentMeal(meal); setAddMeal(true); }} 
                                                                className="bg-healthyOrange text-white px-3 py-1 rounded-lg text-sm font-bold shadow-sm"
                                                            >
                                                                <FontAwesomeIcon icon={faPlus} className="mr-1"/> Add
                                                            </button>
                                                        )}
                                                    </div>
                                                    {mealList.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {/* Iteramos sobre el array de comidas (mealList) */}
                                                            {mealList.map((item, idx) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                                                                    <p className="font-quicksand font-medium text-healthyDarkGray1 line-clamp-1">{item.name}</p>
                                                                    {/* Usamos handleRemoveMeal para eliminar el ítem específico */}
                                                                    <button 
                                                                        onClick={() => handleRemoveMeal(day, meal, idx)} 
                                                                        className="text-red-400 hover:text-red-600 p-1 ml-2"
                                                                    >
                                                                        <FontAwesomeIcon icon={faTrash} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p 
                                                            onClick={() => { setCurrentDay(day); setCurrentMeal(meal); setAddMeal(true); }}
                                                            className="text-xs text-gray-400 font-quicksand text-center py-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg hover:border-healthyOrange/50 hover:text-healthyOrange transition"
                                                        >
                                                            No meal planned. Tap to add.
                                                        </p>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                    
                    {/* Modals */}
                    {addMeal && <PopUp user={user} newFood={null} setAddMeal={setAddMeal} foodData={foodData} handleAddMeal={handleAddMealForPlan} setNewFood={() => {}} setSelection={setSelection} selection={selection} platesData={platesData} drinksData={drinksData} />}
                    {copyConfig && (
                        <div className="fixed inset-0 bg-black/50 z-[60] flex justify-center items-center backdrop-blur-sm px-4 animate-fadeIn">
                            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
                                <div className="bg-healthyOrange p-4 flex justify-between items-center">
                                    <h3 className="text-white font-bold font-quicksand text-lg flex items-center gap-2">
                                        <FontAwesomeIcon icon={faCopy} /> Repeat {MEAL_CONFIG[copyConfig.mealType].label}
                                    </h3>
                                    <button onClick={() => setCopyConfig(null)} className="text-white/80 hover:text-white"><FontAwesomeIcon icon={faTimes} size="lg"/></button>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 font-quicksand text-sm mb-4">Select the days you want to copy this meal to. <br/><span className="text-xs text-gray-400 italic">* Only empty slots are available.</span></p>
                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
                                        {DAYS.map((day) => {
                                            if (day === copyConfig.sourceDay) return null;
                                            return (
                                                <button 
                                                    key={day}
                                                    onClick={() => toggleDaySelection(day)}
                                                    className={`w-full py-3 px-4 rounded-xl font-bold capitalize transition-all duration-200 flex justify-between items-center ${
                                                        selectedDaysToCopy.includes(day) 
                                                            ? 'bg-healthyGreen text-white shadow-md' 
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {day}
                                                    {selectedDaysToCopy.includes(day) && <FontAwesomeIcon icon={faCheck} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div className="flex justify-end gap-3 mt-6">
                                        <button onClick={() => setCopyConfig(null)} className="bg-gray-300 hover:bg-gray-400 text-healthyDarkGray1 px-4 py-2 rounded-xl font-bold transition">
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={executeCopy} 
                                            disabled={selectedDaysToCopy.length === 0}
                                            className="bg-healthyOrange disabled:bg-healthyOrange/50 hover:bg-healthyDarkOrange text-white px-4 py-2 rounded-xl font-bold transition"
                                        >
                                            Copy ({selectedDaysToCopy.length})
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {dayHasMeals(DAYS[0]) && (
        
                        <button 
                            onClick={openShoppingList}
                            className="fixed bottom-4 right-4 bg-healthyDarkGray1 hover:bg-gray-700 text-white p-4 rounded-full shadow-lg transition z-30 flex items-center gap-2 font-bold">
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                            
                            {showShoppingList && (
                <ShoppingList 
                    weekstart={weekStart} 
                    setShowShoppingList={setShowShoppingList}
                    cachedData={shoppingListCache}
                    setCachedData={setShoppingListCache}
                />
            )}
                            <span className="md:inline hidden">Shopping List</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default Planner;