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
import { Community } from './pages/Community/Community';

function App() {
  const [user]= useAuthState(auth)
  return (
    <Router>
        <Routes>
          <Route path="/" element={ user ? <Home /> : <Login />} />
          <Route path="/plates" element={<Plates/>}/>
          <Route path="/drinks" element={<Drinks/>}/>
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/category" element={<Category/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </Router>

  );
}

export default App;
