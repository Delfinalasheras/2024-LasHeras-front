import React,{useEffect, useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {  faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'; 

const Search = ({foodData, setSearchFood}) => {
    const [search, setSearch]=useState('')

    useEffect(()=>{
        const foodFilter=foodData.filter(food=>(food.name.toLowerCase().includes(search.toLowerCase())))
        setSearchFood(search!==''  ? foodFilter : foodData)
    },[search]);

    return (
    <div className="w-10/12 sm:w-9/12 flex  flex-row items-center justify-start bg-white/80 p-2 rounded-xl">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-darkGray text-lg sm:text-xl ml-2 mr-3"  />
        <input placeholder="Search" value={search} type="text" onChange={(e)=>setSearch(e.target.value)} className="bg-transparent border-none outline-none w-full font-semibold text-sm lg:text-md font-quicksand text-darkGray  "/>
    </div>
    )
}

export default Search