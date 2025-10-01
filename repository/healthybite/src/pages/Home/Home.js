import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft, faAngleRight, faPlus } from '@fortawesome/free-solid-svg-icons'; 
import bgImage from '../../assets/imgHome.jpg'
import Calendar from "../../components/Calendar";
import NavBar from "../../components/NavBar";
import Calories from "./components/Calories";
import FoodConsumed from "./components/FoodConsumed";
import PopUp from "./components/PopUp";
import { addGoal,getstreak,addNewFood,getPlatesNotUser, addUserFood, fetchAllFoods, fetchUserFoods, deleteUserFood , fetchFoodByID, editUserFood, getCategories, getDefaultCategories,getProdByID, getProducts,getBarCategory,updateCategoryDefault, getUserDrinks,getUserPlates, getDrinkByID, getPlate_ByID, getGroupedDrinkTypes, getPublicPlates, fetchUser, editUserData} from "../../firebaseService";
import Filter from "./components/Filter";
import StreakCounter from "./components/StreakCounter";
import Loading from "../../components/Loading";
import Data from "../Data";
import { CircularProgressbar } from 'react-circular-progressbar';
import { PieChart } from "@mui/x-charts";
import Goals from "../../components/Goals";

function Home() {
    const [foodData, setFoodData] = useState([]); // datos de tabla Food
    const [platesData, setPlatesData] = useState([]); // datos de tabla Plates
    const [drinksData, setDrinksData] = useState([]); // datos de tabla Drinks
    const [userFood, setUserFood] = useState([]); // datos de tabla UserFood
    const [date, setDate] = useState(new Date());
    const [amount, setAmount] = useState();
    const [selection, setSelection] = useState();
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
                const streakValue = await getstreak();
                setStreak(streakValue);
                if (streakValue>3){
                    addGoal(1)
                }
                else if (streakValue>=10){
                    addGoal(2)
                }
            } catch (error) {
                console.error("Error fetching streak:", error);
            }
        };

        fetchStreak();
    }, [userFood]);


    useEffect(()=>{
        if(filterSelected) {
            const aplyingFilter=filteredFood.filter((item)=>filterSelected.foods.includes(item.id_Food))
            setFilteredFood(aplyingFilter)
        }else{
            setFilteredFood(userFood)
        }
    },[filterSelected])

    const getUserData = async()=> {
        setLoading(true)
        const userInfo = await fetchUser()
        const { email, ...filteredUserData } = userInfo;
        setUser(filteredUserData)
        const privatePlates = await  getUserPlates()
        const otherPlates=await getPlatesNotUser() 
        const plates={mines: privatePlates, others:otherPlates}
        setPlatesData(plates)
        const drinks=await getUserDrinks()
        setDrinksData (drinks)
        setLoading(false);

    }
    
    const handleChangesCat = async () => {
        try {
            // Get the foods and bar category
            const barFoods = await getProducts(); // Assuming this returns a list of foods
            const BarCat = await getBarCategory(); // Assuming this returns a category object
            
            if (!BarCat) {
                throw new Error('Bar category not found');
            }
    
            // Filter barFoods to include only the items that are not in BarCat.foods
            const filteredFoods = barFoods.filter(food => !BarCat.foods.includes(food.id)); // Assuming food.id is the unique identifier
    
            // Prepare the data for the update
            const data = {
                name: BarCat.name,
                id_User: 'default', 
                icon: BarCat.icon, // Fixed this to use BarCat.icon (instead of BarCat.name for both)
                foods: [...BarCat.foods, ...filteredFoods.map(food => food.id)] // Combine existing foods and new filtered foods
            };

            await updateCategoryDefault(data, BarCat.id);    
            console.log("Category updated successfully");
        } catch (error) {
            console.error("Error saving category changes by ID:", error);
        }
    };
    

    const fetchFoods = async () => {
        const loadData = async () => {
            try {
                // Validate the 'date' before using it
                if (isNaN(new Date(date).getTime())) {
                    throw new Error('Invalid date value');
                }
    
                console.log('Fetching user food for date:', date);
                const userFood = await fetchUserFoods(date);
                console.log('User food fetched:', userFood);
    
                const food = await fetchAllFoods();
                console.log('All foods fetched:', food);
    
                setFoodData(
                    food.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1)
                );
    
                const userFoodDetails = await Promise.all(userFood.map(async (item) => {
                    let foodDetails = await fetchFoodByID(item.id_Food);
                console.log("Fetched foodDetails:", foodDetails);

            if (!foodDetails || Object.keys(foodDetails).length === 0) {
                console.log('No food found in food table, checking plates');
                foodDetails = await getPlate_ByID(item.id_Food);
                console.log("Fetched plate details:", foodDetails);

                if (!foodDetails) {
                    console.log('No food found in plate, checking drinks');
                    foodDetails = await getDrinkByID(item.id_Food);

                    if (!foodDetails) {
                        console.log('No food found in drinks, checking products');
                        foodDetails = await getProdByID(item.id_Food);
                    }
                }
            }
    
                    const calories = foodDetails?.calories_portion !== undefined 
                        ? Math.round(foodDetails?.calories_portion) 
                        : Math.round(foodDetails?.calories || 0);
    
                    return {
                        ...item,
                        name: foodDetails?.name || 'Unknown',
                        measure: foodDetails?.measure || 'Plate/s',
                        measure_portion: foodDetails?.measure_portion || 1,
                        calories_portion: calories,
                        carbohydrates_portion: foodDetails?.carbohydrates_portion || 0,
                        sodium_portion: foodDetails?.sodium_portion || 0,
                        fats_portion: foodDetails?.fats_portion || 0,
                        protein_portion: foodDetails?.protein_portion || 0,
                        caffeine_portion: foodDetails?.caffeine_portion || 0,
                        sugar_portion: foodDetails?.sugar_portion || 0,
                        public: foodDetails?.public || false,
                        verified: foodDetails?.verified || false
                    };
                }));
    
                console.log('User food details:', userFoodDetails);
    
                // Check if required data is defined before setting state
                if (userFood && platesData && drinksData && categories) {
                    setLoading(false);
                } else {
                    console.warn("Some required data is missing:", { userFood, platesData, drinksData, categories });
                }
    
                // Set user food with the resolved details
                setUserFood(userFoodDetails);
                setFilteredFood(userFoodDetails);
    
            } catch (err) {
                console.error('Error fetching data:', err.message);
            }
        };
    
        loadData();
    };
    
    


    const fetchCategories = async () => {
        try {
            const cats = await getCategories();
            const defaultCats= await getDefaultCategories();
            const drinkCats = await getGroupedDrinkTypes();
            await handleChangesCat()
            const combinedCats = [
                ...cats, 
                ...defaultCats,
                ...drinkCats
            ];
            setCategories(combinedCats);
            userFood && categories && platesData && drinksData && setLoading(false)
        } catch (err) {
            console.log('Error al obtener las categorias: ' + err);
        }
    };

    useEffect(()=>{
        const updateGoals= async()=>{
            
            await editUserData(user)}
        updateGoals()
    },[user])
    

    useEffect(()=>{
        setLoading(true)
        fetchFoods();
        fetchCategories();
    },[date])

    useEffect(() => {
        const fetchData = async () => {
            await getUserData();
        };
    
        fetchData();
    }, []);

    const handleAddMeal = async () => {
        try {
            await addUserFood(selection, date, amount);
            setAmount(null);
            setSelection(null);
            setAddMeal(false);
            console.log('Comida consumida agregada a UserFood > Firestore con éxito');
            setLoading(true)
            fetchFoods()
        } catch (error) {
            console.error('Error al agregar la comida consumida en UserFood > Firestore:', error);
        }
    }

    useEffect(() => {
        newFood && addNewFood(newFood).then(() => {
            setNewFood(null);
            setLoading(true)
            fetchFoods();
        })
        
    }, [newFood]);
    
    const handleDeleteMeal = async (idDoc_user_food) => {
        try {
            await deleteUserFood(idDoc_user_food); // Delete from Firebase backend
            
            // Update the local state for both userFood and filteredFood
            setUserFood((prevUserFood) => prevUserFood.filter((food) => food.id !== idDoc_user_food)); 
            setFilteredFood((prevFilteredFood) => prevFilteredFood.filter((food) => food.id !== idDoc_user_food));
            
            console.log('Comida eliminada de UserFood > Firestore con éxito');
        } catch (err) {
            console.log('Error al eliminar la comida: ' + err.message);
        }
    };
    

    const handleEditFoodConsumed = async  (idDoc_user_food, data) => {
        try {
            await editUserFood(idDoc_user_food, data); 
            fetchFoods()
            console.log('Comida editada de UserFood > Firestore con éxito');
        } catch (err) {
            console.log('Error al editar la comida: ' + err.message);
        }
    };

    const selectDate=(date)=>{
        setLoading(true)
        fetchFoods()
        setDate(new Date(date))
    }

    return (
        <div className="h-screen w-full overflow-y-hidden">
            <NavBar />
            {loading ? <Loading />
            :
            <div className="flex flex-col lg:flex-row justify-between items-center w-full h-full lg:h-screen overflow-y-scroll md:overflow-y-hidden">
                <div className="w-11/12 lg:w-9/12 sm:h-screen lg:h-full pt-8 sm:pt-24 flex flex-col sm:flex-row justify-start items-start px-1 sm:px-4 lg:px-8 pb-32 xs:pb-0">
                    <div className="w-full sm:w-1/4 pb-4 sm:pb-12 flex flex-col h-full justify-start sm:justify-between items-center">
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
                            <PieChart
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
                            />
                            <div className={`font-quicksand text center flex flex-col absolute  text center justify-center items-center ${goalConsumed> user.goals[(goalName.find(goal=>goal.id===index)).name] ? ' rounded-full sm:rounded-2xl bg-healthyOrange text-white shadow-md py-2 px-4 sm:px-2 md:px-1 ':'w-full text-healthyOrange h-full'}  `}>
                                {goalConsumed<=user.goals[(goalName.find(goal=>goal.id===index)).name] && <p className="font-bold text-xl  text-center">{((goalConsumed*100)/(user.goals[(goalName.find(goal=>goal.id===index)).name])).toFixed(1)}%</p>}
                                {goalConsumed>user.goals[(goalName.find(goal=>goal.id===index)).name] && <p className="text-xs font-bold text-center w-full pb-2 pl-2 ">You've already passed your&nbsp;goal!</p>}
                                <p className="text-center text-xs font-bold ">{goalConsumed<=user.goals[(goalName.find(goal=>goal.id===index)).name] ? 'completed' : `${goalConsumed}/${user.goals[(goalName.find(goal=>goal.id===index)).name]}`}</p>
                            </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-center my-4">
                            <StreakCounter streakDays={streak} />
                            </div>
                        <Calories userFood={userFood} />
                    </div>
                    <div className="w-full sm:w-3/4 flex flex-col items-center justify-start pl-0 sm:pl-12 ">
                        <div className="flex flex-col w-full ">
                            {filteredFood.map((usfood) => (
                                <FoodConsumed
                                    key={usfood.id}
                                    usfood={usfood}
                                    handleDeleteMeal={handleDeleteMeal} // Pass the delete function here
                                    handleEditFoodConsumed={handleEditFoodConsumed}
                                />
                            ))}
                            
                        </div>
                    </div>
                    <div className="absolute bottom-0  right-0 flex  items-center justify-center ">
                        <div onClick={() => setAddMeal(true)} className="  hover:cursor-pointer bg-white rounded-tl-full p-3 flex justify-center items-center">
                            <FontAwesomeIcon icon={faPlus} className="text-white text-xl xs:text-2xl bg-healthyGreen hover:bg-healthyDarkGreen rounded-full p-3 xs:p-5  shadow-lg ml-3 xs:ml-4 mt-4 xs:mt-6 " />
                        </div>
                    </div>
                </div>
                
                {(window.innerWidth > '1024') && (
                    <div className="w-full lg:w-4/12 lg:h-screen flex justify-start">
                        <img src={bgImage} alt='Bakground image' className="w-full h-full object-cover" />
                    </div>
                )}
            </div>}
            {addMeal &&
                <PopUp newFood={newFood} setAddMeal={setAddMeal} foodData={foodData} handleAddMeal={handleAddMeal} setNewFood={setNewFood} setSelection={setSelection} selection={selection} platesData={platesData} drinksData={drinksData} />
            }
            {user && user.goals && Object.values(user.goals).some(goal => Number(goal) === 0) && <Goals user={user} setUser={setUser}/> }
        </div>
        
    );
}

export default Home;

