import React, { useEffect, useRef, useState } from 'react';
import FoodItem from './FoodItem';
import {createplate,createReview, fetchUser} from '../../../firebaseService'
import { uploadImageToStorage, } from "../../../firebaseConfig";
import { faEye, faEyeSlash, faImage, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Visibility } from './Visibility';
import { plateAchivements } from '../../../components/AchivementsValidation'


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

  // Function to handle adding/removing food items
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
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
    return selectedFoods.reduce(
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
  };

  const ingredientsArray = selectedFoods.map(food => ({
    ingredientId: food.id,
    quantity: food.quantity
}));
  
const createPlate = async () => {
  if (!plateName) {
    setMessage("The plate name is missing");
    return;
  }
  if (selectedFoods.length === 0) {
    setMessage("Please select the food you want to include");
    return;
  }

  try {
    const user= await fetchUser()
    console.log("LEVEL", user.validation)
    let imageUrl = "";
    if (image) {
      // Upload the image and get the URL
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
    };

    // Update the UI without refreshing the page
    const newPlates=plates.concat({ name: plateName, ingredients: ingredientsArray, calories_portion: totals.calories, sodium_portion: totals.sodium, carbohydrates_portion: totals.carbohydrates, protein_portion: totals.protein, fats_portion:  totals.fats, image: imageUrl,public:publicPlate,verified: user.validation  })
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
    setSelectedFoods([]);
    setImage(null); // Clear the selected image
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
      console.log("Review created successfully!");
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
            onChange={(e) => setPlateName(e.target.value)}
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
      <div className="flex justify-center items-center sticky mt-2 bottom-0 w-full py-2 cursor-pointer bg-healthyGreen">
        <button
          className="font-quicksand text-white font-bold text-sm"
          onClick={savePlate}
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export default NewPlate;


