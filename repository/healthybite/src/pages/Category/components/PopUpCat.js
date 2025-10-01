import React, { useEffect, useState }  from 'react'
import Search from '../../Home/components/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSquareCheck, faSquare} from '@fortawesome/free-solid-svg-icons'; 
import NewFood from '../../Home/components/NewFood';

export default function PopUpCat({category,foodData, setAddFood, setSelection, fetchFoods}) {

    const [searchFood, setSearchFood] = useState(foodData);
    const [selectedFoods, setSelectedFoods] = useState(category.foods)
    const [message, setMessage]=useState('')
    const [newFood, setNewFood]=useState(null)
    const [createFood, setCreateFood]=useState(false)

    const handleFoodSelection = (food) => {
        if (selectedFoods.includes(food.id)) {
            setSelectedFoods(prev => prev.filter(item => item !== food.id)); 
            
        } else {
            setSelectedFoods(prev => [...prev, food.id]); 
        }
    };

    const handleAddFood= ()=>{
        const foodSelected=foodData.filter((item)=>selectedFoods.includes(item.id))
        if(foodSelected.length>0){
            setSelection({food:foodSelected, category:category.id})
            setAddFood(false)
            setMessage('')
        }else{
            setMessage('Please select at least one item')
        }
        
    }


    useEffect(()=>{
        createFood && setSelectedFoods(searchFood.unshift(createFood))
        setCreateFood(false)
    },[createFood])


  return (
    <div className='w-full z-40 h-screen absolute z-15 bg-black/60 top-0 flex items-center justify-center overflow-y-hidden'>
        <div className='flex flex-col w-10/12 sm:w-2/3 md:w-1/2 h-4/5 sm:h-2/3 overflow-y-scroll px-2 pb-2 bg-healthyDarkGreen rounded-xl font-quicksand'>
            <div className='sticky top-0 bg-healthyDarkGreen'>
            {message && 
            <div className='flex w-full justify-center items-center pt-2 '>
                <p className='bg-white/80 text-healthyDarkGreen font-bold text-sm  py-1 px-3 rounded-xl'>{message}</p>
            </div>
            }
            <div className='flex w-full justify-around items-center'>
                <button onClick={handleAddFood} className='bg-healthyGreen py-1 my-2  px-3 rounded-md text-white font-semibold font-quicksand text-center w-1/2 ' >Add food</button>
                <button onClick={()=>setAddFood(null)} className='bg-healthyOrange py-1 my-2  px-3 rounded-md text-white font-semibold font-quicksand text-center w-1/2 ml-2 '>Cancel</button>
            </div>
            <div className="flex flex-row w-full justify-center  z-5 bg-healthyDarkGreen py-2">
                <Search foodData={foodData} setSearchFood={setSearchFood} />
            </div>
            </div>
            {createFood ?
            <NewFood setAddFood={setNewFood} setNewFood={setCreateFood}/> 
            :
            <div className='flex flex-col justify-center w-full bg-white rounded-md my-3  '>
                {searchFood.map((food, index)=>(
                    <div key={index} className='flex  font-quicksand font-semibold flex-row justify-start items-center w-full px-2 my-1'>
                        <FontAwesomeIcon className='text-healthyDarkGreen text-xl bg-white ' icon={selectedFoods.includes(food.id) ? faSquareCheck : faSquare } onClick={()=>handleFoodSelection(food)} value={food.id}/>
                        <p className='ml-2  text-md  text-healthyDarkGreen'>{food.name}</p>
                    </div>
                ))}
            </div>}
        </div>
    </div>
  )
}