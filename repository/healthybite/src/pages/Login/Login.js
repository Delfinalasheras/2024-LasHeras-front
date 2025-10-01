import React, {useState,useEffect} from "react";
import loginImg from '../../assets/login.jpg'
import loginMobile from '../../assets/loginMobile.png'
import Input from "../../components/Input";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,sendPasswordResetEmail ,fetchSignInMethodsForEmail} from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { auth,firestore } from '../../firebaseConfig';
import {handleInputChange} from '../inputValidation';
function Login() {
    const [inValidation,setInValidation]=useState(false)
    const [signUp, setSignUp]=useState(false)
    const [message, setMessage]=useState(false)
    const [resetpasswordMessage, setResetPasswordMessage]=useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [surname, setSurname] = useState('');
    const [weight, setWeight] = useState();
    const [birthDate, setBirthDate] = useState('');
    const [height, setHeight] = useState();
    const [name, setName] = useState('');
    const [infoOk, setInfoOk]=useState(false);
    const [forgot, setForgot]=useState(false);
    const [loginError, setLoginError] = useState('');

    const handleWeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setWeight);
    };
    
    const handleHeightChange = (e) => {
        handleInputChange(e.target.value, 0, 500, setHeight);
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
            await sendPasswordResetEmail(auth, email);
            setResetPasswordMessage('Password reset email sent!, please check your inbox');
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
            return; 
        }

        const birthDateObj = new Date(birthDate);
        const today = new Date();
        if (birthDateObj >= today) {
            setMessage("Check the birth date");
            return; 
        }

        if(password !== confirmPw) {
            setMessage("Passwords do not match")
            return 
        }

        if(password.length<6){
            setMessage("Password should be at least 6 characters")
            return
        }

    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        handleValidation();

        try {
            // 1. Registrar al usuario en Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log(userCredential.user)
    
            // 2. Agregar el nuevo usuario a la colección "User" en Firestore
            await addDoc(collection(firestore, 'User'), {
            id_user: user.uid,  // ID único del usuario generado por Firebase Auth
            name: name,
            surname: surname,
            weight: parseInt(weight),
            height: parseInt(height),
            birthDate: birthDate,
            goals:{
                calories:0,
                sodium:0,
                protein:0,
                carbohydrates:0,
                fats:0,
                sugar:0,
                caffeine:0,
            },
            validation: 0,
            achievements: [],

            });
    
            console.log('Usuario registrado y agregado a Firestore:', user.uid);
        } catch (error) {
            console.error('Error al registrar usuario o agregar a Firestore:', error);
        }

    };
    

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            console.log('Inicio de sesión exitoso:', userCredential.user);

            const userData = await getUserData(token);
            console.log('Fetched user data from backend:', userData);

          } catch (error) {
            console.error('Error al iniciar sesión:', error);
            setLoginError('Invalid Email or Password, please try again')

        }}
        const getUserData = async (token) => {
            const response = await fetch("http://127.0.0.1:8000/api/user", {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"  
              }
            });
          
            const data = await response.json();
            return data;
          };

    return (
        <div className="  bg-healthyGray h-screen flex justify-center items-center  ">
            {window.innerWidth<640 ? 
            <img src={loginMobile} alt="Login" className=" h-full w-full z-0 relative object-cover" />
            :
            <img src={loginImg} alt="Login" className="w-full h-full z-0 relative object-cover" />
            }
            <div className={`bg-healthyGray w-full sm:w-2/5 lg:w-2/5 xl:w-5/12 absolute flex  sm:left-20 lg:left-40 top-64 flex-col  ${signUp ? ' sm:top-12 md:top-20 xl:top-12':'  sm:top-40'} `} >
                <div className={`flex  h-full  sm:mt-0 w-3/5 px-12 xs:px-16 sm:px-0   w-full flex-col `}>
                    <h1 className= {`font-belleza text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-darkGray ${forgot ? 'text-center':'text-left'}`}>Healthy Bite</h1>
                    
                    {signUp ? (
                        <div classname='  w-full '>
                            <div className="sm:mt-6 flex flex-col bg-healthyGray w-full sm:max-h-[580px] md:max-h-[550px]    lg:max-h-[500px] xl:max-h-[430px] 2xl:max-h-[500px]  sm:overflow-y-auto  lg:max-w-[400px] ">
                                <div className="flex w-full bg-healthyGray sm:sticky sm:top-0">
                                    <button onClick={()=>{setSignUp(false); setPassword('')} } className="font-quicksand  bg-healthyGreen p-2   w-full rounded-xl  text-white font-semibold my-4 hover:bg-healthyDarkGreen">Go Back to Login</button>
                                </div>
                                <div className="flex flex-col w-full px-2">
                                    <Input required={inValidation && name===''} label="Name" inputType="text" inputValue={name} placeholder="Jane" onChange={(e)=>setName(e.target.value)} />
                                    <Input required={inValidation && surname===''} label="Surname" inputType="text" inputValue={surname} placeholder="Doe" onChange={(e)=>setSurname(e.target.value)} />
                                    <Input required={inValidation && email===''} label="Email" inputType="email" inputValue={email} placeholder="jane@example.com" onChange={(e)=>setEmail(e.target.value)} />
                                    <Input required={inValidation && birthDate===''} label="Date of birth" inputType="date" inputValue={birthDate} placeholder="DD-MM-YYYY" onChange={(e)=>setBirthDate(e.target.value)} />
                                    <Input required={inValidation && weight <= 0}label="Weight" inputType="number" inputValue={weight} placeholder="e.g., 70 kg" onChange={handleWeightChange}/>
                                    {inValidation && weight < 0 && <p className='text-red-500 text-xs'>weight must be a positive number.</p>}
                                    {inValidation && weight >= 500 && <p className='text-red-500 text-xs'>weight must be under 600kg.</p>}
                                    <Input required={inValidation && height <= 0} label="Height" inputType="number" inputValue={height} placeholder="e.g., 170 cm" onChange={handleHeightChange}/>
                                    {inValidation && height < 0 && <p className='text-red-500 text-xs'>height must be a positive number.</p>}
                                    {inValidation && height >= 500 && <p className='text-red-500 text-xs'>height must under 600cm.</p>}
                                    <Input required={inValidation && password===''} label="Password" inputType="password" inputValue={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                                    <Input required={inValidation && confirmPw===''} label="Confirm password" inputType="password" inputValue={confirmPw} placeholder="Password" onChange={(e) => setConfirmPw(e.target.value)} />
                                </div>
                                <div className="flex sm:sticky sm:bottom-0 bg-healthyGray flex-col-reverse sm:flex-row justify-between items-center">
                                    <button onClick={handleSubmit} className="font-quicksand bg-healthyOrange p-2 w-full  rounded-xl  text-white font-semibold mb-12 sm:my-4 hover:bg-healthyDarkOrange">Submit</button>
                                    {message && <p className="font-quicksand underline underline-offset-4 text-sm font-semibold p-1 rounded-md text-healthyOrange">{message}</p>}
                                </div>
                            </div>
                        </div>)
                    : ( forgot ?
                        (
                        <div className="w-full flex justify-center items-center">
                            <div className="flex flex-col  w-full px-0 xs:px-8 xs:px-0 sm:w-1/3 sm:w-full sm:max-w-[450px]  my-8">
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
                        :(<div className="w-full lg:w-2/3 ">
                            <div className="sm:mt-6 flex flex-col">
                                {inValidation && !infoOk && <p className="font-quicksand mt-4 sm:mt-0 text-sm font-semibold bg-darkGray text-white p-1 rounded-md text-center">{message}</p>}
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
