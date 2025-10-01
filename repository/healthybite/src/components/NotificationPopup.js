import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const NotificationPopup = ({ notifications, onDismiss }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 w-1/3 bg-hbGreen p-4 rounded shadow-lg z-50">
            <h2 className="font-semibold font-quicksand">Notifications</h2>
            {notifications.map((notification) => (
                <div key={notification.id} className="flex justify-between items-center mt-2">
                    <p className="text-sm font-quicksand">{notification.message}</p>
                    <FontAwesomeIcon
                        icon={faXmark}
                        className="cursor-pointer text-healthyGreen ml-2"
                        onClick={() => onDismiss(notification.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationPopup;

