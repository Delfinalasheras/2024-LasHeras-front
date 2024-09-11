import React,{useState} from "react";
import bgImage from '../../assets/bgImage.jpg'
import bgImageMoble from "../../assets/bgImageMobile.jpg"
import Input from "../../components/Input";
import { useParams,useLocation } from 'react-router-dom';

function ResetPassword() {
    const location = useLocation();
    const { token } = useParams(); // recibe el token por parametro
    const [password, setPassword] = useState('');
    const [confirmPw, setConfirmPw] = useState('');
    const [validation, setValidation]=useState(false)
    const [message, setMessage]=useState('')
    const [loading, setLoading] = useState(false);

    const handleValidation = async () => {
        setValidation(true);
        
        if (password === confirmPw && password !== '') {
            setMessage("Everything OK!");
            setLoading(true);
            
            try {
                const response = await fetch('http://localhost:8000/reset-password/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token, 
                        new_password: password
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage("Password reset successfully!");
                } else {
                    setMessage(data.detail || "Something went wrong!");
                }

            } catch (error) {
                console.error('Error:', error);
                setMessage("An error occurred. Please try again later.");
            } finally {
                setLoading(false);
            }
        } else { 
            setMessage("Passwords do not match");
        }
    }

    return (
        <div className="h-screen flex justify-center items-center relative">
            {window.innerWidth<640 ? 
                <img src={bgImageMoble} alt='ResetPassword' className=" relative  w-full h-full object-cover z-0" />
            :<img src={bgImage} alt='ResetPassword' className=" relative  w-full h-full object-cover z-0" />}
            <div className="flex  flex-col justify-center md:justify-start items-center md:items-start absolute sm:pl-4 md:pl-8 lg:pl-0 w-2/3 sm:w-1/3 lg:w-1/4 sm:mt-12 sm:pr-12 md:pr-16    ">
                <p className=" font-belleza text-center md:text-start text-2xl md:text-3xl lg:text-4xl text-darkGray">Healthy Bite</p>
                {message && <p className="font-quicksand w-full p-1 rounded-md my-2 bg-healthyDarkOrange text-center text-white font-semibold text-sm">{message}</p>}
                <Input required={ validation && password===''} label="New Password" inputType="password" inputValue={password} placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
                <Input required={ validation && confirmPw===''} label="Confirm password" inputType="password" inputValue={confirmPw} placeholder="Password" onChange={(e) => setConfirmPw(e.target.value)} />
                <div className="flex flex-col items-center md:items-end justify-center w-full">
                <button 
                        onClick={handleValidation} 
                        className="font-quicksand text-white font-semibold text-sm lg:text-md mt-3 p-1 rounded-md bg-healthyGreen hover:bg-healthyDarkGreen"
                        disabled={loading}
                    >
                        {loading ? 'Resetting...' : 'Reset new password'}
                    </button>
                </div>
                
            </div>
            
        </div>
    );
}

export default ResetPassword;
