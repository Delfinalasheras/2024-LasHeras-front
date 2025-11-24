import React, { useState } from "react";
import bgImage from '../../assets/bgImage.jpg';
import bgImageMobile from "../../assets/bgImageMobile.jpg";
import Input from "../../components/Input";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "../../firebaseConfig";

function ResetPassword() {
  const [validation, setValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode");

  const handleResetPassword = async () => {
    setValidation(true);
    if (!password || !confirmPw) {
      setMessage("Please fill in both fields.");
      return;
    }
    if (password !== confirmPw) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!oobCode) {
      setMessage("Invalid or expired reset link.");
      return;
    }

    try {
      setLoading(true);
      await confirmPasswordReset(auth, oobCode, password);
      setMessage("Password reset successful! Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      console.error(error);
      if (error.code === "auth/invalid-action-code") {
        setMessage("The reset link is invalid or has expired.");
      } else {
        setMessage(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex justify-center items-center relative">
      {window.innerWidth < 640 ?
        <img src={bgImageMobile} alt='ResetPassword' className="relative w-full h-full object-cover z-0" />
        : <img src={bgImage} alt='ResetPassword' className="relative w-full h-full object-cover z-0" />}
      <div className="flex flex-col justify-center items-center absolute sm:pl-4 md:pl-8 w-2/3 sm:w-1/3 lg:w-1/4 sm:mt-12">
        <p className="font-belleza text-center text-2xl md:text-3xl text-darkGray">Healthy Bite</p>
        {message && <p className="font-quicksand p-2 my-2 bg-healthyDarkOrange text-white text-sm">{message}</p>}

        <Input
          required={validation && password === ''}
          label="New Password"
          inputType="password"
          inputValue={password}
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          required={validation && confirmPw === ''}
          label="Confirm Password"
          inputType="password"
          inputValue={confirmPw}
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPw(e.target.value)}
        />
        <div className="w-full flex flex-col items-center md:items-end">
          <button
            onClick={handleResetPassword}
            className="font-quicksand text-white text-sm mt-3 py-2 px-4 rounded-md bg-healthyGreen hover:bg-healthyDarkGreen"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
