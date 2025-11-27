import React, { useState } from 'react';
import { auth } from '../../../firebaseConfig';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth'; 

const PasswordResetPopUp = ({ setOpenPasswordReset, setMessage }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const user = auth.currentUser;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!user) {
            setError('No user is currently logged in.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setMessage('Password updated successfully!');
            setOpenPasswordReset(false);

        } catch (err) {
            console.error(err);
            let errorMessage = 'An error occurred. Please try again.';

            if (err.code === 'auth/wrong-password') {
                errorMessage = 'The current password you entered is incorrect.';
            } else if (err.code === 'auth/requires-recent-login') {
                errorMessage = 'Your login session is too old. Please log out and log in again to change your password.';
            } else if (err.code === 'auth/weak-password') {
                errorMessage = 'The new password is too weak.';
            }
            
            setError(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-96">
                <h3 className="text-lg font-bold mb-4">Change Password</h3>
                <form onSubmit={handleSubmit}>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setOpenPasswordReset(false)}
                            className="px-4 py-2 text-sm font-medium rounded-md bg-gray-200 hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium rounded-md text-white bg-healthyOrange hover:bg-healthyDarkOrange"
                        >
                            Update Password
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordResetPopUp;