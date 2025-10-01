import React,{useEffect, useState} from 'react'
import NavBar from '../../components/NavBar'
import userImg from '../../assets/userImg.jpg'
import { fetchUser } from '../../firebaseService'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare,faTrophy, faArrowDown, faKey, faTrash, faBullseye } from '@fortawesome/free-solid-svg-icons'; 
import Input from '../../components/Input'
import DataUser from './components/DataUser'
import {editUserData} from '../../firebaseService'
import { Link } from 'react-router-dom'
import {auth} from '../../firebaseConfig'
import PopUp from './components/PopUp'
import {handleInputChange} from '../inputValidation';
import Loading from '../../components/Loading'
import Goals from '../../components/Goals'
const achievements = {
    1: { 
        name: "Streak 3!", 
        description: "Reach 3 days in a row of logging food to get this trophy" 
    },
    2: {
        name: "healthy Lover! 10 days logging food!",
        description: "Reach 10 days in a row of logging food to get this trophy",
    },
    3: {
        name: "sous chef!! first plate logged",
        description: "Add a Plate to your profile to get this trophy",
    },
    4: {
        name: "CHEF! 5 plates logged!",
        description: "Add 5 Plates to your profile to get this trophy",
    },
    5:{
        name: "MASTERCHEF! 10 plates logged!",
        description: "Add 10 Plates to your profile to get this trophy",
    },
    6:{
        name: "First drinks logged!",
        description: "Add a Drink to your profile to get this trophy",
    },
    7:{
        name: "BARTENDER! 5 drinks log",
        description: "Add 5 Drinks to your profile to get this trophy",
    },
    8:{
        name: "10 drinks logged!",
        description: "Add 10 Drinks to your profile to get this trophy",
    },
};


function UserProfile() {
    const [user, setUser]=useState(null)
    const [surname, setSurname] = useState('');
    const [weight, setWeight] = useState('');
    const [birthDate, setBirthDate] = useState();
    const [height, setHeight] = useState('');
    const [name, setName] = useState('');
    const [inValidation,setInValidation]=useState(false)
    const [message, setMessage]=useState(false)
    const [edit, setEdit]=useState(false)
    const [deleteAc, setDeleteAc]=useState(false)
    const [loading, setLoading]=useState(true)
    const [openGoals, setOpenGoals]=useState(false)
    const [myachievements, setMyAchievements] = useState([]);
    const handleWeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setWeight);
    };
    const handleHeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setHeight);
    };

    const handleValidation = () => {
        setInValidation(true);
        const birthDateObj = new Date(birthDate);
        const today = new Date();
        
        if (birthDateObj >= today) {
            setMessage("Check the birth date");
            return; 
        }

        // If all validations pass
        setMessage("");
    }


    const getUser = async () => {
        try {
            const userData = await fetchUser();
            setUser(userData);
            setName(userData.name);
            setSurname(userData.surname);
            setMyAchievements(userData.achievements || []);
            setWeight(userData.weight);
            setHeight(userData.height);
            // Store the date in ISO format
            const date = new Date(userData.birthDate);
            setLoading(false)
            setBirthDate(date.toISOString().split('T')[0]); // "YYYY-MM-DD" format
        } catch (e) {
            console.log("Error obtaining user data in UserProfile.js: ", e);
        }
    }
    

    const editUser = async () => {
        const data = {
            ...user,
            birthDate: birthDate, // This is already in the correct format
            height: height,
            name: name,
            surname: surname,
            weight: weight,
            goals: user.goals,
            validation: user.validation,
            achivements: user.achievements,
        };
        try {
            await editUserData(data);
            console.log('User edited successfully in Firestore');
        } catch (err) {
            console.log('Error editing user: ' + err.message);
        }
    }

    const editGoals=()=>{
        setOpenGoals(false)
        const updateGoals=async()=>{
            await editUserData(user)
        }
        updateGoals()
    }
    

    useEffect(()=>{
        getUser()
    },[])

    const saveChanges=()=>{
        edit && editUser()
        setEdit(false)
    }
    const renderAchievements = () => {
        // Separate archived and unarchived trophies
        const archivedAchievements = Object.keys(achievements).filter(id => user?.achievements?.includes(parseInt(id)));
        const unarchivedAchievements = Object.keys(achievements).filter(id => !user?.achievements?.includes(parseInt(id)));
    
        return (
            <div className="flex flex-col w-full">
                {/* Render Archived Achievements */}
                <div className="w-full mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedAchievements.map((id) => {
                            const achievement = achievements[id];
                            return (
                                <div key={id} className="m-4 text-center">
                                    {/* Trophy Icon */}
                                    <FontAwesomeIcon
                                        icon={faTrophy}
                                        size="3x"
                                        color="#FFD700" // Yellow for achieved
                                    />
                                    {/* Achievement Name */}
                                    <div className="mt-2">
                                        <h3 className="font-bold text-lg">{achievement.name}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
    
                {/* Render Unarchived Achievements */}
                <div className="w-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unarchivedAchievements.map((id) => {
                            const achievement = achievements[id];
                            return (
                                <div key={id} className="m-4 text-center">
                                    {/* Trophy Icon */}
                                    <FontAwesomeIcon
                                        icon={faTrophy}
                                        size="3x"
                                        color="#B0B0B0" // Grey for unachieved
                                    />
                                    {/* Achievement Description */}
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">{achievement.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };
    
    
    
    
    

  return (
    <div className={`w-full ${ loading ? 'bg-white' : 'bg-healthyBrown'} h-screen overflow-y-hidden`}>
        <NavBar/>
        {loading ? <Loading/> :
        <div className='w-full h-full sm:h-screen flex flex-col lg:flex-row justify-start  items-start overflow-y-auto  '>
            <div className='w-full z-10   md:w-10/12 lg:w-2/3 flex flex-col  items-center justify-start mt-8 md:mt-20 lg:mt-32'>
                <div className=' w-11/12 lg:w-2/3 flex items-center justify-between mb-3'>
                    <h1 className='text-xl xs:text-2xl font-belleza text-darkGray'>User profile</h1>
                </div>
                <div className='flex w-11/12 lg:w-2/3 flex-row flex-wrap justify-center md:justify-around  items-center mb-3 font-quicksand text-white font-semibold text-sm '>
                    <button onClick={edit ? saveChanges : ()=>setEdit(true)} className={`py-1 px-3 mb-1 xs:px-5 mr-1 rounded-lg ${edit  ? 'bg-healthyGray1' : 'bg-healthyGreen'  }  ${ edit ?  'hover:bg-healthyDarkGray1' : 'hover:bg-healthyDarkGreen' }`}> <FontAwesomeIcon icon={edit  ?  faArrowDown : faPenToSquare} className='text-white text-md mr-2' />{edit ?  'Save changes' : 'Edit profile'}</button>
                    <button onClick={()=>setOpenGoals(true)} className='py-1 px-3  xs:px-5  rounded-lg text-white bg-healthyYellow hover:bg-healthyDarkYellow cursor-pointer mb-1 '><FontAwesomeIcon icon={faBullseye} className='mr-2 '  />My goals</button>
                    {!edit && <><Link to={`/resetPassword/${auth.currentUser?.accessToken}`}  className='bg-healthyOrange hover:bg-healthyDarkOrange px-3 mb-1  py-1 rounded-lg '><FontAwesomeIcon icon={faKey}  className='pr-2'/>Edit password</Link>
                    <button onClick={()=>setDeleteAc(true)} className='bg-healthyGray1 hover:bg-healthyDarkGray1 px-3 mb-1 py-1 rounded-lg  ml-1 '><FontAwesomeIcon icon={faTrash} className='pr-2'/>Delete account</button></>}
                </div>
                <div className='flex flex-wrap w-11/12 lg:w-2/3 font-quicksand'>
            
                    
                    {edit ?

                    (user && <div className="flex flex-col  w-full px-2 md:max-h-[400px] overflow-y-auto">
                        <Input required={inValidation && name===''} label="Name" inputType="text" inputValue={name} placeholder={user.name} onChange={(e)=>setName(e.target.value)} />
                        <Input required={inValidation && surname===''} label="Surname" inputType="text" inputValue={surname} placeholder={user.surname} onChange={(e)=>setSurname(e.target.value)} />
                        <Input
                            required={inValidation && birthDate === ''}
                            label="Date of birth"
                            inputType="date"
                            inputValue={birthDate} // This should now be in "YYYY-MM-DD" format
                            onChange={(e) => setBirthDate(e.target.value)} // This will receive "YYYY-MM-DD"
                        />

                        <Input required={inValidation && weight===''} label="Weight" inputType="number" inputValue={weight} placeholder={user.weight} onChange={handleWeightChange}/>
                        {inValidation && weight < 0 && <p className='text-red-500 text-xs'>weight must be a positive number.</p>}
                        {inValidation && weight >= 500 && <p className='text-red-500 text-xs'>weight must be under 600kg.</p>}
                        <Input required={inValidation && height===''} label="Height" inputType="number" inputValue={height} placeholder={user.height} onChange={handleHeightChange}/>

                        {inValidation && height < 0 && <p className='text-red-500 text-xs'>height must be a positive number.</p>}
                        {inValidation && height >= 500 && <p className='text-red-500 text-xs'>height must under 600cm.</p>}
                    </div>)
                    :  (user && <div className="flex flex-wrap  w-full px-2  justify-around items-center">
                        <DataUser label="Name" value={name} />
                        <DataUser label="Surname" value={surname} />
                        <DataUser label="Date of birth" value={birthDate} />
                        <DataUser label="Weight" value={weight} />
                        <DataUser label="Height" value={height} />
                        <div className="w-full px-2">
                            {renderAchievements()}
                        </div>
                    </div>)
                    
            
                    }
                </div>
            </div>
            <div className='flex md:absolute z-0 bottom-0 right-0 w-screen h-screen  '>
                <div className='flex justify-end items-end w-full h-full z-0 '>
                    <img src={userImg} alt='Background image photo' className=' md:w-3/5 lg:w-1/3 w-full z-0' />
                </div>
            </div>
        </div>}
        {deleteAc &&
            <PopUp setDeleteAc={setDeleteAc} />
        }
        {
            openGoals &&
            <Goals user={user} setUser={setUser} editGoals={editGoals}/>
        }
    </div>
  )
}

export default UserProfile