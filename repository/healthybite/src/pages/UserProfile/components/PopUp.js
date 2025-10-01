import React from 'react'
import { useNavigate } from 'react-router-dom';
import { deleteUserAc } from '../../../firebaseService';
import { auth } from "../../../firebaseConfig";

export default function PopUp({setDeleteAc}) {
    const navigate = useNavigate();

    const deleteAccount=async ()=>{
        try{
            await deleteUserAc()
            auth.signOut()
            navigate("/")
            setDeleteAc(false)
        } catch (error) {
            console.error('Error:', error);
        }
    }

  return (
    <div className="w-full h-screen absolute top-0 z-10 flex justify-center items-center bg-black/50">
        <div className="w-11/12 sm:w-full flex flex-col text-md font-quicksand text-darkGray font-semibold justify-center shadow-lg items-center max-w-[400px] bg-healthyGray rounded-2xl py-8 pt-4  relative">
            <p className='text-xl text-center my-3 mb-8 font-bold'>Are you sure you want to delete your&nbsp;account?</p>
            <div className='w-4/5 flex flex-row items-center justify-around'>
                <button onClick={deleteAccount} className='w-1/2 mr-3 px-3 py-1 rounded-lg text-white hover:shadow-md bg-healthyOrange hover:bg-healthyDarkOrange '>Yes</button>
                <button onClick={()=>setDeleteAc(false)} className='w-1/2 px-3 py-1 rounded-lg text-white hover:shadow-md bg-healthyGreen hover:bg-healthyDarkGreen'>No</button>
            </div>
        </div>
    </div>
  )
}
