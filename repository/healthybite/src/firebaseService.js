
import { convertFieldResponseIntoMuiTextFieldProps } from "@mui/x-date-pickers/internals";
import { auth, firestore } from "../src/firebaseConfig";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import axios from "axios";

const store='https://two024-ranchoaparte-back.onrender.com'
//const store='https://two024-ranchoaparte-back.onrender.com'


export const fetchUser=async()=>{
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/User/${auth.currentUser.uid}`);
        
        return response.data; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null; // Return null or handle the error as needed
    }
}

export const editUserData=async(data)=>{
    try {
        console.log("USERDATA",data)
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/update_user/${auth.currentUser.uid}`, data);
        
        return response.data; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error editing user data by ID:', error);
        return null; // Return null or handle the error as needed
    }
}

export const deleteUserAc=async()=>{
    try {
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/delete-user/${auth.currentUser.uid}`); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error deleting user by ID:', error);
        return null; // Return null or handle the error as needed
    }
}

export const fetchUserFoods = async (date) => {
    const userFood = await userFoodMeals(); // Wait for the promise to resolve
    if (!userFood) return []; // Handle if there's no data

    // Filter the food based on the provided date
    const filteredFood = userFood.filter(doc => {
        let ingestedDate;
        if (doc.date_ingested.seconds) {
            ingestedDate = new Date(doc.date_ingested.seconds * 1000); // Convert timestamp to Date
        } else {
            ingestedDate = new Date(doc.date_ingested); // If it's a string, it will handle conversion
        }

        return (
            ingestedDate.getDate() === date.getDate() &&
            ingestedDate.getMonth() === date.getMonth() &&
            ingestedDate.getFullYear() === date.getFullYear()
        );
    });

    console.log("Filtered User Foods by date:", filteredFood);
    return filteredFood;
};


export const fetchFoodByID = async (foodId) => {
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/Foods/${foodId}`);
        return response.data.message.food; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};

const userFoodMeals = async()=>{
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/mealUserDay/${auth.currentUser.uid}`);
        return response.data.message.foods; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
}



export const fetchAllFoods = async () => {
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/Foods/`);
        console.log(response.data.message.food)
        return response.data.message.food; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching foods:', error);
        return []; // Return an empty array or handle the error as needed
    }
};


export const addUserFood = async (selection, date, amount) => {
    try {
        const response = await fetch(`https://two024-ranchoaparte-back.onrender.com/UserFood_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "id_User": auth.currentUser.uid,
                "id_Food": selection.id_food,
                "date_ingested": date.toISOString(),
                "amount_eaten": Number(selection.amount),
            }),
            
        });
        console.log(auth.currentUser.uid,selection.id_food,date.toISOString(),Number(selection.amount))
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
        }

        console.log("Food added successfully:", data);
    } catch (error) {
        console.error("Error adding food:", error);
    }
};

export const addNewFood = async (newFood) => {
    try {
        const response = await fetch(`https://two024-ranchoaparte-back.onrender.com/Food_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "name": newFood.name,
                "calories_portion": Number(newFood.calories),
                "measure": newFood.measure,
                "measure_portion": Number(newFood.amount),
                "carbohydrates_portion":  Number(newFood.carbohydrate),
                "sodium_portion": Number(newFood.sodium),
                "fats_portion": Number(newFood.fat),
                "protein_portion": Number(newFood.protein)
            }),
            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
        }

        console.log("Food added successfully:", data);
    } catch (error) {
        console.error("Error adding food:", error);
    }
};

export const deleteUserFood = async (doc_id) => {

    try {
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/DeleteMealUser/${doc_id}`); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};


export const editUserFood = async (doc_id,data) => {

    try {
        await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateUserFood/${doc_id}`,data); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};

export const getCategories = async()=>{
    const uid=auth.currentUser.uid
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetCategoryUser/${uid}`);
        return response.data.message.categories; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching categories :', error);
        return null; // Return null or handle the error as needed
    }
}

export const getDefaultCategories = async () => {
    const uid = auth.currentUser.uid;
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetCategoryUser/default`);
        return response.data.message.categories; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching default categories:', error);
        return null; // Return null or handle the error as needed
    }
};

export const getBarCategory = async () => {
    try {
        const defaultCategories = await getDefaultCategories();
        console.log('Default Categories:', defaultCategories); // Log all categories

        if (defaultCategories) {
            const barCategory = defaultCategories.find(cat => cat.name === "C&V bar");
            console.log('Found Bar Category:', barCategory); // Log if the category is found
            return barCategory ? barCategory : null; // Return the category or null if not found
        }
        return null;
    } catch (error) {
        console.error('Error fetching bar category:', error);
        return null; // Return null or handle the error as needed
    }
};



export const createCategory =async (data)=>{
    const uid=auth.currentUser.uid
    try{
        const response = await axios.post(`https://two024-ranchoaparte-back.onrender.com/CreateCategory/`, {...data,id_User: uid });
        return response.data
    }catch(error){
        console.error('Error adding new category: ', error);
        return null;
    }
}

export const updateCategory=async(data,category_id)=>{
    try{
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateCategory/${category_id}`,{...data,id_User: auth.currentUser.uid });
        return response.data
    }catch(error){
        console.error('Error updating category by id: ', error);
        return null;
    }
}
export const updateCategoryDefault=async(data,category_id)=>{
    try{
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateCategory/${category_id}`,{...data,id_User: 'default' });
        return response.data
    }catch(error){
        console.error('Error updating category by id: ', error);
        return null;
    }
}

export const deleteCategory=async(category_id)=>{
    try {
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/DeleteCategory/${category_id}`); 
    } catch (error) {
        console.error('Error deleting category by ID:', error);
        return null; 
    }
}

export const createTotCal = async (data, date) => {
    try {
        const validDate = date instanceof Date && !isNaN(date) ? date.toISOString() : new Date().toISOString(); // Fallback to current date if invalid
        console.log("LO QUE LLEGA AL TOT CAL ", data)
        const response = await fetch(`https://two024-ranchoaparte-back.onrender.com/CreateTotCaloriesUser/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "id_user": auth.currentUser.uid,
                "day": validDate, // Using the valid date here
                "totCal": data.calories,
                "totProt": data.protein,
                "totSodium": data.sodium,
                "totCarbs": data.carbs,
                "totFats": data.fat,
            }),
        });

        // Await response.json() before referencing 'data'
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.detail || "Something went wrong");
        }

        console.log("Calories entry added successfully:", responseData);
        return responseData;
    } catch (error) {
        console.error("Error adding calories entry:", error);
        return null;
    }
};



export const UpdateTotCal = async (totcal_id, data, date) => {
    try {
        // Ensure the date is in the correct format
        const validDate = date instanceof Date && !isNaN(date) ? date.toISOString() : new Date().toISOString(); // Fallback to current date if invalid

        // Prepare payload matching backend expectations
        const payload = {
            id_user: auth.currentUser.uid,
            day: validDate,   // Using "day" instead of "date" to match the model
            totCal: data.calories,
            totProt: data.protein,
            totSodium: data.sodium,
            totCarbs: data.carbs,
            totFats: data.fat,
        };

        console.log("Payload:", payload); // Log to confirm structure before sending

        // Send the request
        await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateTotCaloriesUser/${totcal_id}`, payload); 
    } catch (error) {
        console.error('Error updating total calories:', error);
        return null; // Return null or handle the error as needed
    }
};

export const fetchTotCalByDay = async (date) => {
    const userTotCal = await getTotCalUser(); // Wait for the promise to resolve
    
    if (!userTotCal) return []; // Handle if there's no data

    // Filter the food based on the provided date
    const filteredTotcal = userTotCal.filter(doc => {
        let ingestedDate;
        if (doc.day.seconds) {
            ingestedDate = new Date(doc.day.seconds * 1000); // Convert timestamp to Date
        } else {
            ingestedDate = new Date(doc.day); // If it's a string, it will handle conversion
        }

        return (
            ingestedDate.getDate() === date.getDate() &&
            ingestedDate.getMonth() === date.getMonth() &&
            ingestedDate.getFullYear() === date.getFullYear()
        );
    });

    console.log("Filtered User cals by date:", filteredTotcal);
    return filteredTotcal;
};

export const getCategoriesAndDefaults = async () => {
    try {
        const categories = await Promise.all([
            getCategories(),
            getDefaultCategories()
        ]);
        return categories.flat();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
};

export const getCaloriesByCategories= ( userCalories, categories, foods, barFood, drinks, plates)=>{
   try{
        
        const result = userCalories.map(item => {
            let foodDetail = foods.find(food => food.id === item.id_Food) || barFood.find(food => food.id === item.id_Food) || drinks.find(e=>item.id_Food===e.id) || plates.find(plate=> plate.id === item.id_Food) ;
            if (foodDetail) {
                return {
                    id_Food: item.id_Food,
                    calories: Number((item.amount_eaten * (foodDetail.calories_portion || foodDetail?.calories || 0 )) / (foodDetail.measure_portion || 1)),
                    fats: Number((item.amount_eaten * (foodDetail.fats_portion || foodDetail?.fats || 0 )) / (foodDetail.measure_portion || 1)),
                    sodium: Number((item.amount_eaten * (foodDetail.sodium_portion || foodDetail?.sodium || 0 )) / (foodDetail.measure_portion || 1)),
                    carbohydrates: Number((item.amount_eaten * (foodDetail.carbohydrates_portion || foodDetail?.carbohydrates || 0 )) / (foodDetail.measure_portion || 1)),
                    protein: Number((item.amount_eaten * (foodDetail.protein_portion || foodDetail?.protein || 0 )) / (foodDetail.measure_portion || 1))
                };
            }else{
                return {
                    id_Food: item.id_Food, 
                    calories:0,
                    sodium:0,
                    carbohydrates:0,
                    fats:0,
                    protein:0
                }

            }
        })

        if (result.length === 0) {
            return { categories: [], total: 0 };
        } 

        const calories = result.reduce((acc,value)=>acc+value.calories, 0) 
        const sodium = result.reduce((acc,value)=>acc+value.sodium, 0) 
        const carbohydrates = result.reduce((acc,value)=>acc+value.carbohydrates, 0) 
        const fats = result.reduce((acc,value)=>acc+value.fats, 0) 
        const protein = result.reduce((acc,value)=>acc+value.protein, 0) 
        // divide calories by categories
        const getCalories = categories.map(cat => {
            const cals = result.filter(food => cat.foods.includes(food.id_Food)).reduce((acc, item) => acc + Number(item.calories), 0);
            return { label: cat.name, value: cals };
        });

        const caloriesInCat = getCalories.reduce((acc, value) => acc + value.value, 0);
        if (caloriesInCat < calories) {
            getCalories.push({ label: 'Others', value: calories - caloriesInCat });
        }


        return {categories:getCalories, calories: calories, fats: fats, sodium: sodium, carbohydrates: carbohydrates, protein: protein, }
    }catch(error){
        console.log('Error fetching calories by categories: ', error)
        return []
    }
}

export const getTotCalUser=async()=>{
    const uid=auth.currentUser.uid
    if(uid){try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetTotCalUser/${uid}`);
        return response.data.message.totCals; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching categories :', error);
        return null; // Return null or handle the error as needed
    }}else{
        console.log('no se encuentra el usuario')
    }
}

export const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses van de 0 a 11, por eso sumamos 1
    const year = date.getFullYear(); // Obtiene el año completo

    return `${day}/${month}/${year}`; // Retorna la fecha en formato dd/mm/yyyy
};

export const getFilterData = async () => {
    try{
        const [userCalories,foods, barFoods, categories, drinksType,drinks, plates, user ] = await Promise.all([ userFoodMeals(), fetchAllFoods(), getProducts(), getCategoriesAndDefaults(), await fechDrinkTypes(), getUserDrinks(), getUserPlates(), fetchUser()])
        userCalories.sort((a, b) => new Date(a.date_ingested) - new Date(b.date_ingested));
        const groupedByDate = userCalories.reduce((acc, current) => {
            const date = formatDate(new Date(current.date_ingested)); // Solo tomar la fecha sin la hora
            // Si la fecha ya existe en el objeto agrupado, se agregan los foods
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push({
                id_Food: current.id_Food,
                amount_eaten: current.amount_eaten
            });
            
            return acc;
        }, {});
        const resultArray = Object.keys(groupedByDate).map(date => ({
            date,
            foods: groupedByDate[date]
        }));
        let caloriesByCat 
        const calPerCat = resultArray.map((item) => {
            if (item.foods.length === 0) {
                return null; 
            }
            
            caloriesByCat = getCaloriesByCategories(item.foods, categories, foods, barFoods, drinks, plates.map(item=> {return {...item, measure_portion: 1}}));
            if (caloriesByCat) {
                return { ...caloriesByCat, day: item.date };
            } else {
                return null;
            }
        });
        const drinksData=[]
        userCalories.forEach((item)=>{
            const drinkConsumed=drinks.find(e=>item.id_Food===e.id) 
            drinkConsumed && drinksData.push({
                date_ingested:item.date_ingested,
                name:drinkConsumed.name,
                sugar:(item.amount_eaten * drinkConsumed.sugar_portion)/ drinkConsumed.measure_portion ,
                caffeine: (item.amount_eaten * drinkConsumed.caffeine_portion )/ drinkConsumed.measure_portion ,
                calories:(item.amount_eaten * drinkConsumed.calories_portion )/ drinkConsumed.measure_portion,
                type: drinksType.find(drinkType=> drinkType.id===drinkConsumed.typeOfDrink).name
            })
        })
        return {calories: calPerCat, drinks: drinksData, goals:user.goals};
    }catch(e){
        console.log("Error fetching data for fitell in dashboard", e)
        return []
    }
}

export const resetPassword = async (oobCode, newPassword) => {
    try {
        await verifyPasswordResetCode(auth, oobCode);
        await confirmPasswordReset(auth, oobCode, newPassword);
        return true;
    } catch (error) {
        console.error('Error resetting password:', error.message, error.code); // Add error message and code
        return false;
    }
};

// APP MESIIDEPAUL

export const getProducts=async()=>{
    const response = await axios.get('https://candv-back.onrender.com');
    return response.data.products ? response.data.products : [];
}

export const editCalories=async(id,calories)=>{
    await axios.put(`https://candv-back.onrender.com/add-calories/${id}/${calories}`); 

}
export const getProdByID= async(prod_id)=>{
    const response = await axios.get(`https://candv-back.onrender.com/products/${prod_id}`);
    const food=response.data.product
    return food
}


// things that need to be deployed
export const createplate = async (selection) => {
    try {
        console.log("PLATO", selection)
        const response = await fetch("https://two024-ranchoaparte-back.onrender.com/CreatePlate/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "id_User": auth.currentUser.uid,
                "ingredients": selection.ingredients,
                "name": selection.name,
                "calories_portion": selection?.calories_portion || 0,
                "sodium_portion": selection?.sodium_portion || 0,
                "carbohydrates_portion": selection?.carbohydrates_portion || 0,
                "protein_portion": selection?.protein_portion || 0,
                "fats_portion": selection?.fats_portion || 0,
                "image": selection.image,
                "public": selection.public,
                "verified": selection.verified
            }),
            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
            
        }
        

        console.log("plate entry added successfully:", data);
        return data.id;
    } catch (error) {
        console.error("Error adding plate entry:", error);
        return null;
    }
};

export const getUserPlates = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated");
        return null;
    }
    const uid = user.uid;
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetPlatesUser/${uid}`);
        return response.data.message.Plates; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching plates :', error);
        return null; // Return null or handle the error as needed
    }
};
export const updatePlate=async(data,plate_id)=>{
    try{
        console.log("PLATO",data)
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdatePlate/${plate_id}`,{...data,id_User: auth.currentUser.uid });
        return response.data
    }catch(error){
        console.error('Error updating plate by id: ', error);
        return null;
    }
}
export const deleteplate=async(plate_id)=>{
    try {
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/DeletePlate/${plate_id}`); 
    } catch (error) {
        console.error('Error deleting plate by ID:', error);
        return null; 
    }
}
export const fechDrinkTypes = async () =>{
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated");
        return null;
    }
    const uid = user.uid;
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/getUserDrinkType/${uid}`);
        return response.data.message.drinkType; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching typedrinks :', error);
        return null; // Return null or handle the error as needed
    }
}
export const createDrinkType = async (selection) => {
    try {
        const response = await fetch('https://two024-ranchoaparte-back.onrender.com/drinkType_log', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "name": selection.name,
                "id_user": auth.currentUser.uid,
            }),
            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
            
        }
        

        console.log("drink entry added successfully:", data);
        return data.drinkType_id;
    } catch (error) {
        console.error("Error adding drink entry:", error);
        return null;
    }
};
export const getUserDrinks = async () =>{
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated");
        return null;
    }
    const uid = user.uid;
    try {
        const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetDrinks/${uid}`);
        return response.data.message.Drinks; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching typedrinks :', error);
        return null; // Return null or handle the error as needed
    }
}
export const createDrink = async (selection) => {
    try {
        console.log(selection)
        const response = await fetch('https://two024-ranchoaparte-back.onrender.com/drink_log', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "name": selection.name,
                "sugar_portion": selection.sugar_portion,
                "caffeine_portion": selection.caffeine_portion,
                "calories_portion": selection.calories_portion,
                "measure": selection.measure,
                "measure_portion": selection.measure_portion,
                "typeOfDrink": selection.typeOfDrink,
                "id_User": auth.currentUser.uid,
            }),
            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
            
        }
        

        console.log("drink entry added successfully:", data);
        return response.data.message.drinkType_id;
    } catch (error) {
        console.error("Error adding drink entry:", error);
        return null;
    }
};
export const deleteDrink=async(drink_id)=>{
    try {
        console.log(drink_id)
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/DeleteDrink/${drink_id}`); 
    } catch (error) {
        console.error('Error deleting plateFood by ID:', error);
        return null; 
    }
}
export const updateDrink = async (doc_id,data) => {

    try {
        console.log(doc_id,data)
        await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateDrink/${doc_id}`,{...data,id_User: auth.currentUser.uid }); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error updating drink by ID:', error);
        return null; // Return null or handle the error as needed
    }
};
export const deleteDrinkType = async (doc_id) => {
    try {
        await axios.delete(`https://two024-ranchoaparte-back.onrender.com/DeleteDrinkType/${doc_id}`); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error deleting drinktype by ID:', error);
        return null; // Return null or handle the error as needed
    }
};
export const getDrinkByID = async (drink_id) => {
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/DrinkById/${drink_id}`);
    const drink=response.data.message.drink
    console.log("drink", drink)
    return drink

}
export const getPlate_ByID = async (plate_id) => {
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetPlateByID/${plate_id}`);
    const drink=response.data.message.plate
    console.log("PLATOOOOOOOOOO", drink)
    return drink

}

export const getGroupedDrinkTypes = async () => {
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/getUserGroupDrinkType/${auth.currentUser.uid}`);
    const drink=response.data.Drinks
    return drink

}

export const getPublicPlates = async () => {
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/GetPlatePublicPlates/`)
    const plates = response.data.Plates
    return plates
}
export const PlateReviews = async () => {
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/PlateReviews/`)
    const review = response.data.Review
    return review
}

export const updateComments = async (doc_id, data) => {
    try {
        console.log("Updating comments:", { doc_id, data });
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/UpdateReview/${doc_id}`, data); // Check if you need {...data}
        
        // Log the response from the server
        console.log("Server response:", response.data);

        // Return success or handle response as needed
        return response.data;
    } catch (error) {
        console.error('Error updating review by ID:', error.response ? error.response.data : error.message);
        return null; // Return null or handle the error as needed
    }
};
export const createReview = async (selection) => {
    try {
        console.log(selection)
        const response = await fetch('https://two024-ranchoaparte-back.onrender.com/newReview', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify( {
                "plate_Id": selection.id_plate,
                "comments": selection.comments,
                "score": selection.score,
            }),
            
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
            
        }
        

        console.log("drink entry added successfully:", data);
        return data.drinkType_id;
    } catch (error) {
        console.error("Error adding drink entry:", error);
        return null;
    }
};

export const getstreak = async () => {
    const user_id  = auth.currentUser.uid
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/Streak/${user_id}`,)
    const streak = response.data.message
    return streak
}
export const getUserNotification = async () => {
    const user_id  = auth.currentUser.uid
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/getUserNotifications/${user_id}`,)
    const notifications = response.data.notifications
    return notifications
}
export const markNotificationAsRead = async (doc_id) => {
    try {
        console.log("Updating comments:", { doc_id });
        const response = await axios.put(`https://two024-ranchoaparte-back.onrender.com/markNotificationAsRead/${doc_id}`); // Check if you need {...data}
        
        console.log("Server response:", response);


        return;
    } catch (error) {
        console.error('Error updating review by ID:', error.response ? error.response.data : error.message);
        return null; // Return null or handle the error as needed
    }
};
export const getPlatesNotUser = async () => {
    const user_id  = auth.currentUser.uid
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/PublicplatesNotFromUser/${user_id}`,)
    const plates = response.data.Plates
    return plates
}
export const addGoal = async (goal_id) => {
    const user_id = auth.currentUser.uid;
    const response = await axios.get(`https://two024-ranchoaparte-back.onrender.com/addGoal/${user_id}`, {
        params: { goal_id }
    });
    return response;
}
