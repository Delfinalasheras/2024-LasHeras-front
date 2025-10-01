import React, { createContext, useEffect, useState } from "react";
import NavBar from '../../components/NavBar'
import categoryImg from '../../assets/categoryBg.jpg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faIceCream, faTrash, faPen, faPlus} from '@fortawesome/free-solid-svg-icons'; 
import CategoryItem from './components/CategoryItem';
import NewCategory from './components/NewCategory';
import { fetchAllFoods, getCategories, getProducts, getPublicPlates, getUserDrinks,getUserPlates} from "../../firebaseService";
import PopUpCat from "./components/PopUpCat";
import { auth } from "../../firebaseConfig";
import Loading from "../../components/Loading";

function Category() {
    const [foodData, setFoodData] = useState([])
    const [addFood, setAddFood]=useState(false)
    const [newFood, setNewFood] = useState();
    const [selection, setSelection] = useState([]);
    const [addCategory, setAddCategory]=useState(false)
    const [categories, setCategories]=useState([])
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        setLoading(true)
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const cats = await getCategories();
                    setCategories(cats);
                } catch (err) {
                    console.log('Error al obtener las categorias: ' + err);
                }
            }else{
                console.log('No user is signed in');
            }
            setLoading(false);
        })
        return () => unsubscribe();
    };

    const fetchFoods =async()=>{ 
        setLoading(true)
        try{
            const food = await fetchAllFoods()
            const barFood=await getProducts()
            const drinks = await getUserDrinks()
            const plates = await getUserPlates()
            const publicPlates= await getPublicPlates()
            const combinedFoodData = [
                ...food, 
                ...barFood.map((item) => ({ ...item, bar: true })),
                ...drinks.map((item) => ({ ...item, drink: true })),
                ...plates.map((item) => ({ ...item, plate: true, private:true })),
                ...publicPlates.filter(item=>!(plates.map(e=>e.id)).includes(item.id)).map((item) => ({ ...item, plate: true, private:false }))
            ];
    
            setFoodData(combinedFoodData)
            combinedFoodData && setLoading(false)
        }catch(error){
            console.log("Error fetching foods in Category page: ", error)
        }
    }

    useEffect(()=>{
        fetchCategories ();
        fetchFoods();
    },[])

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
            <div className='w-1/4 lg:w-1/3 overflow-hidden  h-screen  flex items-center justify-start'>
                <img src={categoryImg} alt="Category image background"  className=' w-full h-full object-cover'/>
            </div>
            }
            <div className=' w-full md:w-3/4 lg:w-2/3 bg-white flex flex-col items-start justify-start mt-0 sm:mt-16 p-2 sm:p-6 '>
                <h2 className='font-belleza bg-white w-full text-2xl  text-left text-healthyDarkOrange '>Categories</h2>
                <div className='flex flex-col-reverse sm:flex-row justify-center sm:justify-between items-center sm:items-start mt-6 w-full'>
                    <div className='flex flex-col w-full sm:w-2/3 justify-start items-start '>

                        {categories.map((item, index)=>(<CategoryItem key={index} handleUpdate={handleUpdate} category={item}  setAddFood={setAddFood} food={foodData} selection={selection} />) )}
                    </div>
                    <div className=' w-full  mb-3 sm:mb-0 sm:w-1/3 flex flex-col mx-4 bg-white py-3 sm:py-0 '>
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