import Login from './pages/Login/Login';
import ResetPassword from './pages/ResetPassword/ResetPassword';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebaseConfig';
import Home from './pages/Home/Home';
import NavBar from './components/NavBar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import UserProfile from './pages/UserProfile/UserProfile';
import Category from './pages/Category/Category';
import Dashboard from './pages/Dashboard/Dashboard';
import { Plates } from './pages/Plates/Plates';
import { Drinks } from './pages/Drinks/Drinks';
import Planner from './pages/Planner/Planner';
import { Community } from './pages/Community/Community';
import { createContext, useEffect, useState } from 'react';
import { fetchUser, getIdToken, getUserNotification, markNotificationAsRead } from './firebaseService';
import NotificationPopup from './components/NotificationPopup';
import ProtectedRoute from './components/ProtectedRoute';

export const UserContext = createContext(null);

function App() {
  const [token, setToken]=useState(null)
  const [user]=useAuthState(auth);
  const [user_id, setUser_id]= useState(null)
  const [notifications, setNotifications] = useState([]);
  const fetchNotification=async()=>{
    const fetchedNotifications = await getUserNotification(user_id);
    setNotifications(fetchedNotifications || []);
  }

  const handleDismissNotification = async (notificationId) => {
      try {
          await markNotificationAsRead(notificationId);
          setNotifications(notifications.filter(notif => notif.id !== notificationId));
      } catch (err) {
          console.error("Error dismissing notification:", err);
      }
  };

  const get_token=async()=>{
    try {
      const token = await getIdToken();
      setToken(token);
    } catch (err) {
      console.error("Error obteniendo el token:", err);
    }
  }

  useEffect(() => {
    console.log("USEEER ", user_id)
    if (user) {
      get_token();
      setUser_id(user.uid);
    } else {
      setUser_id(null);
    }
  }, [user]);

  useEffect(() => {
    console.log('user_id ', user_id)
    if (user_id && token) {
      fetchNotification();
    }
  }, [user_id, token]);

  return (
    <UserContext.Provider value={{user_id, setUser_id}} >
      <Router>
        {user_id && notifications.length> 0 && <NotificationPopup notifications={notifications} onDismiss={handleDismissNotification}/>}
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/resetPassword" element={<ResetPassword />} />

          <Route path="/home" element={<ProtectedRoute element={<Home />}/>} />
          <Route path="/plates" element={<ProtectedRoute element={<Plates/>}/>} />
          <Route path="/drinks" element={<ProtectedRoute element={<Drinks/>}/>} />
          <Route path="/user-profile" element={<ProtectedRoute element={<UserProfile />} />} />
          <Route path="/category" element={<ProtectedRoute element={<Category/>} />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/community" element={<ProtectedRoute element={<Community />} />} />
          <Route path="/Planner" element={<ProtectedRoute element={<Planner/>} />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
