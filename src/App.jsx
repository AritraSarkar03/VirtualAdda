import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Home from './Components/Home/Home';
import SignUp from './Components/Auth/SignUp';
import SignIn from './Components/Auth/SignIn';
import ForgetPassword from './Components/Auth/ForgetPassword';
import Profile from './Components/Profile/Profile';
import UpdateProfile from './Components/Profile/UpdateProfile';
import ChangePassword from './Components/Profile/ChangePassword';
import Page from './Components/Page';
import AddServerMembers from './Components/AddMembers/AddServerMembers';
import OthersProfile from './Components/Profile/OthersProfile';
import { Loader } from './Components/Layout/Loader';
import { ChakraProvider, useColorMode } from '@chakra-ui/react';
import AboutUs from './Components/About/AboutUs';

const LightModeWrapper = ({ children }) => {
  // Hook to set the color mode to light
  const { setColorMode } = useColorMode();
  useEffect(() => {
    setColorMode('light'); // Set to light mode
  }, [setColorMode]);

  return <>{children}</>;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

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
            <Route
              path='/'
              element={
                <LightModeWrapper>
                  <Home />
                </LightModeWrapper>
              }
            />
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
