import React, { useEffect, useState } from 'react';
import Header from '../Layout/Header';
import { VStack, Text } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Replace this with a spinner or loading component
  }

  return (
    <VStack>
    <Header isAuthenticated={isAuthenticated} user={user} />
      <Text>Home</Text>
    </VStack>
  )
}

export default Home