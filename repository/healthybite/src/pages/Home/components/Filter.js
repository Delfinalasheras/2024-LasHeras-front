import React,{useEffect, useState} from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilter, faXmark } from '@fortawesome/free-solid-svg-icons'; 
import FilterItem from './FilterItem';
import FilterSelected from './FilterSelected';

function Filter({categories, filterSelected, setFilterSelected}) {
    const [openFilter, setOpenFilter]=useState(false)

    return (
    <div className='w-full flex justify-center'>
        <div className={` font-quicksand mt-3 text-white text-lg  flex flex-col  justify-center w-full `}>
            <button onClick={()=>setOpenFilter(!openFilter)} className={` bg-healthyDarkGreen w-full  px-6 py-1 font-bold rounded-xl hover:cursor-pointer hover:bg-healthyGreen`}> <FontAwesomeIcon icon={faFilter} /> Filter</button>
            
            {openFilter &&
                <div className='flex bg-white p-3 rounded-md flex-col justify-start items-start w-full text-md max-h-40 overflow-y-auto'>
                {!filterSelected && categories.map((item)=>(
                    <FilterItem category={item} key={item.id} setFilterSelected={setFilterSelected}/>
                ))}
                </div>
            }
            {
                filterSelected && <FilterSelected filter={filterSelected} setFilterSelected={setFilterSelected} />
            }
        </div>
    </div>
    )
}

export default Filter