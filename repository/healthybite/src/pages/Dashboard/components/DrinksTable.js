import React from 'react'

function DrinksTable({drinksDay}) {
    return (
    <table className="w-full  mx-2 xs:mx-0 font-quicksand text-sm xs:text-md  my-6 lg:my-12 border-spacing-2  table-fixed border-collapse font-normal text-healthyOrange rounded-lg border border-healthyOrange ">
        <thead>
            <tr className="bg-healthyOrange w-full text-white font-bold text-center px-2 py-2 rounded-t-md">
                <th className="py-2  w-3/12 ">Drink Name</th>
                <th className="py-2   w-3/12 ">Sugar</th>
                <th className="py-2    w-3/12">Caffeine</th>
                <th className="py-2    w-3/12">Calories</th>
                <th className="py-2   w-3/12">Type</th>
            </tr>
        </thead>
        <tbody>
            {drinksDay.map((drink, index)=>
            <tr key={index} className=" px-2 py-2 w-full ">
                <th className=" border-2 border-healthyOrange/20 text-left  w-3/12  px-2 py-2">{drink.name}</th>
                <th className=" border-2 border-healthyOrange/20  px-2 py-2 w-1/12">{drink.sugar}</th>
                <th className=" border-2 border-healthyOrange/20  px-2 py-2 w-1/12">{drink.caffeine}</th>
                <th className=" border-2 border-healthyOrange/20  px-2 py-2 w-1/12">{drink.calories}</th>
                <th className=" border-2 border-healthyOrange/20 text-right w-3/12  px-2 py-2">{drink.type}</th>
            </tr>
            )}
        </tbody>

    </table>
    )
}

export default DrinksTable