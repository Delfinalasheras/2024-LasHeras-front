import { useAuthState } from "react-firebase-hooks/auth";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";
import Loading from "./Loading";

const ProtectedRoute = ({ element}) => {
    const [user, loading]=useAuthState(auth)

    if(loading){
        return <Loading />
    }
    return user ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;