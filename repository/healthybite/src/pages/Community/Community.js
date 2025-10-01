import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import NavBar from '../../components/NavBar';
import NotificationPopup from '../../components/NotificationPopup'; // Corrected path
import Card from './components/Card';
import { getPublicPlates, getUserNotification, markNotificationAsRead } from '../../firebaseService';
import Loading from "../../components/Loading";

export const Community = () => {
    const [plates, setPlates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [notifications, setNotifications] = useState([]);

    const fetchPublicPlatesAndNotifications = async () => {
        try {
            const fetchedPlates = await getPublicPlates();
            setPlates(fetchedPlates || []);

            const fetchedNotifications = await getUserNotification();
            setNotifications(fetchedNotifications || []);
        } catch (err) {
            console.error("Error fetching plates or notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublicPlatesAndNotifications();
    }, []);

    const handleDismissNotification = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(notifications.filter(notif => notif.id !== notificationId));
        } catch (err) {
            console.error("Error dismissing notification:", err);
        }
    };

    const filteredPlates = plates.filter(plate =>
        plate.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-screen w-full overflow-y-hidden">
            <NavBar />
            {loading ? (
                <Loading />
            ) : (
                <div className="w-full h-full flex flex-col items-center overflow-y-scroll font-quicksand mt-4 sm:mt-16 md:mt-16 lg:mt-24 pb-32">
                    <div className="w-full justify-center flex sticky top-0 z-10 bg-white ">
                        <input
                            type="text"
                            placeholder="Search plates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-2/3 p-2 border border-gray-300 font-quicksand rounded mb-4"
                        />
                    </div>
                    {/* Notification Popup */}
                    {notifications.length > 0 && (
                        <NotificationPopup
                            notifications={notifications}
                            onDismiss={handleDismissNotification}
                        />
                    )}
                    
                    <div className="w-full flex flex-wrap justify-center">
                        {filteredPlates.length > 0 ? (
                            filteredPlates.map((item, index) => (
                                <Card key={index} plate={item} review={item.review} />
                            ))
                        ) : (
                            <p>No plates available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

