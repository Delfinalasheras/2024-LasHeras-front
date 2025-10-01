import React, { useEffect, useState } from 'react'
import NavBar from '../../components/NavBar'
import Loading from '../../components/Loading'
import bgDrinks from '../../assets/bgDrinks.jpg'
import emptyDrink from '../../assets/emptyGlass.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { NewDrink } from './components/NewDrink'
import DrinkItem from './components/DrinkItem'
import {fechDrinkTypes, getUserDrinks,getUserNotification,markNotificationAsRead} from '../../firebaseService'
import { drinkAchievments } from '../../components/AchivementsValidation'
import NotificationPopup from '../../components/NotificationPopup';

const drinks=[
    {
        name:'Fernet',
        type:'Alcohol',
        sugar:200,
        caffeine:300,
        calories:400
    }
]



export const Drinks = () => {
    const [loading, setLoading] = useState(true);
    const [drinksData, setDrinksData]=useState([])
    const [newDrink,setNewDrink]=useState(false)
    const [drinktypes, setDrinktypes] = useState([]);
    const [notifications, setNotifications] = useState([]);


    const fetchUserDrinks= async () => {
        const drinks = await getUserDrinks();
        const fetchedNotifications = await getUserNotification();
        setNotifications(fetchedNotifications || []);
        console.log(fetchedNotifications);
        drinkAchievments(drinks.length)

        setDrinksData(drinks);
        setLoading(false);
        return drinks
    }
    const fetchUserNotifications=async ()=>{
        const fetchedNotifications = await getUserNotification();
        setNotifications(fetchedNotifications || []);
    }
    const handleDismissNotification = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.filter(notif => notif.id !== notificationId));
        } catch (err) {
            console.error("Error dismissing notification:", err);
        }
    };

    const fetchUserDrinkTypes = async () => {
        const types = await fechDrinkTypes();
        fetchUserDrinks();
        setDrinktypes(types);
        return types
    };
    const handleUpdate=()=>{
        setLoading(true)
        const drink=fetchUserDrinks()
        fetchUserNotifications(); 
        drinkAchievments(drinks.length)

        drink && setLoading(false)

    }
    const handleDrinkTypeUpdate =()=>{
        setLoading(true)
        const types=fetchUserDrinkTypes()
        types && setLoading(false)
    }
    useEffect(()=>{
        fetchUserNotifications()

    },[drinksData])



    useEffect(()=>{
        setLoading(true)
        fetchUserDrinkTypes();
        fetchUserNotifications();
    },[])

    return (
    <div className="h-screen w-full overflow-y-hidden">
        <NavBar />
        {loading ? <Loading />
        :
        <div className='mt-6 sm:mt-12 lg:mt-16 flex w-full justify-center sm:justify-start h-screen '>
            {window.innerWidth>'640' &&
            <div className='w-1/3 lg:w-2/6 flex items-start h-screen justify-center  '>
                <img src={bgDrinks} alt='Background image' className='object-cover w-full h-full'/>
            </div>}
            <div className='w-11/12 sm:w-2/3 lg:w-4/6 flex flex-col  sm:h-full pt-8 px-5 lg:p-8  '>
                <h1 className='text-3xl text-healthyDarkGreen font-belleza '>My own drinks</h1>
                <div className='w-full flex flex-col-reverse lg:flex-row justify-between items-center  lg:items-start mt-5 lg:h-full'>
                    {drinksData && drinksData.length >0 ?
                    <div className='w-full  lg:w-2/3 lg:mr-5 lg:pr-3  flex flex-col items-start lg:h-[600px]  lg:overflow-y-auto '>
                        {drinksData.map((item)=>
                                <DrinkItem drink={item} typeOfDrinks={drinktypes} handleUpdate={handleUpdate}/>
                        )}
                    </div>
                    :<div className='flex justify-center items-center flex-col w-2/3 h-2/3 mt-8 lg:mt-0'>
                        <img className='w-2/12 opacity-30' src={emptyDrink} alt='Empty glass'/>
                        <p className='font-quicksand font-bold text-sm mt-3 text-healthyGray1 text-center w-3/4'>There are no drinks&nbsp;created</p>
                    </div>}
                    <div className='w-full md:w-4/5 lg:w-1/3 flex flex-col justify-center'>
                        <button onClick={()=>setNewDrink(!newDrink)} className={`text-white text-md font-bold px-4 py-1 ${ newDrink ? 'rounded-t-lg' :'rounded-lg'} bg-healthyGray1 hover:bg-healthyDarkGray1 w-full `}><FontAwesomeIcon icon={faPlus} className='mr-2 '/>New drink</button>
                        {newDrink && <NewDrink setNewDrink={setNewDrink} handleUpdate={handleUpdate} drinktypes={drinktypes} handleDrinkTypeUpdate={handleDrinkTypeUpdate} setDrinksData={setDrinksData}/>}
                    </div>
                </div>
                {notifications.length > 0 && (
                        <NotificationPopup
                            notifications={notifications}
                            onDismiss={handleDismissNotification}
                        />
                    )}
            </div>
        </div>}
        
    </div>
    )
}
