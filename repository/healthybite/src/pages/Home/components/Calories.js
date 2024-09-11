import React from 'react'

const Calories = ({userFood}) => {

    const calculateCalories=()=>{
        var calories=0
        userFood.forEach((food)=>{
            calories+=(food.calories*food.amount_eaten)/food.amount
        })
        return calories
    }

    return (
    <div className="mt-4 sm:mt-0 flex flex-row sm:flex-col justify-center items-center w-full">
        <p className="mr-4 sm:mr-0 font-quicksand text-darkGray text-xl text-center lg:text-left ">Total calories</p>
        <p className=" mr-2 sm:mr-0 font-quicksand text-darkGray text-4xl lg:text-6xl  ">{Math.ceil(calculateCalories().toFixed(2))}</p>
        <p className="font-quicksand text-darkGray text-md">calories</p>
    </div>
    )
}

export default Calories