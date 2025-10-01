import React, { useState } from 'react'
import GoalSetter from './GoalSetter';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookmark, faUser } from '@fortawesome/free-solid-svg-icons';

function Goals({user, setUser, editGoals}) {

    const [calories, setCalories] = useState(user.goals.calories ? user.goals.calories : 0);
    const [sodium, setSodium] = useState(user.goals.sodium ? user.goals.sodium : 0);
    const [carbohydrate, setCarbohydrate] = useState(user.goals.carbohydrates ? user.goals.carbohydrates : 0);
    const [fat, setFat] = useState(user.goals.fats ? user.goals.fats : 0);
    const [protein, setProtein]=useState(user.goals.protein ? user.goals.protein : 0)
    const [caffeine, setCaffeine]=useState(user.goals.caffeine ? user.goals.caffeine : 0)
    const [sugar, setSugar]=useState(user.goals.sugar ? user.goals.sugar : 0)

    const saveChanges=()=>{
        setUser({...user, goals: {calories:calories, fats:fat, carbohydrates:carbohydrate, protein:protein, sodium:sodium, sugar:sugar, caffeine:caffeine},})
        editGoals && editGoals()
    }
    return (
        <div className="w-full absolute z-50 top-0 left-0 h-screen bg-black/40">
            <div className="w-full flex items-center justify-center h-full">
                <div className=" w-11/12 md:w-3/4 lg:w-1/2 flex flex-col justify-center items-center shadow-lg bg-white rounded-lg py-3 px-6">
                    <div className='w-full flex flex-col sm:flex-row justify-between items-center  py-2  '>
                        <p className=" font-belleza font-bold text-2xl text-healthyOrange text-left mb-2 sm:mb-0">SET YOUR DAILY GOALS</p>
                        {calories>0 && sodium>0 && carbohydrate>0 && fat>0 && protein>0 &&  <button  onClick={saveChanges} className='bg-healthyDarkOrange/70 text-white px-3 py-1 text-sm rounded-lg font-quicksand font-semibold hover:bg-healthyDarkOrange flex items-center justify-around '><FontAwesomeIcon icon={faBookmark} className='mr-2'/><p>Save goals</p></button>}
                    </div>
                    {!editGoals && <p className='font-quicksand text-healthyGray1 text-sm font-semibold text-left w-full mb-4'>You can modify your goals anytime by visiting <span className=' text-healthyDarkGray1'>User Profile</span> </p>}
                    <div className='flex flex-col w-full justify-center items-center font-quicksand '>
                        <GoalSetter label='Calories' measure='cal' value={calories} setValue={setCalories} max={5000} />
                        <GoalSetter label='Sodium' measure='mg' value={sodium} setValue={setSodium} max={3000} />
                        <GoalSetter label='Carbohydrates' measure='g' value={carbohydrate} setValue={setCarbohydrate} max={400} />
                        <GoalSetter label='Fat' measure='g' value={fat} setValue={setFat} max={100} />
                        <GoalSetter label='Protein' measure='g' value={protein} setValue={setProtein} max={200} />
                        <GoalSetter label='Sugar' measure='g' value={sugar} setValue={setSugar} max={100} />
                        <GoalSetter label='Caffeine' measure='mg' value={caffeine} setValue={setCaffeine} max={600} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Goals