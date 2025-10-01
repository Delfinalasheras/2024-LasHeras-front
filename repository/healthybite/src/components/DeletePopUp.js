import React from 'react'

const DeletePopUp = ({setCancel, handleDelete}) => {
  return (
    <div className='absolute z-40 top-0 left-0 w-full h-screen bg-black/60 '>
        <div className='w-full  flex justify-center items-center h-full'>
            <div className='bg-white z-50 flex justify-center items-center flex-col w-4/5 sm:w-1/2 lg:w-1/3 font-quicksand font-semibold text-lg  shadow-md py-6 px-4 rounded-xl'>
                <p className='text-darkGray font-bold mb-5 text-center'>Are you sure you want to&nbsp;delete?</p>
                <div className='flex w-full justify-around items-center '>
                    <button onClick={handleDelete} className='rounded-lg text-white w-5/12 py-1 bg-healthyGreen hover:bg-healthyDarkGreen '>Yes</button>
                    <button onClick={()=>setCancel(false)} className='rounded-lg text-white w-5/12 py-1 bg-healthyOrange hover:bg-healthyDarkOrange'>Cancel</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default DeletePopUp