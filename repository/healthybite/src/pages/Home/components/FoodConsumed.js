import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleXmark, faPenToSquare, faCircleCheck, faCaretDown} from '@fortawesome/free-solid-svg-icons'
import { format } from 'date-fns';

import DeletePopUp from '../../../components/DeletePopUp';



const FoodConsumed = ({ usfood, handleDeleteMeal , handleEditFoodConsumed, drink}) => {
    const [edit, setEdit]=useState(false)
    const [time, setTime]=useState(new Date(usfood.date_ingested))
    const [amount, setAmount]=useState(usfood.amount_eaten)
    const [originalTime, setOriginalTime] = useState(new Date(usfood.date_ingested));  // New: For discarding
    const [originalAmount, setOriginalAmount] = useState(usfood.amount_eaten);  // New: For discarding
    const [deleteItem, setDeleteItem]=useState(false)
    const [clickable, setClickable] = useState(true);
    const [details, setDetails]=useState(false)

    const info = [
        {
            name: 'Calories',
            ammount: (usfood.calories_portion * usfood.amount_eaten)/usfood.measure_portion,
            measure: usfood.measure_portion,
            unit: 'cal',
            carb: false,
        },
        ...(drink
        ? [
            {
                name: 'Sugar',
                ammount: (usfood.sugar_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'g',
                carb: false,
            },
            {
                name: 'Caffeine',
                ammount: (usfood.caffeine_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'mg',
                carb: false,
            },
            ]
        : [
            {
                name: 'Carbohydrates',
                ammount: (usfood.carbohydrates_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'g',
                carb: true,
            },
            {
                name: 'Fats',
                ammount: (usfood.fats_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'mg',
                carb: false,
            },
            {
                name: 'Protein',
                ammount: (usfood.protein_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'mg',
                carb: false,
            },
            {
                name: 'Sodium',
                ammount: (usfood.sodium_portion * usfood.amount_eaten)/usfood.measure_portion,
                measure: usfood.measure_portion,
                unit: 'mg',
                carb: false,
            },
            ]),
    ];
    const handleChange = () => {
        if (amount > 0) {
          const updatedUsfood = {
            ...usfood,
            date_ingested: new Date(time),
            amount_eaten: Number(amount),
          };
          handleEditFoodConsumed(usfood.id, updatedUsfood);
          setEdit(false);
        }
      };
    
    const handleDiscard = () => {  // New: Discard changes
        setTime(originalTime);
        setAmount(originalAmount);
        setEdit(false);
    };
    const handleDelete=()=>{
        handleDeleteMeal(usfood.id)
    }
    const handleSingleClick = () => {
        if (clickable) {
            setClickable(false); 
            handleDelete()
            setTimeout(() => {
                setClickable(true); 
            }, 1000); 
        }
    };

    return (
        <>
    {deleteItem ?
    <DeletePopUp handleDelete={handleSingleClick} setCancel={setDeleteItem}/>
    :
    <div className='flex w-full flex-col my-1'>
        <div className={`flex ${edit ? 'flex-col xs:flex-row ' : 'flex-row'} justify-between items-center w-full py-2 px-4 ${ details ? 'rounded-t-2xl' : 'rounded-2xl'} bg-hbGreen font-quicksand `}>
                <div className={`flex ${edit ?   'flex-row items-center w-1/2 xs:w-1/3 lg:w-1/2 justify-around xs:justify-center mb-2 xs:mb-0 ': 'flex-col items-start justify-center' }   `}>
                    <p className="text-md text-darkGray font-semibold text-left">{usfood.name}</p>
                    {edit ?
                        <div className='flex flex-row items-center justify-start xs:ml-3'>
                            <input 
                                value={String(amount)}  // From previous fix
                                onChange={(e)=> setAmount(e.target.value)} 
                                type='number' 
                                placeholder={usfood.amount_eaten} 
                                className={`py-1 px-2 text-xs text-right text-darkGray rounded-lg w-5/12 max-w-[100px] focus:outline-none focus:ring focus:ring-healthyGreen ${(amount <1 | !amount) && 'ring ring-red-500'}`}
                            />
                            <p className="text-sm text-darkGray ml-2"> {usfood.measure}</p>
                        </div>
                    :
                        <p className="text-xs text-darkGray w-full">{amount} {usfood.measure}</p>}
                </div>
                <div className='flex flex-row items-center justify-end w-1/2'>
                    <div className= {`flex ${edit ?   'flex-col-reverse md:flex-row items-center': 'flex-col items-end'}  justify-end pr-2`}>
                        
                        {edit ? 
                            <input 
                                onChange={(e)=>setTime(new Date(e.target.value))}  // From previous fix
                                value={format(time, "yyyy-MM-dd'T'HH:mm")}  // From previous fix
                                type='datetime-local' 
                                placeholder={format(time, "yyyy-MM-dd'T'HH:mm")}  // From previous fix
                                className="py-1 px-3 rounded-xl text-sm text-darkGray text-quicksand focus:outline-none focus:ring focus:ring-healthyGreen w-full xs:w-1/2 " 
                            />
                        :
                            <p className="text-sm">{format(time, "HH:mm")}</p>
                        }
                        <p  onClick={()=>setDetails(!details)} className={`text-xs font-semibold underline underline-offset-1  text-healthyGreen/90 cursor-pointer hover:text-healthyGreentext-right unde ${edit && 'mt-2 md:mt-0 md:mr-3'}`}>{details ? 'Close' : 'Open'} details</p>
                    </div>
                    {edit ?
                        <div className='flex flex-row items-center'> 
                            <FontAwesomeIcon onClick={handleChange} icon={faCircleCheck} className='text-healthyGreen hover:text-healthyDarkGreen cursor-pointer text-xl ml-2'/>
                            <FontAwesomeIcon onClick={handleDiscard} icon={faCircleXmark} className='text-red-500 hover:text-red-700 cursor-pointer text-xl ml-2'/>
                        </div>
                    :
                    <div className='flex flex-col justify-center sm:flex-row sm:justify-end items-around sm:items-center  sm:ml-3'>
                        <FontAwesomeIcon onClick={() => { setOriginalTime(time); setOriginalAmount(amount); setEdit(true); }} icon={faPenToSquare} className='text-md sm:text-xl text-darkGray cursor-pointer hover:text-healthyDarkGray1 mb-1 sm:mb-0'/>
                        <FontAwesomeIcon onClick={()=>setDeleteItem(true)}  icon={faCircleXmark}  className="text-red-500 cursor-pointer text-md sm:text-xl hover:text-red-700 sm:ml-3"/>
                    </div>}
                </div>
        </div>
        {details && 
        <div className='w-full bg-healthyGreen/60 rounded-b-2xl font-quicksand py-2 flex flex-wrap justify-around sm:px-2 items-center'>
            {info.map((item, index)=>
                <div key={item.name} className={`flex justify-center ${item.carb ? 'grow  sm:min-w-12 sm:max-w-20': 'min-w-16'}  flex-col items-center text-white text-sm`}>  
                <p className='font-semibold '>{item.name}</p>
                <p>{Math.round(item.ammount)} {item.unit}</p>
            </div>
            )}
        </div>}
    </div>}</>
    );
};

export default FoodConsumed;