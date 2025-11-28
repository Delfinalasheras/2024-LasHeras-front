import React, { useEffect, useRef, useState } from 'react';
import FoodItem from './FoodItem';
import {createplate,createReview, fetchUser} from '../../../firebaseService'
import { uploadImageToStorage, } from "../../../firebaseConfig";
import { faEye, faEyeSlash, faImage, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Visibility } from './Visibility';
import { plateAchivements } from '../../../components/AchivementsValidation'
import { handleTextInputChange } from '../../inputValidation';


const NewPlate = ({ foodData, setPlates, plates }) => {
  const [plateName, setPlateName] = useState('');
  const [search, setSearch]=useState('')
  const [foods, setFoods]=useState(foodData)
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [message, setMessage] = useState(''); // State for success message
  const [reset, setReset] = useState(false); // State to trigger reset in FoodItem
  const [plateFoodIds, setPlateFoodIds] = useState([]); // State for storing plate food IDs
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const [publicPlate, setPublicPlate]=useState(false)
  const [timeDay, setTimeDay] = useState([]); // NUEVO: Estado para time of day
  const [nameError, setNameError] = useState('');

  // Function to handle adding/removing food items
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // NUEVO: Función para toggle time of day
  const toggleTimeDay = (value) => {
    setTimeDay(prev => {
      if (prev.includes(value)) {
        return prev.filter(v => v !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  useEffect(()=>{
    if(search===''){
      const showFood=selectedFoods.concat(foodData.filter(item=>!(selectedFoods.map(e=>e.id)).includes(item.id)))
      setFoods(showFood)
    }else{
      setFoods(foodData.filter((item)=>item.name.toLowerCase().startsWith(search.toLowerCase())))
    }
  },[search])
  
  const handleFoodChange = (food, quantity ) => {
    if (quantity > 0) {
      const updatedFoods = selectedFoods.filter(f => f.id !== food.id);
      setSelectedFoods([...updatedFoods, { ...food, quantity }]);
    } else {
      const updatedFoods = selectedFoods.filter(f => f.id !== food.id);
      setSelectedFoods(updatedFoods);
    }
  };

  // Function to calculate total calories
  const calculateTotalNutrients = () => {
    const totals = selectedFoods.reduce(
      (totals, food) => {
        const quantityFactor = food.quantity / food.measure_portion;
  
        totals.calories += food.calories_portion * quantityFactor;
        totals.sodium += food.sodium_portion * quantityFactor;
        totals.fats += food.fats_portion * quantityFactor;
        totals.carbohydrates += food.carbohydrates_portion * quantityFactor;
        totals.protein += food.protein_portion * quantityFactor;
  
        return totals;
      },
      { calories: 0, sodium: 0, fats: 0, carbohydrates: 0, protein: 0 }
    );
  
    // acá redondeamos
    return {
      calories: Math.round(totals.calories),
      sodium: Math.round(totals.sodium),
      fats: Math.round(totals.fats),
      carbohydrates: Math.round(totals.carbohydrates),
      protein: Math.round(totals.protein)
    };
  };
  
  
const createPlate = async () => {
  if (!plateName) {
    setMessage("The plate name is missing");
    return;
  }
  if (selectedFoods.length === 0) {
    setMessage("Please select the food you want to include");
    return;
  }
  if (timeDay.length === 0) {
    setMessage("Please select at least one meal time");
    return;
  }

  try {
    const user= await fetchUser()
    let imageUrl = "";
    if (image) {
      imageUrl = await uploadImageToStorage(image);
    }
    const totals = calculateTotalNutrients();
    const ingredientsArray = selectedFoods.map((food) => ({
      ingredientId: food.id,
      quantity: food.quantity,
    }));

    const data = {
      name: plateName,
      ingredients: ingredientsArray,
      calories_portion: totals.calories,
      image: imageUrl,
      public: publicPlate,
      sodium_portion: totals.sodium,
      fats_portion: totals.fats,
      carbohydrates_portion: totals.carbohydrates,
      protein_portion: totals.protein,
      verified: user.validation,
      timeday: timeDay, // NUEVO: Incluir timeday en los datos
    };

    // Update the UI without refreshing the page
    const newPlates=plates.concat({ name: plateName, ingredients: ingredientsArray, calories_portion: totals.calories, sodium_portion: totals.sodium, carbohydrates_portion: totals.carbohydrates, protein_portion: totals.protein, fats_portion:  totals.fats, image: imageUrl,public:publicPlate,verified: user.validation, timeday: timeDay  })
    plateAchivements(newPlates.length)
    setPlates(newPlates);

    const plate_id= await createplate(data);
    if(data.public == true){
      await createReviewForPublicPlate(plate_id)
    }


    // Clear form inputs and display success message
    setMessage("Your Plate is created!");
    setPlateName("");
    setPublicPlate(false)
    setSearch('')
    setNameError('');
    setSelectedFoods([]);
    setImage(null); // Clear the selected image
    setTimeDay([]); // NUEVO: Limpiar timeDay
    setReset(true);

    // Reset message after 3 seconds
    setTimeout(() => setMessage(""), 3000);
  } catch (error) {
    console.error("Error creating plate:", error);
    setMessage("An error occurred while creating the plate.");
  }
};
const createReviewForPublicPlate = async (plate_id) => {
  const review = {
      id_plate: plate_id,
      comments: [],
      score: 0
  };
  try {
      // Assume createReviewAPI is the function that saves the review to Firebase
      await createReview(review);
  } catch (error) {
      console.error("Error creating review:", error);
  }
};


const savePlate = async () => {
  await createPlate();
  setReset(true); // Reset the form
};

  
  // Handle reset in FoodItem components by turning reset off after it is triggered
  const handleResetComplete = () => {
    setReset(false);
  };

  const handleIconClick = () => {
    fileInputRef.current.click(); // Abre el selector de archivos
  };

  return (
    <div className="bg-white border-2 flex flex-col justify-start items-center rounded-b-xl border-healthyGreen border-t-none w-full max-h-[300px] md:max-h-[550px] lg:max-h-[400px] overflow-y-auto">
      <div className="flex md:sticky md:top-0 py-2 w-full justify-center items-center text-healthyDarkGreen bg-white">
        <div className='flex w-full items-center justify-around'>
          <input
            className="text-sm font-semibold bg-healthyGray p-1 text-healthyDarkGreen focus:outline-none rounded-lg text-center w-10/12 focus:ring-healthyGreen ml-2"
            type="text"
            placeholder="Plate name"
            value={plateName}
            onChange={(e) => handleTextInputChange(e.target.value, setPlateName, setNameError)}
          />
          <Visibility publicPlate={publicPlate} setPublicPlate={setPublicPlate}/>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleImageChange}
            className='hidden'
          />
          <button onClick={handleIconClick} className='text-healthyGreen hover:text-healthyDarkGreen p-2 shadow-sm'>
            <FontAwesomeIcon icon={faImage} className='text-2xl' /> {/* Cambia el tamaño según tus necesidades */}
          </button>
        </div>
        </div>
      {message && (
        <p className="text-white bg-healthyGreen px-2 py-1 rounded-full text-sm text-center font-semibold mt-2">{message}</p>
      )}
      <div className='flex w-11/12 my-2  rounded-full items-center justify-between py-1 px-2  bg-healthyGray  text-sm '>
        <input onChange={(e)=>setSearch(e.target.value)} type='text' placeholder='Search food...' className='font-quicksand font-semibold px-1 focus:outline-none text-healthyGray1 w-full bg-healthyGray ' />
        <FontAwesomeIcon icon={faMagnifyingGlass} className='text-lg text-healthyGray1 px-1'/>
      </div>
      <div className="font-quicksand text-sm text-healthyGreen px-2 w-full">
        {foods.map((food) => (
          <FoodItem
            key={food.id}
            food={food}
            onFoodAdd={handleFoodChange}
            reset={reset}
            onResetComplete={handleResetComplete}
          />
        ))}
      </div>

      {/* NUEVO: Sección de Time of Day - sticky en la parte inferior */}
      <div className="sticky bottom-0 w-full bg-white border-t-2 border-healthyGreen pt-2 pb-2 px-2">
        <p className='text-healthyDarkGreen font-semibold font-quicksand text-xs mb-1.5 text-center'>Meal time:</p>
        <div className='flex gap-1 justify-center mb-2'>
          <label className='flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all text-xs whitespace-nowrap'>
            <input
              type="checkbox"
              checked={timeDay.includes(1)}
              onChange={() => toggleTimeDay(1)}
              className='w-3 h-3 text-healthyGreen focus:ring-healthyGreen'
            />
            <span className='font-medium text-[10px]'>Desayuno</span>
          </label>

          <label className='flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all text-xs whitespace-nowrap'>
            <input
              type="checkbox"
              checked={timeDay.includes(2)}
              onChange={() => toggleTimeDay(2)}
              className='w-3 h-3 text-healthyGreen focus:ring-healthyGreen'
            />
            <span className='font-medium text-[10px]'>Almuerzo</span>
          </label>

          <label className='flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all text-xs whitespace-nowrap'>
            <input
              type="checkbox"
              checked={timeDay.includes(3)}
              onChange={() => toggleTimeDay(3)}
              className='w-3 h-3 text-healthyGreen focus:ring-healthyGreen'
            />
            <span className='font-medium text-[10px]'>Snack</span>
          </label>

          <label className='flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:border-healthyGreen cursor-pointer transition-all text-xs whitespace-nowrap'>
            <input
              type="checkbox"
              checked={timeDay.includes(4)}
              onChange={() => toggleTimeDay(4)}
              className='w-3 h-3 text-healthyGreen focus:ring-healthyGreen'
            />
            <span className='font-medium text-[10px]'>Cena</span>
          </label>
        </div>

        <div className="flex justify-center items-center w-full cursor-pointer bg-healthyGreen rounded-md">
          <button
            className="font-quicksand text-white font-bold text-sm py-2"
            onClick={savePlate}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewPlate;