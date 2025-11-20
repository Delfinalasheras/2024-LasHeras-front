import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faShoppingCart, faUtensils } from '@fortawesome/free-solid-svg-icons';
import { getShoppingList } from '../../../firebaseService';
import Lottie from 'lottie-react';
import shoppingAnimation from './shopping-animation.json'; // descargala y ponela aquí
const ShoppingList = ({ weekstart, setShowShoppingList, cachedData, setCachedData }) => {
    const [shoppingList, setShoppingList] = useState(cachedData || null);
    const [isLoading, setIsLoading] = useState(!cachedData);
    const [error, setError] = useState(null);

    useEffect(() => {
        // SI YA TENEMOS DATOS, NO HACEMOS NADA (Salimos de la función)
        if (cachedData) {
            return; 
        }

        const fetchShoppingList = async () => {
            setIsLoading(true); // Aseguramos que se vea el loading
            try {
                const data = await getShoppingList(weekstart);
                const validData = data && typeof data === "object" ? data : {};
                
                setShoppingList(validData);
                
                // GUARDAMOS EN EL PADRE PARA LA PRÓXIMA
                if (setCachedData) {
                    setCachedData(validData);
                }

            } catch (err) {
                console.error("Error al obtener la lista de compras:", err);
                setError("No se pudo cargar la lista de compras.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchShoppingList();
    }, [weekstart]);

    // ========== LOADING ANIMADO ==========
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-black/50 z-[100] flex justify-center items-center backdrop-blur-sm px-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-4">
                    <div className="w-40">
                        <Lottie animationData={shoppingAnimation} loop autoplay />
                    </div>
                    <p className="font-quicksand text-lg text-healthyDarkGray1">
                        Generating your shopping list…
                    </p>
                </div>
            </div>
        );
    }

    // ========== ERROR ==========
    if (error) {
        return (
            <div className="fixed inset-0 bg-black/50 z-[90] flex justify-center items-center backdrop-blur-sm px-4">
                <div className="bg-white p-6 rounded-3xl shadow-xl text-center">
                    <p className="text-red-600 font-quicksand">{error}</p>
                    <button
                        onClick={() => setShowShoppingList(false)}
                        className="mt-4 bg-gray-200 px-4 py-2 rounded-xl"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const listArray = shoppingList ? Object.values(shoppingList) : [];

    return (
        <div
            className="fixed inset-0 bg-black/50 z-[90] flex justify-center items-center backdrop-blur-sm px-4 animate-fadeIn"
            onClick={() => setShowShoppingList(false)} // ← click fuera cierra
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()} // ← evita cerrar cuando clickeas adentro
            >
                {/* Header */}
                <div className="bg-healthyOrange p-5 flex justify-between items-center">
                    <h3 className="text-white font-bold font-quicksand text-xl flex items-center gap-2">
                        <FontAwesomeIcon icon={faShoppingCart} /> Shopping List
                    </h3>
                    <button
                        onClick={() => setShowShoppingList(false)}
                        className="text-white opacity-70 hover:opacity-100 transition"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto flex-1">
                    {listArray.length === 0 ? (
                        <div className="text-center py-10 text-gray-500">
                            <FontAwesomeIcon icon={faUtensils} className="text-4xl mb-3" />
                            <p className="font-quicksand">
                                No meals planned for this week.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {listArray.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 hover:shadow-sm transition"
                                >
                                    <p className="font-quicksand font-semibold text-healthyDarkGray1 capitalize">
                                        {item.name}
                                    </p>
                                    <span className="font-bold text-healthyOrange bg-white px-3 py-1 rounded-lg text-sm">
                                        {Math.round(item.total_amount * 10) / 10} {item.measure}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default ShoppingList;

