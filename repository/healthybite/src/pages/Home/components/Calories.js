import React, { useState, useEffect } from 'react';
import { createTotCal, UpdateTotCal, fetchTotCalByDay } from "../../../firebaseService";

const Calories = ({ userFood }) => {
    const [addTotCal, setAddTotCal] = useState(null);
    const [totals, setTotals] = useState({
        calories: 0,
        carbs: 0,
        fat: 0,
        sodium: 0,
        protein: 0,
    });

    const calculateTotals = () => {
        let calories = 0, carbs = 0, fat = 0, sodium = 0, protein = 0;

        userFood.forEach((food) => {
            const portionFactor = food.amount_eaten / food.measure_portion;
            calories += food.calories_portion * portionFactor;
            carbs += food.carbohydrates_portion * portionFactor;
            fat += food.fats_portion * portionFactor;
            sodium += food.sodium_portion * portionFactor;
            protein += food.protein_portion * portionFactor;
        });

        setTotals({
            calories: Math.ceil(calories),
            carbs: Math.ceil(carbs),
            fat: Math.ceil(fat),
            sodium: Math.ceil(sodium),
            protein: Math.ceil(protein),
        });
    };

    const createOrUpdateTotCalories = async (totals, selectedDate) => {
        try {
            const totCalByDay = await fetchTotCalByDay(selectedDate);
            console.log("totcalbyday", totCalByDay);
    
            const dataToSend = {
                ...totals,
            };
    
            console.log("Data to send:", dataToSend); 
    
            if (totCalByDay.length === 0) {
                const createdTotCal = await createTotCal(dataToSend, selectedDate);
                if (createdTotCal) {
                    setAddTotCal(createdTotCal);
                }
            } else {
                const existingTotCal = totCalByDay[0];
                await UpdateTotCal(existingTotCal.id, dataToSend,selectedDate );
                setAddTotCal(existingTotCal);
            }
        } catch (error) {
            console.error("Error creating/updating totals:", error);
        }
    };
    

    useEffect(() => {
        if (userFood && userFood.length > 0) {
            calculateTotals();
        }
    }, [userFood]);
    
    useEffect(() => {
        if (userFood && userFood.length > 0 && totals.calories > 0) {
            const date = userFood[0]?.date_ingested ? new Date(userFood[0].date_ingested) : new Date();
            createOrUpdateTotCalories(totals, date);
        }
    }, [totals, userFood]);
    

    return (
        <div className="flex flex-row sm:flex-col justify-center items-center w-full">
            <p className="mr-4 sm:mr-0 font-quicksand text-darkGray text-md sm:text-xl text-center lg:text-left">Total calories</p>
            <p className="mr-2 sm:mr-0 font-quicksand text-darkGray text-xl font-semibold sm:text-4xl lg:text-6xl">{totals.calories}</p>
        </div>
    );
};

export default Calories;
