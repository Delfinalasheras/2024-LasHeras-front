import React,{useContext,useEffect, useState} from 'react'
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
import { UserContext } from '../../App'
import { sendPasswordResetEmail } from 'firebase/auth'; 
import PasswordResetPopUp from './components/PasswordResetPopUp'


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
    const [user, setUser]=useState(null);
    const {user_id}=useContext(UserContext)
    const [surname, setSurname] = useState('');
    const [nameError, setNameError] = useState("");
    const [surnameError, setSurnameError] = useState("");
    const [weight, setWeight] = useState('');
    const [birthDate, setBirthDate] = useState();
    const [height, setHeight] = useState('');
    const [name, setName] = useState('');
    const [inValidation,setInValidation]=useState(false)
    const [message, setMessage]=useState('')
    const [edit, setEdit]=useState(false)
    const [deleteAc, setDeleteAc]=useState(false)
    const [loading, setLoading]=useState(true)
    const [openGoals, setOpenGoals]=useState(false)
    const [myachievements, setMyAchievements] = useState([]);
    const [openPasswordReset, setOpenPasswordReset] = useState(false);
    const handlePasswordReset = async () => {
        if (!auth.currentUser || !auth.currentUser.email) {
            setMessage('User not logged in or email unavailable.');
            return;
        }
    
        try {
            await sendPasswordResetEmail(auth, auth.currentUser.email);
            setMessage('Password reset email sent! Check your inbox.');

        } catch (error) {
            console.error('Error sending password reset email:', error);
            if (error.code === 'auth/user-not-found') {
                 setMessage('User not found. Please log in again.');
            } else {
                 setMessage(`Error: Could not send password reset email. ${error.message}`);
            }
        }
    };


    const handleTextInputChange = (value, setValue, setError) => {
        const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
        if (regex.test(value)) {
            setValue(value);
            setError("");
        } else {
            setError("Only letters are allowed.");
        }
    };
  
    const handleWeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setWeight);
    };
    
    const handleHeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setHeight);
    };

    const handleValidation = () => {
        setInValidation(true);
        setMessage(''); 

 
        if (!name || name.trim() === '') {
            setMessage("Name is required");
            return false;
        }


        if (!surname || surname.trim() === '') {
            setMessage("Surname is required");
            return false;
        }


        if (nameError || surnameError) {
            setMessage("Please fix the errors in name or surname");
            return false;
        }

        const nameSurnameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
        if (!nameSurnameRegex.test(name)) {
            setMessage("Name should only contain letters, spaces, apostrophes, or hyphens.");
            return false;
        }

        if (!nameSurnameRegex.test(surname)) {
            setMessage("Surname should only contain letters, spaces, apostrophes, or hyphens.");
            return false;
        }


        if (!birthDate) {
            setMessage("Birth date is required");
            return false;
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        
        if (birthDateObj >= today) {
            setMessage("Birth date must be in the past");
            return false; 
        }

        const maxAgeLimit = 110;
        const minBirthDate = new Date();
        minBirthDate.setFullYear(today.getFullYear() - maxAgeLimit);
        
        if (birthDateObj < minBirthDate) {
            setMessage(`Birth date is not valid. Maximum age is ${maxAgeLimit} years.`);
            return false;
        }


        if (!weight || weight.trim() === '') {
            setMessage("Weight is required");
            return false;
        }

        const weightNum = parseFloat(weight);
        if (isNaN(weightNum) || weightNum <= 0) {
            setMessage("Weight must be a positive number");
            return false;
        }

        if (weightNum >= 500) {
            setMessage("Weight must be under 500kg");
            return false;
        }

        if (!height || height.trim() === '') {
            setMessage("Height is required");
            return false;
        }

        const heightNum = parseFloat(height);
        if (isNaN(heightNum) || heightNum <= 0) {
            setMessage("Height must be a positive number");
            return false;
        }

        if (heightNum >= 500) {
            setMessage("Height must be under 500cm");
            return false;
        }

        return true;
    }

    const getUser = async () => {
        try {
            const userData = await fetchUser();
            console.log("User Data-profile ", userData)
            setUser(userData);
            setName(userData.name);
            setSurname(userData.surname);
            setMyAchievements(userData.achievements || []);
            setWeight(userData.weight);
            setHeight(userData.height);
            const date = new Date(userData.birthDate);
            setLoading(false)
            setBirthDate(date.toISOString().split('T')[0]);
        } catch (e) {
            console.log("Error obtaining user data in UserProfile.js: ", e);
        }
    }

    const editUser = async () => {
        const isValid = handleValidation();
        
        if (!isValid) {
            return; 
        }

        const data = {
            ...user,
            birthDate: birthDate, 
            height: height,
            name: name,
            surname: surname,
            weight: weight,
            goals: user.goals,
            validation: user.validation,
            achievements: user.achievements,
        };
        
        try {
            await editUserData(data);
            console.log('User edited successfully in Firestore');
            setMessage('Changes saved successfully!');
            setEdit(false);
            setInValidation(false);
            // Actualizar el usuario local
            setUser(data);
        } catch (err) {
            console.log('Error editing user: ' + err.message);
            setMessage('Error saving changes. Please try again.');
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
        user_id && getUser()
    },[user_id])

    const saveChanges = () => {
        editUser();
    };

    const cancelEdit = () => {
        // Restaurar valores originales
        if (user) {
            setName(user.name);
            setSurname(user.surname);
            setWeight(user.weight);
            setHeight(user.height);
            const date = new Date(user.birthDate);
            setBirthDate(date.toISOString().split('T')[0]);
        }
        setEdit(false);
        setMessage('');
        setInValidation(false);
        setNameError('');
        setSurnameError('');
    };
      
    const renderAchievements = () => {
        const archivedAchievements = Object.keys(achievements).filter(id => user?.achievements?.includes(parseInt(id)));
        const unarchivedAchievements = Object.keys(achievements).filter(id => !user?.achievements?.includes(parseInt(id)));
    
        return (
            <div className="flex flex-col w-full">
                <div className="w-full mb-4">
                    <h2 className="text-xl font-bold mb-3 text-darkGray">Achievements Unlocked</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {archivedAchievements.length > 0 ? (
                            archivedAchievements.map((id) => {
                                const achievement = achievements[id];
                                return (
                                    <div key={id} className="m-4 text-center">
                                        <FontAwesomeIcon
                                            icon={faTrophy}
                                            size="3x"
                                            color="#FFD700"
                                        />
                                        <div className="mt-2">
                                            <h3 className="font-bold text-lg">{achievement.name}</h3>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 col-span-full">No achievements unlocked yet. Keep going!</p>
                        )}
                    </div>
                </div>
                <div className="w-full">
                    <h2 className="text-xl font-bold mb-3 text-darkGray">Locked Achievements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {unarchivedAchievements.map((id) => {
                            const achievement = achievements[id];
                            return (
                                <div key={id} className="m-4 text-center">
                                    <FontAwesomeIcon
                                        icon={faTrophy}
                                        size="3x"
                                        color="#B0B0B0"
                                    />
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
        <div className={`w-full ${loading ? 'bg-white' : 'bg-healthyBrown'} h-screen overflow-y-hidden`}>
            <NavBar/>
            {loading ? <Loading/> :
            <div className='w-full h-full sm:h-screen flex flex-col lg:flex-row justify-start items-start overflow-y-auto'>
                <div className='w-full z-10 md:w-10/12 lg:w-2/3 flex flex-col items-center justify-start mt-8 md:mt-20 lg:mt-32'>
                    <div className='w-11/12 lg:w-2/3 flex items-center justify-between mb-3'>
                        <h1 className='text-xl xs:text-2xl font-belleza text-darkGray'>User profile</h1>
                    </div>
                    
                    <div className='flex w-11/12 lg:w-2/3 flex-row flex-wrap justify-center md:justify-around items-center mb-3 font-quicksand text-white font-semibold text-sm'>
                        {edit ? (
                            <>
                                <button 
                                    onClick={saveChanges} 
                                    className='py-1 px-3 mb-1 xs:px-5 mr-1 rounded-lg bg-healthyGreen hover:bg-healthyDarkGreen'
                                >
                                    <FontAwesomeIcon icon={faArrowDown} className='text-white text-md mr-2' />
                                    Save changes
                                </button>
                                <button 
                                    onClick={cancelEdit} 
                                    className='py-1 px-3 mb-1 xs:px-5 mr-1 rounded-lg bg-healthyGray1 hover:bg-healthyDarkGray1'
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={()=>setEdit(true)} 
                                className='py-1 px-3 mb-1 xs:px-5 mr-1 rounded-lg bg-healthyGreen hover:bg-healthyDarkGreen'
                            >
                                <FontAwesomeIcon icon={faPenToSquare} className='text-white text-md mr-2' />
                                Edit profile
                            </button>
                        )}

                        <button 
                            onClick={()=>setOpenGoals(true)} 
                            className='py-1 px-3 xs:px-5 rounded-lg text-white bg-healthyYellow hover:bg-healthyDarkYellow cursor-pointer mb-1'
                        >
                            <FontAwesomeIcon icon={faBullseye} className='mr-2' />
                            My goals
                        </button>
                        
                        {!edit && (
                            <>
                            <button 
    onClick={() => setOpenPasswordReset(true)} 
    className='bg-healthyOrange hover:bg-healthyDarkOrange px-3 mb-1 py-1 rounded-lg'
>
    <FontAwesomeIcon icon={faKey} className='pr-2'/>
    Edit password
</button>
                                <button 
                                    onClick={()=>setDeleteAc(true)} 
                                    className='bg-healthyGray1 hover:bg-healthyDarkGray1 px-3 mb-1 py-1 rounded-lg ml-1'
                                >
                                    <FontAwesomeIcon icon={faTrash} className='pr-2'/>
                                    Delete account
                                </button>
                            </>
                        )}
                    </div>

                    {message && (
                        <div className='w-11/12 lg:w-2/3 mb-3'>
                            <p className={`font-quicksand text-sm font-bold py-2 px-4 rounded-md text-center ${
                                message.includes('successfully') 
                                    ? 'text-green-700 bg-green-100' 
                                    : 'text-red-700 bg-red-100'
                            }`}>
                                {message}
                            </p>
                        </div>
                    )}

                    <div className='flex flex-wrap w-11/12 lg:w-2/3 font-quicksand'>
                        {edit ? (
                            user && <div className="flex flex-col w-full px-2 md:max-h-[400px] overflow-y-auto">
                                <Input
                                    required={inValidation && name === ''}
                                    label="Name"
                                    inputType="text"
                                    inputValue={name}
                                    placeholder={user.name}
                                    onChange={(e) => handleTextInputChange(e.target.value, setName, setNameError)}
                                />
                                {nameError && <p className="text-red-500 text-xs mb-2">{nameError}</p>}

                                <Input
                                    required={inValidation && surname === ''}
                                    label="Surname"
                                    inputType="text"
                                    inputValue={surname}
                                    placeholder={user.surname}
                                    onChange={(e) => handleTextInputChange(e.target.value, setSurname, setSurnameError)}
                                />
                                {surnameError && <p className="text-red-500 text-xs mb-2">{surnameError}</p>}

                                <Input
                                    required={inValidation && birthDate === ''}
                                    label="Date of birth"
                                    inputType="date"
                                    inputValue={birthDate}
                                    onChange={(e) => setBirthDate(e.target.value)}
                                />

                                <Input 
                                    required={inValidation && weight===''} 
                                    label="Weight (kg)" 
                                    inputType="number" 
                                    inputValue={weight} 
                                    placeholder={user.weight} 
                                    onChange={handleWeightChange}
                                />

                                <Input 
                                    required={inValidation && height===''} 
                                    label="Height (cm)" 
                                    inputType="number" 
                                    inputValue={height} 
                                    placeholder={user.height} 
                                    onChange={handleHeightChange}
                                />
                            </div>
                        ) : (
                            user && <div className="flex flex-wrap w-full px-2 justify-around items-center">
                                <DataUser label="Name" value={name} />
                                <DataUser label="Surname" value={surname} />
                                <DataUser label="Date of birth" value={birthDate} />
                                <DataUser label="Weight" value={`${weight} kg`} />
                                <DataUser label="Height" value={`${height} cm`} />
                                <div className="w-full px-2 mt-6">
                                    {renderAchievements()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className='flex md:absolute z-0 bottom-0 right-0 w-screen h-screen'>
                    <div className='flex justify-end items-end w-full h-full z-0'>
                        <img src={userImg} alt='Background image photo' className='md:w-3/5 lg:w-1/3 w-full z-0' />
                    </div>
                </div>
            </div>}
            {deleteAc && <PopUp setDeleteAc={setDeleteAc} />}
            {openGoals && <Goals user={user} setUser={setUser} editGoals={editGoals}/>}
            {openPasswordReset && <PasswordResetPopUp setOpenPasswordReset={setOpenPasswordReset} setMessage={setMessage} />}
        </div>
    )
}

export default UserProfile