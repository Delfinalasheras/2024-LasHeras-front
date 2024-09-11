import React from "react";

function Input({required,label,inputType,inputValue,placeholder, onChange}) {

    return (
        <div className="flex flex-col my-2 w-full">
            <div className="flex flex-col md:flex-row justify-between">
                <p className="font-quicksand text-start text-sm font-bold text-darkGray">{label}</p>
                {required && <p className="font-quicksand mt-2 md:mt-0 text-xs md:text-sm text-healthyDarkOrange font-semibold">This field is required</p>}
            </div>
            
            <input placeholder={placeholder} type={inputType} value={inputValue} onChange={onChange} className={`focus:outline-none focus:ring focus:ring-healthyGreen decoration-none bg-white p-1 md:p-2 rounded-md md:rounded-xl font-quicksand my-1 text-sm md:text-md ${required ? 'ring ring-healthyDarkOrange' : '' }`} />
        </div>
    );
}

export default Input;
