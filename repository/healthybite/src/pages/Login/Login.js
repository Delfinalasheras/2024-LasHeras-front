import React, {useState,useEffect, useContext} from "react";
import loginImg from '../../assets/login.jpg'
import loginMobile from '../../assets/loginMobile.png'
import Input from "../../components/Input";
import { forgotPassword, loginUser, registerUser } from "../../firebaseService";
import { Navigate, useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import ResetPassword from "../ResetPassword/ResetPassword";

function Login() {
    const [inValidation,setInValidation]=useState(false)
    const [signUp, setSignUp]=useState(false)
    const [message, setMessage]=useState(false)
    const [resetpasswordMessage, setResetPasswordMessage]=useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [surname, setSurname] = useState('');
    const [weight, setWeight] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [height, setHeight] = useState('');
    const [name, setName] = useState('');
    const [infoOk, setInfoOk]=useState(false);
    const [forgot, setForgot]=useState(false);
    const [loginError, setLoginError] = useState('');
    const {setUser_id}=useContext(UserContext)
    const navigate=useNavigate()

    const handleWeightChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setWeight('');
        } else {
            const numValue = parseFloat(value);
            setWeight(isNaN(numValue) ? '' : Math.max(0, numValue));
        }
    };
    
    const handleHeightChange = (e) => {
        const value = e.target.value;
        if (value === '') {
            setHeight('');
        } else {
            const numValue = parseFloat(value);
            setHeight(isNaN(numValue) ? '' : Math.max(0, numValue));
        }
    };
    
    
    useEffect(() => {
        // Clear messages and form fields when component mounts or when navigating
        setName('')
        setSurname('')
        setWeight('')
        setHeight('')
        setBirthDate('')
        setEmail('')
        setPassword('')
        setConfirmPw('')
        setLoginError('');
        setMessage('');
        setInValidation(false);
        setResetPasswordMessage('')
    }, [signUp],[forgot]); 

    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const msg = await forgotPassword(email);
            setResetPasswordMessage('Password reset email sent!, please check your inbox');
            setTimeout(() => {
                setResetPasswordMessage('');
            }, 5000); 
        } catch (error) {
            console.error('Error during password reset:', error);
            setResetPasswordMessage('Error: ' + error.message);
        }
    };

    const handleValidation=()=> {
        setInValidation(true);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMessage("Invalid email address");
            return false; 
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        if (birthDateObj >= today) {
            setMessage("Check the birth date");
            return false; 
        }
        const maxAgeLimit = 110;
        const minBirthDate = new Date();
        minBirthDate.setFullYear(today.getFullYear() - maxAgeLimit);
        
        if (birthDateObj < minBirthDate) {
            setMessage(`Date of birth is not valid. Maximum age is ${maxAgeLimit} years.`);
            return false;
        }
        const nameSurnameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
        if (!nameSurnameRegex.test(name) || !nameSurnameRegex.test(surname)) {
            setMessage("Name and surname should only contain letters, spaces, apostrophes, or hyphens.");
            return false;
        }

        if(password !== confirmPw) {
            setMessage("Passwords do not match")
            return false 
        }

        if(password.length<6){
            setMessage("Password should be at least 6 characters")
            return false
        }

        // Check if weight is empty or not positive
        if (!weight || parseFloat(weight) <= 0) {
            setMessage("Weight must be a positive number");
            return false;
        }

        // Check if height is empty or not positive
        if (!height || parseFloat(height) <= 0) {
            setMessage("Height must be a positive number");
            return false;
        }

        return true

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rta=handleValidation();
        if(rta){
            try {
                
                setMessage('Creating new user...')
                const user_id = await registerUser(email, password, name, surname, parseFloat(weight), parseFloat(height), birthDate)
                user_id && navigate("/home")
            } catch (error) {
                switch (error.code) {
                    case "auth/email-already-in-use":
                        setMessage("Email is already in use.");
                        break;
                    case "auth/invalid-email":
                        setMessage("Invalid email format.");
                        break;
                    case "auth/weak-password":
                        setMessage("Password is too weak. Use at least 6 characters.");
                        break;
                    case "auth/operation-not-allowed":
                        setMessage("Email/password authentication is not enabled.");
                        break;
                    case "auth/network-request-failed":
                        setMessage("Network error. Check your internet connection.");
                        break;
                    default:
                        setMessage("An unexpected error occurred. Please try again.");
                        break;
                }
            }
        }
    };
    

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const user_id = await loginUser(email,password)
            setUser_id(user_id)
            user_id && navigate("/home")
        } catch (error) {
            switch (error.code) {
                case "auth/invalid-email":
                    setMessage("Invalid email format.");
                    break;
                case "auth/user-disabled":
                    setMessage("This user account has been disabled.");
                    break;
                case "auth/user-not-found":
                    setMessage("No user found with this email.");
                    break;
                case "auth/wrong-password":
                    setMessage("Incorrect password.");
                    break;
                case "auth/network-request-failed":
                    setMessage("Network error. Check your internet connection.");
                    break;
                case "auth/invalid-credential":
                    setMessage("Invalid login credentials. Please check your email and password.");
                    break;
                default:
                    setMessage("Login failed. Please try again.")
                    break;
            }
        }
    }

    return (
        <div className="  bg-healthyGray h-screen flex justify-start sm:justify-center lg:justify-between items-center flex-col sm:flex-row-reverse  ">
            {window.innerWidth<640 ? 
            <div className="flex w-full max-h-[280px] items-start justify-start " >
                <img src={loginMobile} alt="Login" className="w-full object-cover" />
            </div>
            :
            <div className="flex  z-5 items-start justify-center lg:justify-end  h-screen w-full" >
                <img src={loginImg} alt="Login" className="h-full z-0 relative object-cover " />
            </div>
            }
            <div className={`bg-healthyGray w-full sm:w-3/5 lg:w-3/5   md:py-8 md:h-screen xl:w-5/12 sm:absolute flex sm:items-center justify-center  md:items-end sm:z-10 sm:left-0 sm:top-0 flex-col`} >
                <div className={`flex px-12 xs:px-16 sm:px-0  w-full xs:mt-12 sm:mt-0 sm:w-3/4 flex-col md:overflow-y-auto`}>
                    <h1 className= {`font-belleza text-4xl md:text-5xl  xl:text-7xl text-darkGray ${forgot ? 'text-center':'text-left'}`}>Healthy Bite</h1>
                    
                    {signUp ? (
                        <div className='  w-full   '>
                            <div className="sm:mt-6 flex flex-col bg-healthyGray w-full  sm:overflow-y-auto ">
                                <div className="flex w-full bg-healthyGray sm:sticky sm:top-0">
                                    <button onClick={()=>{setSignUp(false); setPassword('')} } className="font-quicksand  bg-healthyGreen p-2   w-full rounded-xl  text-white font-semibold my-4 hover:bg-healthyDarkGreen">Go Back to Login</button>
                                </div>
                                <div className="flex flex-col w-full px-2 ">
                                    <Input required={inValidation && name===''} label="Name" inputType="text" inputValue={name} placeholder="Jane" onChange={(e)=>setName(e.target.value)} />
                                    <Input required={inValidation && surname===''} label="Surname" inputType="text" inputValue={surname} placeholder="Doe" onChange={(e)=>setSurname(e.target.value)} />
                                    <Input required={inValidation && email===''} label="Email" inputType="email" inputValue={email} placeholder="jane@example.com" onChange={(e)=>setEmail(e.target.value)} />
                                    <Input required={inValidation && birthDate===''} max={new Date().toISOString().split('T')[0]} label="Date of birth" inputType="date" inputValue={birthDate} placeholder="DD-MM-YYYY" onChange={(e)=>setBirthDate(e.target.value)} />
                                    <Input required={inValidation && (!weight || parseFloat(weight) <= 0)} min="0" max="500"  label="Weight" inputType="number" inputValue={weight} placeholder="e.g., 70 kg" onChange={handleWeightChange}/>
                                    {inValidation && (!weight || parseFloat(weight) <= 0) && <p className='text-red-500 text-xs'>Weight must be a positive number.</p>}
                                    {inValidation && parseFloat(weight) >= 500 && <p className='text-red-500 text-xs'>Weight must be under 500kg.</p>}
                                    <Input required={inValidation && (!height || parseFloat(height) <= 0)} label="Height" min="0" max="500"   inputType="number" inputValue={height} placeholder="e.g., 170 cm" onChange={handleHeightChange}/>
                                    {inValidation && (!height || parseFloat(height) <= 0) && <p className='text-red-500 text-xs'>Height must be a positive number.</p>}
                                    {inValidation && parseFloat(height) >= 500 && <p className='text-red-500 text-xs'>Height must be under 500cm.</p>}
                                    <Input required={inValidation && password===''} label="Password" inputType="password" inputValue={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                                    <Input required={inValidation && confirmPw===''} label="Confirm password" inputType="password" inputValue={confirmPw} placeholder="Password" onChange={(e) => setConfirmPw(e.target.value)} />
                                </div>
                                <div className="flex sm:sticky sm:bottom-0 bg-healthyGray flex-col-reverse justify-between items-center pt-2">
                                    <button onClick={handleSubmit} className="font-quicksand bg-healthyOrange p-2 w-full  rounded-xl  text-white font-semibold mb-12 sm:my-4 hover:bg-healthyDarkOrange">Submit</button>
                                    {message && <p className="font-quicksand text-sm font-bold py-1 rounded-md text-red-500 bg-healthyBlue px-3 mb-1">{message}</p>}
                                </div>
                            </div>
                        </div>)
                    : ( forgot ?
                        (
                        <div className="w-full flex justify-center items-center">
                            <div className="flex flex-col  w-full px-0 xs:px-8 sm:w-full my-8">
                                <p className="font-quicksand font-semibold text-lg text-center text-darkGray ">Forgot your password?</p>
                                <p className="font-quicksand text-md text-center text-darkGray">If you have forgotten your password, please enter your email address below. We will send you a link to a page where you can easily create a new&nbsp;password.</p>
                                <Input required={inValidation && email===''} label="Email" inputType="email" inputValue={email} placeholder="jane@example.com" onChange={(e)=>setEmail(e.target.value)} />
                                <div className="flex flex-col items-center justify-center mt-3">
                                    {resetpasswordMessage && (<p className="font-quicksand text-sm font-semibold p-1 rounded-md text-healthyDarkGreen">{resetpasswordMessage}</p>)}
                                    <button onClick={handleResetPassword}   className="font-quicksand bg-healthyGreen hover:bg-healthyDarkGreen text-md text-white p-1 font-semibold rounded-md w-full xs:w-1/2 ">Send</button>
                                    <p onClick={()=>{setForgot(false); setPassword('');setLoginError('');} } className="font-quicksand text-healthyOrange hover:text-healthyDarkOrange underline hover:underline-offset-4 hover:cursor-pointer  font-bold text-md mt-3">Go back to Log in</p>
                                </div>
                            </div>
                        </div>
                        )
                        :(<div className="w-full  ">
                            <div className="sm:mt-6 flex flex-col">
                                {inValidation && !infoOk && <p className="font-quicksand mt-4 sm:mt-0 text-sm font-semibold bg-darkGray text-white p-1 rounded-md text-center">{message}</p>}
                                {message && <p className="font-quicksand mt-4 sm:mt-0 text-sm font-semibold bg-healthyBlue text-white p-1 rounded-md text-center">{message}</p>}
                                {loginError && (<p className="font-quicksand mt-4 text-sm font-semibold bg-red-200 text-red-600 p-1 rounded-md text-center">{loginError}</p>)}
                                <Input required={inValidation && email===''} label="Email" inputType="email" inputValue={email} placeholder="jane@example.com" onChange={(e)=>setEmail(e.target.value)} />
                                <Input required={inValidation && password===''} label="Password" inputType="password" inputValue={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                                <p onClick={()=>{setForgot(true);setEmail('');}} className="font-quicksand text-sm font-bold text-healthyDarkGreen mt-1 hover:cursor-pointer">I forgot my password</p>
                            </div>
                            <div className="flex justify-between flex-col xs:flex-row">
                                <button onClick={handleLogin} className="font-quicksand bg-healthyGreen p-1 md:p-2 w-full md:w-1/2 mr-2 rounded-md md:rounded-xl text-white font-semibold mt-2 md:my-4 hover:bg-healthyDarkGreen">Log in</button>
                                <button onClick={() => {
                                    setSignUp(true);
                                    setEmail('');   // Reiniciar el campo de correo electrónico
                                    setPassword(''); // Reiniciar el campo de contraseña
                                }} className="font-quicksand bg-healthyOrange p-1 md:p-2 w-full md:w-1/2 rounded-md md:rounded-xl text-white font-semibold mt-2 md:my-4 hover:bg-healthyDarkOrange">Sign up</button>
                            </div>

                        </div>)
                    )}
                </div>
                
            </div>
        </div>
    );
}

export default Login;

