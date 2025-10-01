import React from 'react'
import { Slider } from '@mui/material'

function GoalSetter({label, measure, value, setValue, max}) {
return (
    <div className='flex flex-col sm:flex-row w-full justify-start items-center py-3 text-darkGray'>
        <div className='w-full  sm:w-3/12 flex flex-row sm:flex-col items-center justify-between  sm:justify-center'>
            <p className='sm:w-full text-left font-semibold text-md'>{label}</p>
            <p className='sm:w-full text-left text-sm '>{value} {measure}</p>
        </div>

        <div className='flex justify-center items-center w-full sm:w-9/12'>
            <Slider value={value} onChange={(e, newValue)=>setValue(newValue)} defaultValue={0} aria-label={label} valueLabelDisplay="auto" max={max}  
                sx={{
                    color: '#fa9b6a', // Custom color for the slider
                    '& .MuiSlider-thumb': { // Thumb color and size
                        color: '#fa9b6a',
                    },
                    '& .MuiSlider-valueLabel': { // Font and style for the label
                        fontFamily: 'Quicksand, sans-serif',
                        backgroundColor: '#fa9b6a',
                        color: 'white',
                    },
                }}
            />
        </div>
    </div>)
}

export default GoalSetter