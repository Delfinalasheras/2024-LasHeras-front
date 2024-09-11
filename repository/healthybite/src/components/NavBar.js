import React from "react";
import { auth } from "../firebaseConfig";

function NavBar() {

    return (
        <div className=" top-0 sticky sm:absolute bg-healthyGreen shadow-xl py-3 w-full flex items-center justify-center">
            <div className="flex flex-row max-w-[800px] w-11/12 lg:w-full justify-between items-center ">
                <h1 className="font-belleza text-4xl text-white  ">Healthy Bite</h1>
                <button onClick={()=>auth.signOut()} className="font-quicksand font-semibold text-md text-white hover:text-hbGreen  underline-offset-2">Log out</button>
            </div>
        </div>
    );
}

export default NavBar;
