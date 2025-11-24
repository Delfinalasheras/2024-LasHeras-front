import React, { useContext, useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faPlus, faUtensils } from '@fortawesome/free-solid-svg-icons'; 
import bgImage from '../../assets/imgHome.jpg'
import Calendar from "../../components/Calendar";
import NavBar from "../../components/NavBar";
import Calories from "./components/Calories";
import FoodConsumed from "./components/FoodConsumed";
import PopUp from "./components/PopUp";
import DailyMenu from "./components/DailyMenu"; // Import the new component
import { addGoal,getstreak,addNewFood,getPlatesNotUser, addUserFood, fetchAllFoods, fetchUserFoods, deleteUserFood , editUserFood, getCategories, getDefaultCategories,getProdByID, getUserDrinks,getUserPlates, getGroupedDrinkTypes, fetchUser, editUserData } from "../../firebaseService";
import Filter from "./components/Filter";
import StreakCounter from "./components/StreakCounter";
import Loading from "../../components/Loading";
import Data from "../Data";
import { CircularProgressbar } from 'react-circular-progressbar';
import { PieChart } from "@mui/x-charts";
import Goals from "../../components/Goals";
import { UserContext } from "../../App";

function Home() {
    const {user_id} = useContext(UserContext);
    const [foodData, setFoodData] = useState([]); 
    const [platesData, setPlatesData] = useState([]); 
    const [drinksData, setDrinksData] = useState([]); 
    const [userFood, setUserFood] = useState([]); 
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState();
    // const [selection, setSelection] = useState();
    const [selection, setSelection] = useState([]);
    const [addMeal, setAddMeal] = useState(false);
    const [newFood, setNewFood] = useState();
    const [categories, setCategories]=useState([])
    const [filteredFood, setFilteredFood]=useState([])
    const [filterSelected, setFilterSelected]=useState(null)
    const [loading, setLoading] = useState(true);
    const [user, setUser]=useState()
    const goalName=Data.goals
    const [index,setIndex]=useState(1)
    const [goalConsumed, setGoalConsumed]=useState(0)
    const [streak, setStreak] = useState(0);
    const [askForGoals, setAskForGoals]=useState(false)

    const [showDailyMenu, setShowDailyMenu] = useState(false); // State to control popup visibility

    // Fetch daily menu
// Refetch when user_id or date changes


    useEffect(()=>{
        let value=0
        switch (index){
            case 1:
                value=userFood.reduce((acc,food)=>acc+((food.calories_portion * food.amount_eaten) / food.measure_portion),0);
                break;
            case 2:
                value=userFood.reduce((acc,food)=>acc+((food.sodium_portion  ? food.sodium_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            case 3:
                value=userFood.reduce((acc,food)=>acc+((food.fats_portion ? food.fats_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            case 4:
                value=userFood.reduce((acc,food)=>acc+((food.carbohydrates_portion ? food.carbohydrates_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            case 5: 
                value=userFood.reduce((acc,food)=>acc+((food.protein_portion ? food.protein_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            case 6: 
                value=userFood.reduce((acc,food)=>acc+((food.caffeine_portion ? food.caffeine_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            case 7: 
                value=userFood.reduce((acc,food)=>acc+((food.sugar_portion ? food.sugar_portion : 0 * food.amount_eaten) / food.measure_portion),0);
                break;
            default:
                value=0;
            
        }
        setGoalConsumed(value)
    },[index, userFood])


    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const streakValue = await getstreak(user_id);
                setStreak(streakValue && streakValue.length>0 ? streakValue[0] : 0 );
                if (streakValue?.length>0 && streakValue>2){
                    addGoal(1)
                }
                else if (streakValue?.length>0 &&  streakValue>=10){
                    addGoal( 2)
                }
            } catch (error) {
                console.error("Error fetching streak:", error);
            }
        };

        user && fetchStreak();
    }, [userFood]);

    const updateUserGoals = async (userEdited) => {
        console.log("USER EDITED FROM POPUP → ", userEdited)
        setAskForGoals(false)
        setUser(userEdited)
        await editUserData(userEdited)
    }
    


    useEffect(()=>{
        if(filterSelected) {
            console.log('se aplico filtro filterselected ',filterSelected)
            const aplyingFilter=filteredFood.filter((item)=>filterSelected.foods.includes(item.id_Food) || filterSelected.plates?.includes(item.id_Food) || filterSelected.drinks?.includes(item.id_Food) )
            setFilteredFood(aplyingFilter)
        }else{
            setFilteredFood(userFood)
        }
    },[filterSelected])

    const getUserData = async()=> {
        try{
            const userInfo = await fetchUser()
            if(userInfo){
                const { email, ...filteredUserData } = userInfo;
                if (Object.values(filteredUserData.goals).some(goal => goal === 0)) {
                    setAskForGoals(true);
                }
                setUser(filteredUserData)
            }else{
                console.error('Error in fetchUser() in userData ', userInfo)
            }
        }catch(error){
            console.log('Error in getUserData() Home')
        }

    }

    const get_Food_plates_drinks=async()=>{
        try{
            const [food, privatePlates, otherPlates, drinks] = await Promise.all([
                fetchAllFoods(),
                getUserPlates(user_id),
                getPlatesNotUser(user_id),
                getUserDrinks(user_id)
            ]);
            const sortedFood = food.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1);
            const plates = { mines: privatePlates, others: otherPlates };
            return { food: sortedFood, plates, drinks };
        }catch (error) {
            console.log('Error fetching food plates and drinks in Home:', error);
            throw new Error('No se pudo cargar la información de comida, platos y bebidas');
        }
        
    }



    const fetchFoods = async (daySelected) => {
        try {
            setLoading(true)
            if (isNaN(new Date(date).getTime())) {
                throw new Error('Invalid date value');
            }
            const userFood = await fetchUserFoods(user_id, daySelected ? daySelected:  date );
            let { food, plates, drinks } ={foodData, platesData, drinksData}
            console.log('USER FOOD ', userFood)
            if (food?.length===0 || !plates ||!drinks) {
                ({ food, plates, drinks}= await get_Food_plates_drinks());
                setFoodData(food);
                setPlatesData(plates);
                setDrinksData(drinks);
            }
            
            if (!food?.length || !plates || !drinks) {
                console.error('Faltan datos para completar la carga de información.');
                return;
            }
            const userFoodDetails = await Promise.all(userFood.map(async (item)=>{
                let foodDetails  =  food?.find(food=>food.id===item.id_Food) || plates.mines?.find(plate=>plate.id===item.id_Food) ||  plates.others?.find(plate=>plate.id===item.id_Food) ||  drinks?.find(drink=>drink.id===item.id_Food) 
                if(!foodDetails){
                    try {
                        foodDetails = await getProdByID(parseInt(item.id_Food));
                        if (!foodDetails) {
                            console.warn(`Producto con ID ${item.id_Food} no encontrado.`);
                        }
                    } catch (error) {
                        console.error('Error buscando el producto:', error);
                    }
                    console.log('FOOD DETAIL ', foodDetails)
                }
                
                const calories = foodDetails?.calories_portion !== undefined 
                    ? Math.round(foodDetails?.calories_portion) 
                    : Math.round(foodDetails?.calories || 0);
    
                return foodDetails && {
                    ...item,
                    name: foodDetails?.name || 'Unknown',
                    measure: foodDetails?.measure || 'Plate/s',
                    measure_portion: foodDetails?.measure_portion || 1,
                    calories_portion: calories || 0,
                    carbohydrates_portion: foodDetails?.carbohydrates_portion || 0,
                    sodium_portion: foodDetails?.sodium_portion || 0,
                    fats_portion: foodDetails?.fats_portion || 0,
                    protein_portion: foodDetails?.protein_portion || 0,
                    caffeine_portion: foodDetails?.caffeine_portion || 0,
                    sugar_portion: foodDetails?.sugar_portion || 0,
                    public: foodDetails?.public || false,
                    verified: foodDetails?.verified || false
                } 
                
            }))
            setUserFood(userFoodDetails);
            setFilteredFood(userFoodDetails);
        }catch (err) {
            console.error('Error fetching data:', err.message);
        }finally {
            setLoading(false);
        }
    }
    
    


    const fetchCategories = async () => {
        try {
            const cats = await getCategories(user_id);
            const defaultCats= await getDefaultCategories();
            const drinkCats = await getGroupedDrinkTypes(user_id);
            const combinedCats = [
                ...cats, 
                ...defaultCats,
                ...drinkCats
            ];
            setCategories(combinedCats);
        } catch (err) {
            console.log('Error al obtener las categorias: ' , err);
        }
    };

const handleAddMeal = async (itemsToAdd) => {
    // Si no vienen items por argumento, usamos el estado local por seguridad
    const itemsToProcess = itemsToAdd || selection;

    if (!itemsToProcess || itemsToProcess.length === 0) return;

    try {
        const newLocalMeals = []; // Array para guardar los items temporales
        const promises = []; // Array para las promesas de Firestore

        // Preparamos la fecha base una sola vez
        const selectedDate = new Date(date);
        const now = new Date();
        selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        
        // Ajuste de zona horaria
        const dateTimeForIngestion = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);

        // --- BUCLE: Procesamos cada item seleccionado ---
        for (const item of itemsToProcess) {
            const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Buscamos los detalles usando el ID del item actual del bucle
            let foodDetails = foodData?.find(f => f.id === item.id_food) || 
                             platesData?.mines?.find(p => p.id === item.id_food) ||
                             platesData?.others?.find(p => p.id === item.id_food) ||
                             drinksData?.find(d => d.id === item.id_food);

            // Construimos el objeto
            const newMeal = {
                id: tempId,
                id_Food: item.id_food,
                amount_eaten: item.amount,
                date_ingested: dateTimeForIngestion,
                name: item.name,
                measure: item.measure || foodDetails?.measure || 'plate',
                measure_portion: foodDetails?.measure_portion || 1,
                calories_portion: foodDetails?.calories_portion || Math.round(foodDetails?.calories || 0),
                carbohydrates_portion: item.carbohydrates_portion || foodDetails?.carbohydrates_portion || 0,
                sodium_portion: item.sodium_portion || foodDetails?.sodium_portion || 0,
                fats_portion: item.fats_portion || foodDetails?.fats_portion || 0,
                protein_portion: item.protein_portion || foodDetails?.protein_portion || 0,
                caffeine_portion: foodDetails?.caffeine_portion || 0,
                sugar_portion: foodDetails?.sugar_portion || 0,
                public: foodDetails?.public || false,
                verified: foodDetails?.verified || false
            };

            newLocalMeals.push(newMeal);

            // Preparamos la llamada a Firestore (pero no esperamos con await aquí para hacerlo paralelo)
            const uploadPromise = addUserFood(user_id, item, dateTimeForIngestion, item.amount)
                .then(realId => ({ tempId, realId })); // Retornamos mapeo de IDs
            
            promises.push(uploadPromise);
        }

        // 1. UI Optimista: Agregamos TODO el bloque visualmente de inmediato
        setUserFood(prev => [...prev, ...newLocalMeals]);
        setFilteredFood(prev => [...prev, ...newLocalMeals]);

        // Limpiamos formularios
        setAmount(null);
        setSelection([]); // Volvemos a array vacío
        setAddMeal(false);

        // 2. Sincronización Real: Esperamos a que TODOS se guarden en Firestore
        const results = await Promise.all(promises);

        // 3. Actualizamos IDs: Reemplazamos los tempIds por los reales
        setUserFood(prev => prev.map(food => {
            const result = results.find(r => r.tempId === food.id);
            return result ? { ...food, id: result.realId } : food;
        }));

        setFilteredFood(prev => prev.map(food => {
            const result = results.find(r => r.tempId === food.id);
            return result ? { ...food, id: result.realId } : food;
        }));

        console.log('All meals synced successfully');

    } catch (error) {
        console.error('Error adding batch meals:', error);

        // Rollback: Si falla, quitamos los que tengan temp_
        setUserFood(prev => prev.filter(food => !food.id.toString().startsWith('temp_')));
        setFilteredFood(prev => prev.filter(food => !food.id.toString().startsWith('temp_')));

        alert('Failed to add meals. Please try again.');
    }
};
    



const handleDeleteMeal = async (idDoc_user_food) => {
    try {

        setUserFood((prevUserFood) => prevUserFood.filter((food) => food.id !== idDoc_user_food)); 
        setFilteredFood((prevFilteredFood) => prevFilteredFood.filter((food) => food.id !== idDoc_user_food));
        

        await deleteUserFood(idDoc_user_food);
        console.log('Meal deleted from Firestore successfully');
        
    } catch (err) {
        console.error('Error deleting meal:', err.message);
        fetchFoods(date);
    }
};

const handleEditFoodConsumed = async (idDoc_user_food, data) => {
    try {

        setUserFood(prev => prev.map(food => 
            food.id === idDoc_user_food ? { ...food, amount_eaten: data.amount_eaten } : food
        ));
        setFilteredFood(prev => prev.map(food => 
            food.id === idDoc_user_food ? { ...food, amount_eaten: data.amount_eaten } : food
        ));
        
        await editUserFood(idDoc_user_food, data);
        console.log('Meal edited in Firestore successfully');
        
    } catch (err) {
        console.error('Error editing meal:', err.message);

        fetchFoods(date);
    }
};
useEffect(() => {
    if(newFood){
        setLoading(true)
        newFood && addNewFood(newFood).then(() => {
            setNewFood(null);
            fetchFoods()
        })
        setLoading(false)
    }
}, [newFood]);

    const fetchData = async() => {
        !user && getUserData()
    };

    useEffect(()=>{
        setLoading(true)

        if(user_id){
            user ? fetchFoods(date) : fetchData().then(()=> fetchFoods(date));
            categories && fetchCategories();
            setLoading(false)
        }
        
    },[date, user_id])


    const selectDate=(date)=>{
        setDate(new Date(date))
    }

    const formatNumber = (num) => {
        if (num >= 1_000_000) {
          return `${(num / 1_000_000).toFixed(1)}M`; 
        } else if (num >= 1_000) {
          return `${(num / 1_000).toFixed(1)}K`; 
        }
        return num; 
    };

    return (
        <div className="h-screen w-full overflow-y-hidden">
            <NavBar />
            {loading ? <Loading />
            :
            <div className="flex flex-col lg:flex-row justify-between items-center w-full h-full lg:h-screen overflow-y-scroll md:overflow-y-hidden">
                <div className="w-11/12 lg:w-9/12 sm:h-screen lg:h-full pt-8 sm:pt-24 flex flex-col sm:flex-row justify-start items-start px-1 sm:px-4 lg:px-8 pb-8 xs:pb-0">
                    <div className="w-full sm:w-1/4 pb-4 sm:pb-12  flex flex-col h-full justify-start sm:justify-between items-center">
                        <div className="flex flex-col justify-center items-center md:items-start w-4/5  sm:w-full " >
                            <Calendar value={date} onChange={e => selectDate(e)} />
                            <Filter categories={categories} filterSelected={filterSelected} setFilterSelected={setFilterSelected} />
                        </div>
                        <div className="flex  flex-col w-full justify-center items-center sm:items-between py-3">
                            <div className="w-full max-w-48 py-1 px-3 flex items-center justify-between rounded-full text-white bg-healthyOrange  ">
                                <FontAwesomeIcon className="cursor-pointer px-1" icon={faAngleLeft} onClick={()=>index===1 ? setIndex(goalName.length) : setIndex(index-1) } />
                                <p className="text-white font-semibold px-2">{goalName.find((item)=>item.id===index).name.charAt(0).toUpperCase() + goalName.find((item)=>item.id===index).name.slice(1)}</p>
                                <FontAwesomeIcon className="cursor-pointer px-1" icon={faAngleRight} onClick={()=>index===goalName.length ? setIndex(1) : setIndex(index+1) }/>
                            </div>
                            <div className="flex relative w-full justify-center items-center my-2">
                                {user && <PieChart
                                    series={[
                                        {
                                            data:[
                                                {value:goalConsumed},
                                                {value: user.goals[(goalName.find(goal=>goal.id===index)).name]-goalConsumed}
                                            ],
                                            innerRadius: 50,
                                            outerRadius: 70,
                                        }
                                        
                                    ]}
                                    colors={['#FA9B6A','#c3c3c3']}
                                    width={5}
                                    height={150}
                                    slotProps={{
                                        legend: { hidden: true },
                                    }}
                                />}
                                {user && <div className={`font-quicksand text center flex flex-col absolute  text center justify-center items-center ${goalConsumed> user.goals[(goalName.find(goal=>goal.id===index)).name] ? ' rounded-full sm:rounded-2xl bg-healthyOrange text-white shadow-md py-2 px-4 sm:px-2 md:px-1 ':'w-full text-healthyOrange h-full'}  `}>
                                    {goalConsumed<=user.goals[(goalName.find(goal=>goal.id===index)).name] && <p className="font-bold text-xl  text-center">{user.goals[(goalName.find(goal=>goal.id===index)).name] && ((goalConsumed*100)/(user.goals[(goalName.find(goal=>goal.id===index)).name])).toFixed(1)}%</p>}
                                    {goalConsumed>user.goals[(goalName.find(goal=>goal.id===index)).name] && <p className="text-xs font-bold text-center w-full pb-2 pl-2 ">You've already passed your&nbsp;goal!</p>}
                                    <p className="text-center text-xs font-bold ">{goalConsumed<=user.goals[(goalName.find(goal=>goal.id===index)).name] ? 'completed' : `${formatNumber(goalConsumed)} / ${formatNumber(user.goals[(goalName.find(goal=>goal.id===index)).name])}`}</p>
                                </div>}
                                
                            </div>
                            {streak>0 && <StreakCounter streakDays={streak} />}
                        </div>
                        <Calories userFood={userFood} />
                    </div>
                    <div className="w-full sm:w-3/4 flex flex-col items-center justify-start pl-0 sm:pl-12 h-full mb-36 sm:mb-12 ">
                        <div className="flex flex-col w-full overflow-y-auto ">
                            {filteredFood.map((usfood) => (
                                <FoodConsumed
                                    key={usfood.id}
                                    usfood={usfood}
                                    handleDeleteMeal={handleDeleteMeal}
                                    handleEditFoodConsumed={handleEditFoodConsumed}
                                    drink={drinksData.find(item=>item.id===usfood.id_Food)}
                                />
                            ))}
                            
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 flex items-center justify-center gap-4 p-4">

                    <div
                    onClick={() => setShowDailyMenu(true)}
                    className="hover:cursor-pointer flex items-center group transition-all duration-200 ease-in-out transform hover:scale-105"
                    role="button"
                    tabIndex={0} 
                    aria-label="Open Daily Menu" 
                    onKeyDown={(e) => e.key === 'Enter' && setShowDailyMenu(true)} 
                    >
                    <div className="flex items-center text-white bg-healthyOrange hover:from-orange-600 hover:to-orange-700 rounded-full px-5 py-3 shadow-xl hover:shadow-2xl group-hover:shadow-2xl transition-shadow">
                        <FontAwesomeIcon icon={faUtensils} className="text-white text-lg mr-3" />
                        <p className="font-semibold text-sm md:text-base">Daily Menu</p>
                    </div>
                    </div>

                    <div
                        onClick={() => setAddMeal(true)}
                        className="hover:cursor-pointer flex items-center group transition-all duration-200 ease-in-out transform hover:scale-105"
                        role="button" 
                        tabIndex={0} 
                        aria-label="Add Meal" 
                        onKeyDown={(e) => e.key === 'Enter' && setAddMeal(true)} 
                    >
                        <div className="flex items-center text-white bg-healthyGreen hover:from-green-600 hover:to-green-700 rounded-full px-5 py-3 shadow-xl hover:shadow-2xl group-hover:shadow-2xl transition-shadow">
                        <FontAwesomeIcon icon={faPlus} className="text-white text-lg mr-3" />
                        <p className="font-semibold text-sm md:text-base">Log Food</p>
                        </div>
                    </div>

                    </div>

                </div>
                
                {(window.innerWidth >= '1024') && (
                    <div className="w-full lg:w-3/12 lg:h-screen flex justify-start">
                        <img src={bgImage} alt='Bakground image' className="w-full h-full object-cover" />
                    </div>
                )}
            </div>}
            {addMeal &&
                <PopUp user={user}  newFood={newFood} setAddMeal={setAddMeal} foodData={foodData} handleAddMeal={handleAddMeal} setNewFood={setNewFood} setSelection={setSelection} selection={selection} platesData={platesData} drinksData={drinksData} />
            }
            {showDailyMenu && (
                <DailyMenu  setAddMeal={setShowDailyMenu} handleAddMeal={handleAddMeal} selection={selection} setSelection={setSelection}currentDate={date} allFoods={foodData} allPlates={platesData} allDrinks={drinksData }foodconsumed={filteredFood}
                />
            )}
            {askForGoals && user && (
                <Goals user={user} setUser={setUser} editGoals={updateUserGoals} />
            )}

        </div>
        
    );
}

export default Home;