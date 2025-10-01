import React from 'react'
import GoalPie from './GoalPie'

function Goals({userCalories, currentDate, goals}) {
    return (
    <div className="w-full flex flex-col justify-center items-center my-2 mb-4 sm:mb-0 ">
        <h2 className="w-full text-left text-healthyOrange text-xl font-belleza pb-2 pl-2">History of goals</h2>
        <div className="flex justify-center items-center w-full flex-wrap ">
            <GoalPie consumed={userCalories.find(item=> item.day===currentDate)?.calories || 0 } goal={goals.calories} label='calories'/>
            <GoalPie consumed={userCalories.find(item=> item.day===currentDate)?.protein || 0 } goal={goals.protein} label='protein'/>
            <GoalPie consumed={userCalories.find(item=> item.day===currentDate)?.sodium || 0 } goal={goals.sodium} label='sodium'/>
            <div className="flex ">
            <GoalPie consumed={userCalories.find(item=> item.day===currentDate)?.carbohydrates || 0 } goal={goals.carbohydrates} label='carbs'/>
            <GoalPie consumed={userCalories.find(item=> item.day===currentDate)?.fats || 0 } goal={goals.fats} label='fats'/>
            </div>
        </div>
    </div>
    )
}

export default Goals