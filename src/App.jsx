import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './Components/Home/Home.jsx';
import SignUp from './Components/Auth/SignUp.jsx';
import SignIn from './Components/Auth/SignIn.jsx';
import ForgetPassword from './Components/Auth/ForgetPassword.jsx';
import Profile from './Components/Profile/Profile.jsx';
import UpdateProfile from './Components/Profile/UpdateProfile.jsx';
import ChangePassword from './Components/Profile/ChangePassword.jsx';
import Page from './Components/Page.jsx';
import AddServerMembers from './Components/AddMembers/AddServerMembers.jsx';
import OthersProfile from './Components/Profile/OthersProfile.jsx';
import { Loader } from './Components/Layout/Loader.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import AboutUs from './Components/About/AboutUs.jsx';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log(process.env.REACT_APP_IMG, /n process.env.REACT_APP_API_KEY, /n process.env.REACT_APP_AUTH_DOMAIN, /n process.env.REACT_APP_PROJECT_ID, /n process.env.REACT_APP_STORAGE_BUCKET, /n process.env.REACT_APP_MESSAGING_SENDER_ID, /n process.env.REACT_APP_APP_ID, /n process.env.REACT_APP_MEASUREMENT_ID, /n process.env.REACT_APP_DATABASE_URL, /n process.env.REACT_APP_SERVER, /n process.env.REACT_APP_SERVER_PHOTO, /n process.env.REACT_APP_SERVER_NAME, /n process.env.REACT_APP_SERVER_ADMIN, /n process.env.REACT_APP_WEBSOCKET_URL, /n process.env.LIVEKIT_API_KEY, /n process.env.LIVEKIT_API_SECRET)

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <ChakraProvider>
      <Router>
        {loading ? (
          <Loader />
        ) : (
          <Routes>
            <Route path='/' element={<Home/>}/>
            
            <Route path='/mypage' element={<Page />} />
            <Route
              path='/signup'
              element={!isAuthenticated ? <SignUp /> : <Navigate to="/mypage" replace />}
            />
            <Route
              path='/signin'
              element={!isAuthenticated ? <SignIn /> : <Navigate to="/mypage" replace />}
            />
            <Route
              path='/forget-password'
              element={!isAuthenticated ? <ForgetPassword /> : <Navigate to="/profile" replace />}
            />
            <Route
              path='/profile'
              element={isAuthenticated ? <Profile /> : <Navigate to="/signin" replace />}
            />
            <Route
              path='/updateprofile'
              element={isAuthenticated ? <UpdateProfile /> : <Navigate to="/signin" replace />}
            />
            <Route
              path='/changepassword'
              element={isAuthenticated ? <ChangePassword /> : <Navigate to="/signin" replace />}
            />
            <Route path="/server/:serverId" element={<AddServerMembers />} />
            <Route path="/otherprofile/:userID" element={<OthersProfile />} />

            <Route path="/aboutus" element={<AboutUs/>} />
          </Routes>
        )}
      </Router>
    </ChakraProvider>
  );
}

export default App;
