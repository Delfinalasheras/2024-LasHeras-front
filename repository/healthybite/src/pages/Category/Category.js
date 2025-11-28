import React, { createContext, useContext, useEffect, useState } from "react";
import NavBar from '../../components/NavBar'
import categoryImg from '../../assets/categoryBg.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIceCream, faTrash, faPen, faPlus} from '@fortawesome/free-solid-svg-icons'; 
import CategoryItem from './components/CategoryItem';
import NewCategory from './components/NewCategory';
import { fetchAllFoods, getCategories, getPlatesNotUser, getProducts, getPublicPlates, getUserDrinks,getUserPlates} from "../../firebaseService";
import PopUpCat from "./components/PopUpCat";
import { auth } from "../../firebaseConfig";
import Loading from "../../components/Loading";
import { UserContext } from "../../App";
import { useAuthState } from "react-firebase-hooks/auth";
import emptyBox from '../../assets/emptyBox.png'

function Category() {
    const [foodData, setFoodData] = useState([])
    const [addFood, setAddFood]=useState(false)
    const [newFood, setNewFood] = useState();
    const [selection, setSelection] = useState([]);
    const [addCategory, setAddCategory]=useState(false)
    const [categories, setCategories]=useState([])
    const [loading, setLoading] = useState(true);
    const {user_id,setUser_id}=useContext(UserContext)

    const fetchCategories = async () => {
        setLoading(true)
        if (user_id) {
            try {
                const cats = await getCategories(user_id);
                setCategories(cats);
            } catch (err) {
                console.log('Error al obtener las categorias: ' + err);
            }
        }else{
            console.log('No user is signed in');
        }
        setLoading(false);
        
    };

    const fetchFoods =async()=>{ 
        try{
            
            if(user_id){
                setLoading(true)
                const [food, barFood, privatePlates, publicPlates, drinks] = await Promise.all([
                    fetchAllFoods(),
                    getProducts(),
                    getUserPlates(user_id),
                    getPlatesNotUser(user_id),
                    getUserDrinks(user_id)
                ]);
                const combinedFoodData = [
                    ...food, 
                    ...barFood.map((item) => ({ ...item, bar: true })),
                    ...drinks.map((item) => ({ ...item, drink: true })),
                    ...privatePlates.map((item) => ({ ...item, plate: true, private:true })),
                    ...publicPlates.filter(item=>!(privatePlates.map(e=>e.id)).includes(item.id)).map((item) => ({ ...item, plate: true, private:false }))
                ];
                setFoodData(combinedFoodData)
                combinedFoodData && setLoading(false)
            }
        }catch(error){
            console.log("Error fetching foods in Category page: ", error)
        }
    }

    useEffect(()=>{
        if(user_id){
            categories && fetchCategories ();
            foodData && fetchFoods();
        }
    },[user_id])

    const handleUpdate=()=>{
        fetchCategories()
    }


  return (
    <>
    <div className={`h-screen w-full overflow-y-hidden`}>
        <NavBar/>
        {loading ?
            <Loading />
        :<div className='w-full flex flex-row items-start justify-between h-screen overflow-y-auto md:overflow-y-hidden'>
            {window.innerWidth > 768  && 
            <div className='w-1/4  overflow-hidden  h-screen  flex items-center justify-start'>
                <img src={categoryImg} alt="Category image background"  className=' w-full h-full object-cover'/>
            </div>
            }
            <div className=' w-full md:w-3/4  flex flex-col items-start justify-start mt-0 sm:mt-16 lg:mt-20 p-2 sm:p-6 mb-8 h-full overflow-y-auto'>
                <h2 className='font-belleza bg-white w-full text-2xl  text-left text-healthyDarkOrange '>Categories</h2>
                <div className='flex flex-col-reverse  sm:flex-row justify-center sm:justify-between items-center sm:items-start mt-6 w-full mb-12 '>
                    <div className='flex flex-col w-full sm:w-2/3  lg:w-3/5 justify-start items-start mb-8 '>
                        {categories.length>0 ?
                        categories.map((item, index)=>(<CategoryItem key={index} handleUpdate={handleUpdate} category={item}  setAddFood={setAddFood} food={foodData} selection={selection} />) )
                        :
                        <div className="flex items-center justify-center h-full flex-col py-6 ">
                            <div className="flex items-center justify-center w-1/2">
                                <img src={emptyBox} alt="Categories empty" className="w-full object-cover opacity-40" />
                            </div>
                            <p className="w-2/3 font-bold font-quicksand text-healthyGray1 text-lg py-4 text-center">You do not have categories created&nbsp;yet</p>
                        </div>
                        }
                    </div>
                    <div className=' w-full  mb-3 sm:mb-0 sm:w-1/3 lg:w-2/5 flex flex-col mx-4 bg-white py-3 sm:py-0 '>
                        <div onClick={()=>setAddCategory(!addCategory)} className='flex  items-center justify-center font-quicksand rounded-md border-2 border-healthyGreen shadow-sm p-1 lg:p-2 hover:cursor-pointer '>
                            <FontAwesomeIcon icon={faPlus} className='text-xl text-healthyGreen mr-2'/>
                            <p className='font-quicksand  text-md lg:text-lg text-healthyGreen  font-semibold'>Add cattegory</p>
                        </div>
                        {addCategory && <NewCategory foods={foodData} handleUpdate={handleUpdate} setAddCategory={setAddCategory} setAddFood={setAddFood}/>}
                    </div>
                </div>
            </div>
        </div>}
    </div>
    {addFood &&
        <PopUpCat category={addFood} foodData={foodData} setAddFood={setAddFood} setSelection={setSelection} fetchFoods={fetchFoods}/>
    }</>
  )
}

export default Category