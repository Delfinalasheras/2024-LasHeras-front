
import { convertFieldResponseIntoMuiTextFieldProps } from "@mui/x-date-pickers/internals";
import { auth, firestore } from "../src/firebaseConfig";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut,deleteUser } from 'firebase/auth';
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
const ruta='http://127.0.0.1:8000'
// const ruta ='https://two024-lasheras-back.onrender.com'
let cachedUserUid = null;

export const getIdToken = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null; 
    return await currentUser.getIdToken();
  };

axios.interceptors.request.use(
    async (config) => {
        try {
            const token = await getIdToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;

                        }
            return config;
        } catch (error) {
            console.error("No token available:", error);
            return config;
        }
    },
    (error) => Promise.reject(error)
);

export const registerUser = async (email, password, name, surname, weight, height, birthDate) => {
    let userCredential = null;
    try {
        // 1. Crear el usuario en Firebase Auth (Paso Crítico 1)
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        console.log("USER INFO LOG IN", email, password, name, surname, weight, height, birthDate);

        // Prepara los datos... (como ya lo tienes)
        const parsedWeight = Math.max(0, parseFloat(weight) || 0);
        const parsedHeight = Math.max(0, parseFloat(height) || 0);
        
        const data = {
            name: name,
            surname: surname,
            weight: parsedWeight,
            height: parsedHeight,
            birthDate: new Date(birthDate).toISOString(),
            goals: {
                calories: 0,
                sodium: 0,
                protein: 0,
                carbohydrates: 0,
                fats: 0,
                sugar: 0,
                caffeine: 0,
            },
            validation: 0,
            achievements: [],
            email: email,
        };
        console.log("USER INFO LOG IN", data);
        
        const token = await firebaseUser.getIdToken();
        if (!token) {
            throw new Error('Token not found');
        }
        
        await axios.post(`${ruta}/RegisterUser`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        const user = await fetchUser();
        if (user) {
            return firebaseUser.uid;
        }

    } catch (error) {
        if (userCredential && userCredential.user) {
            console.warn("API/Firestore failed, deleting user from Firebase Auth as a rollback.");
            await deleteUser(userCredential.user).catch(deleteError => {
                console.error("Error performing Auth rollback (deleting user):", deleteError);
            });
        }
        
        throw error;  
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await userCredential.user.getIdToken()
        return userCredential.user.uid;
    } catch (error) {
        throw error
    }
};

export const forgotPassword = async (email) => {
    try {
        return await sendPasswordResetEmail(auth, email, {
            url: "https://2024-ranchoaparte-front-ivory.vercel.app/resetPassword",
            handleCodeInApp: true,
          });
    } catch (error) {
      throw error.message;
    }
  };
export const logoutUser = async () => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        await signOut(auth);
    } catch (error) {
        throw error.message;
    }
};

export const getUserUid = async () => {
    if (cachedUserUid) {
        return cachedUserUid;
    }
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                cachedUserUid = user.uid; // Cache the UID
                resolve(user.uid);
            } else {
                reject(new Error("No user is currently logged in."));
            }
        });
    });
};

export const fetchUser=async()=>{
    try {
        const token = await getIdToken()
        console.log(token)
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.get(`${ruta}/getUser`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
        console.log("RESPONSE DATA",response.data)
        return response.data.user; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return null; // Return null or handle the error as needed
    }
}
  

export const editUserData=async(data)=>{
    
    try {
        const token = await getIdToken()
        console.log("INFORMACION PARA ACTUALIZAR",data)
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.put(`${ruta}/update_user/`, data,{
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });
        
        return response.data; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error editing user data by ID:', error);
        return null; // Return null or handle the error as needed
    }
}

export const deleteUserAc=async(user_id)=>{
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.delete(`${ruta}/delete_user/${user_id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        return response
    } catch (error) {
        console.error('Error deleting user by ID:', error);
        return null; // Return null or handle the error as needed
    }
}

export const fetchUserFoods = async (user_id, date) => {
    const userFood = await userFoodMeals(user_id); 
    if (!userFood) return []; // Handle if there's no data
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
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.get(`${ruta}/Foods/${foodId}`);
        return response.data.message.food; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};

const userFoodMeals = async()=>{
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.get(`${ruta}/mealUserDay/`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }); 
        return response.data.message.foods; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
}



export const fetchAllFoods = async () => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.get(`${ruta}/Foods/`);
        return response.data.message.food;
    } catch (error) {
        console.error('Error fetching foods:', error);
        return []; // Return an empty array or handle the error as needed
    }
};


export const addUserFood = async (user_id,selection, date, amount) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await fetch(`${ruta}/UserFood_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify( {
                "id_User": user_id,
                "id_Food": selection.id_food,
                "date_ingested": date.toISOString(),
                "amount_eaten": Number(selection.amount),
            }),
            
        });
        console.log(user_id,selection.id_food,date.toISOString(),Number(selection.amount))
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Something went wrong");
        }

        console.log("Food added successfully:", data);
        return response.id;
    } catch (error) {
        console.error("Error adding food:", error);
    }
};
  

  export const addNewFood = async (newFood) => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Token not found');
    console.log("NEW FOOD DATA", newFood)
      const response = await fetch(`${ruta}/Food_log/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newFood.name,
          calories_portion: Number(newFood.calories),
          measure: newFood.measure,
          measure_portion: Number(newFood.amount),
          carbohydrates_portion: Number(newFood.carbohydrate),
          sodium_portion: Number(newFood.sodium),
          fats_portion: Number(newFood.fat),
          protein_portion: Number(newFood.protein),
          timeDay: newFood.timeday,
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Something went wrong");
      return data;
    } catch (error) {
      console.error("Error adding food:", error);
      throw error;
    }
  };
  

export const deleteUserFood = async (doc_id) => {

    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        await axios.delete(`${ruta}/DeleteMealUser/${doc_id}`,{
            headers: { Authorization: `Bearer ${token}` }
        }); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};


export const editUserFood = async (doc_id,data) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        await axios.put(`${ruta}/UpdateUserFood/${doc_id}`,data);
    } catch (error) {
        console.error('Error fetching food by ID:', error);
        return null; // Return null or handle the error as needed
    }
};

export const getCategories = async()=>{
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.get(`${ruta}/GetCategoryUser`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          
        return response.data.message.categories;
    } catch (error) {
        console.error('Error fetching categories :', error);
        return null; // Return null or handle the error as needed
    }
}

export const getDefaultCategories = async () => {
    try {
        const response = await axios.get(`${ruta}/GetDefaultCategory`);
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



export const createCategory = async (data) => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Token not found');
     const { id_User, ...payload } = data;
  
      console.log("category data to send", payload);
  
      const response = await axios.post(`${ruta}/CreateCategory`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      return response.data;
    } catch (error) {
      console.error('Error adding new category: ', error);
      return null;
    }
  };
  

export const updateCategory=async(data,category_id)=>{
    try {
        const token = await getIdToken()
        console.log("ACTUALIZAR CAT",data)
        if( !token){
            throw new Error ('Token not found')
        }
        const response = await axios.put(`${ruta}/UpdateCategory/${category_id}`, data);
        
        return response.data; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error editing category:', error);
        return null; // Return null or handle the error as needed
    }
}
// export const updateCategoryDefault=async(data,category_id)=>{
//     try{
//         const response = await axios.put(`${ruta}/UpdateCategory/${category_id}`,{...data,id_User: 'default' });
//         return response.data
//     }catch(error){
//         console.error('Error updating category by id: ', error);
//         return null;
//     }
// }

export const deleteCategory=async(category_id)=>{
    try {
        await axios.delete(`${ruta}/DeleteCategory/${category_id}`,{
            headers: { Authorization: `Bearer ${await getIdToken()}` }
        }); 
    } catch (error) {
        console.error('Error deleting category by ID:', error);
        return null; 
    }
}

export const createTotCal = async (data, date) => {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Token not found');
  
      const validDate = date instanceof Date && !isNaN(date) ? date.toISOString() : new Date().toISOString();
  
      const response = await fetch(`${ruta}/CreateTotCaloriesUser/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          day: validDate,
          totCal: data.calories,
          totProt: data.protein,
          totSodium: data.sodium,
          totCarbs: data.carbs,
          totFats: data.fat
        }),
      });
  
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.detail || "Something went wrong");
      return responseData;
    } catch (error) {
      console.error("Error adding calories entry:", error);
      throw error;
    }
  };
  



export const UpdateTotCal = async (totcal_id, data, date) => {
    try {

        const validDate = date instanceof Date && !isNaN(date) ? date.toISOString() : new Date().toISOString();
        const payload = {
            day: validDate,   // Using "day" instead of "date" to match the model
            totCal: data.calories,
            totProt: data.protein,
            totSodium: data.sodium,
            totCarbs: data.carbs,
            totFats: data.fat,
        };

        console.log("Payload:", payload); // Log to confirm structure before sending

        // Send the request
        await axios.put(`${ruta}/UpdateTotCaloriesUser/${totcal_id}`, payload); 
    } catch (error) {
        console.error('Error updating total calories:', error);
        return null; // Return null or handle the error as needed
    }
};

export const fetchTotCalByDay = async (date) => {
    const isoDate = date.toISOString().split("T")[0];
    console.log("ISO DATE", isoDate)

    const response = await axios.get(`${ruta}/getTotCalDay/${isoDate}`, {
        headers: { Authorization: `Bearer ${await getIdToken()}` }
    });
    console.log("Filtered User cals by date:", response.message);

    return await response.data.message;
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
        const response = await axios.get(`${ruta}/GetTotCalUser`);
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
export const createplate = async (selection) => {
    try {
        const token = await getIdToken();
        if (!token) throw new Error('Token not found');
  
        console.log("PLATO", selection)
        const response = await fetch(`${ruta}/CreatePlate/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify( {
                "ingredients": selection.ingredients,
                "name": selection.name,
                "calories_portion": selection?.calories_portion || 0,
                "sodium_portion": selection?.sodium_portion || 0,
                "carbohydrates_portion": selection?.carbohydrates_portion || 0,
                "protein_portion": selection?.protein_portion || 0,
                "fats_portion": selection?.fats_portion || 0,
                "image": selection.image,
                "public": selection.public,
                "verified": selection.verified,
                "timeDay": selection.timeday,
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
        const response = await axios.get(`${ruta}/GetPlatesUser/`);
        return response.data.message.Plates; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching plates :', error);
        return null; // Return null or handle the error as needed
    }
};
export const updatePlate=async(data,plate_id)=>{
    try{
        console.log("PLATO ACTUALIZAR",data)
        const response = await axios.put(`${ruta}/UpdatePlate/${plate_id}`,{...data,id_User: auth.currentUser.uid });
        return response.data
    }catch(error){
        console.error('Error updating plate by id: ', error);
        return null;
    }
}
export const deleteplate=async(plate_id)=>{
    try {
        await axios.delete(`${ruta}/DeletePlate/${plate_id}`,{
            headers: { Authorization: `Bearer ${await getIdToken()}` } 
        }); 
    } catch (error) {
        console.error('Error deleting plate by ID:', error);
        return null; 
    }
}
// BEBIDAS
export const fechDrinkTypes = async () =>{
    const user = auth.currentUser;
    if (!user) {
        console.error("User is not authenticated");
        return null;
    }
    try {
        const response = await axios.get(`${ruta}/getUserDrinkType/`);
        return response.data.message.drinkType; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching typedrinks :', error);
        return null; // Return null or handle the error as needed
    }
}
export const createDrinkType = async (selection) => {
    try {

        const response = await fetch(`${ruta}/drinkType_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${await getIdToken()}`
            },
            body: JSON.stringify( {
                "name": selection.name,
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
        const response = await axios.get(`${ruta}/GetDrinks/`);
        return response.data.message.Drinks; // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error fetching typedrinks :', error);
        return null; // Return null or handle the error as needed
    }
}
export const createDrink = async (selection) => {
    try {
        const token = await getIdToken();
        if (!token) throw new Error('Token not found');
        const response = await fetch(`${ruta}/drink_log`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify( {
                "name": selection.name,
                "sugar_portion": selection.sugar_portion,
                "caffeine_portion": selection.caffeine_portion,
                "calories_portion": selection.calories_portion,
                "measure": selection.measure,
                "measure_portion": selection.measure_portion,
                "typeOfDrink": selection.typeOfDrink,
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
        await axios.delete(`${ruta}/DeleteDrink/${drink_id}`); 
    } catch (error) {
        console.error('Error deleting plateFood by ID:', error);
        return null; 
    }
}
export const updateDrink = async (doc_id,data) => {

    try {
        console.log(doc_id,data)
        await axios.put(`${ruta}/UpdateDrink/${doc_id}`,{...data}); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error updating drink by ID:', error);
        return null; // Return null or handle the error as needed
    }
};
export const deleteDrinkType = async (doc_id) => {
    try {
        await axios.delete(`${ruta}/DeleteDrinkType/${doc_id}`); // Adjust this based on your backend response structure
    } catch (error) {
        console.error('Error deleting drinktype by ID:', error);
        return null; // Return null or handle the error as needed
    }
};
export const getDrinkByID = async (drink_id) => {
    const response = await axios.get(`${ruta}/DrinkById/${drink_id}`);
    const drink=response.data.message.drink
    console.log("drink", drink)
    return drink

}
export const getPlate_ByID = async (plate_id) => {
    const response = await axios.get(`${ruta}/GetPlateByID/${plate_id}`);
    const drink=response.data.message.plate
    console.log("PLATOOOOOOOOOO", drink)
    return drink

}

export const getGroupedDrinkTypes = async () => {
    const response = await axios.get(`${ruta}/getUserGroupDrinkType/`);
    const drink=response.data.Drinks
    return drink

}

export const getPublicPlates = async () => {
    const response = await axios.get(`${ruta}/GetPlatePublicPlates/`)
    const plates = response.data.Plates
    return plates
}
export const PlateReviews = async () => {
    const response = await axios.get(`${ruta}/PlateReviews/`)
    const review = response.data.Review
    return review
}

export const updateComments = async (doc_id, data) => {
    try {
        console.log("Updating comments:", { doc_id, data });
        const response = await axios.put(`${ruta}/UpdateReview/${doc_id}`, data); // Check if you need {...data}
        
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
        const token = await getIdToken();
        if (!token) throw new Error('Token not found');
        console.log(selection)
        const response = await fetch(`${ruta}/newReview`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "authorization": `Bearer ${token}`
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
    const response = await axios.get(`${ruta}/Streak/`,)
    const streak = response.data.message
    return streak
}
export const getUserNotification = async () => {
    const response = await axios.get(`${ruta}/getUserNotifications/`,)
    const notifications = response.data.notifications
    return notifications
}
export const markNotificationAsRead = async (doc_id) => {
    try {
        console.log("Updating comments:", { doc_id });
        const response = await axios.put(`${ruta}/markNotificationAsRead/${doc_id}`); // Check if you need {...data}
        
        console.log("Server response:", response);


        return;
    } catch (error) {
        console.error('Error updating review by ID:', error.response ? error.response.data : error.message);
        return null; // Return null or handle the error as needed
    }
};
export const getPlatesNotUser = async () => {
    const response = await axios.get(`${ruta}/PublicplatesNotFromUser/`,)
    const plates = response.data.Plates
    return plates
}
export const addGoal = async (goal_id) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.post(`${ruta}/addGoal`, 
        { achivement_id: goal_id }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
    
    return response;
    }catch (error) {return null;}
}

///FINAL
export const getRecomendations = async () => {
    try {
        const token = await getIdToken()

        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.get(`${ruta}/getRecomendations/`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    console.log("recos",response.data)
    return response.data;
    }catch (error) {
        console.error('Error fetching recomendations :', error);
        return null; // Return null or handle the error as needed
    }
}

export const getDailyMenu = async (day) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.get(`${ruta}/getOrbuildDailyMenu/${day}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
    return response.data;
    }catch (error) {
        console.error('Error fetching daily menu :', error);
        return null; // Return null or handle the error as needed
    }
}
export const updateWeeklyPlan = async (data) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const startDate = data.week_start;
        const response=await axios.patch(`${ruta}/weekly-plan/${startDate}`, data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
    return response.data;
    }catch (error) {
        console.error('Error updating weekly plan :', error);
        return null; // Return null or handle the error as needed
    }
}
export const getWeeklyPlan = async (week_start) => {
    try {
        const token = await getIdToken()
        console.log("entro a getwp, WEEK START", week_start)
        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.get(`${ruta}/weekly-plan/${week_start}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
    return response.data;
    }catch (error) {
        console.error('Error fetching weekly plan :', error);
        return null; // Return null or handle the error as needed
    }
}
export const getShoppingList = async (week_start) => {
    try {
        const token = await getIdToken()
        if( !token){
            throw new Error ('Token not found')
        }
        const response=await axios.get(`${ruta}/shoppingList/${week_start}`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
    
    return response.data;
    }catch (error) {
        console.error('Error fetching shopping list :', error);
        return null; // Return null or handle the error as needed
    }}