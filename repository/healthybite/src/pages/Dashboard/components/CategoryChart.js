import { PieChart } from '@mui/x-charts'
import React from 'react'

const CategoryChart = ({userCalories, currentDate, palette, chartWidth}) => {
    return (
    <div className="flex w-full justify-center items-center ">
        <PieChart
            colors={palette}
            series={[{data: userCalories.find(item=> item.day===currentDate).categories}]}
            width={window.innerWidth<'400' ? chartWidth*1.68 : chartWidth*1.9}
            height={window.innerWidth<'400' ? chartWidth*0.9 : chartWidth }
        />   
    </div>
    )
}

export default CategoryChart