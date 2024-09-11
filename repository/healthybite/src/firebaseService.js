import { collection, addDoc, getDocs,deleteDoc,doc } from "firebase/firestore";
import { auth, firestore } from "../src/firebaseConfig";
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Timestamp } from "firebase/firestore";

export const fetchUserFoods = async (date) => {
    const queryUserFood = await getDocs(collection(firestore, 'UserFood'));
    const userFood = queryUserFood.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }))
    .filter(doc => {
        const ingestedDate = new Date(doc.date_ingested.seconds * 1000);
        return doc.id_User === auth.currentUser.uid &&
        ingestedDate.getDate() === date.getDate() &&
        ingestedDate.getMonth() === date.getMonth() &&
        ingestedDate.getFullYear() === date.getFullYear() 

    });
    
    return userFood;
};

export const fetchAllFoods = async () => {
    const queryFood = await getDocs(collection(firestore, 'Food'));
    return queryFood.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
};

export const addUserFood = async (selection, date, amount) => {
    const newData = {
        id_user_food: uuidv4(),
        id_Food: selection.id_food,
        id_User: auth.currentUser.uid,
        date_ingested: Timestamp.fromDate(date),
        amount_eaten: Number(selection.amount),
    };
    await addDoc(collection(firestore, 'UserFood'), newData);
    return newData;
};

export const addNewFood = async (newFood) => {
    await addDoc(collection(firestore, 'Food'), {
        name: newFood.name,
        id_Food: uuidv4(),
        measure: newFood.measure,
        measure_portion: Number(newFood.amount),
        calories_portion: Number(newFood.calories),
    });
};
export const deleteUserFood = async (doc_id) => {
    try {
        await deleteDoc(doc(firestore, 'UserFood', doc_id));
        console.log(doc_id)
        console.log('Comida eliminada de UserFood > Firestore con éxito');
    } catch (error) {
        console.error('Error al eliminar la comida: ' + error.message);
    }
};

