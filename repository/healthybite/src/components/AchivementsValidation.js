import { addGoal } from "../firebaseService"
export const plateAchivements = (amountOfPlates) => {
    // Allow clearing the input
    if (amountOfPlates>=1){
        console.log("SIII")
        addGoal(3)
    }
    if (amountOfPlates>=5){
        addGoal(4)
    }
    if (amountOfPlates>=10){
        addGoal(5)
    }

};
export const drinkAchievments = (amountOfDrinks)=>{
    if (amountOfDrinks>=1){
        addGoal(6)
    }
    if (amountOfDrinks>=5){
        addGoal(7)
    }
    if (amountOfDrinks>=10){
        addGoal(8)
    }
}