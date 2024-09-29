import React, { useEffect, useState } from 'react';
import { Box, Button, Heading, HStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase'; // Adjust the path as necessary
import { onAuthStateChanged } from 'firebase/auth';

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // Set to true if user is logged in
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <HStack
      p={2}
      justifyContent="space-between"
      alignItems="center"
      w={['100vw', '80vw']}  // 100vw for mobile, 80vw for larger screens
      mx="auto"
    >
      <Text as={'b'} fontSize={['xl', '2xl']} >VirtualAdda</Text>
      {isLoggedIn ? (
        <Box mr={2}>
          <Link to="/mypage">
            <Button
              bg='blue.500'
              borderRadius="3xl"
              padding="10px 20px">
              Go to Server
            </Button>
          </Link>
        </Box>
      ) : (
        <Link to="/signup">
          <Button
            bg='blue.500'
            borderRadius="3xl"
            padding="10px 20px">
            Sign Up
          </Button>
        </Link>
      )}
    </HStack>
  );
};

export default Header;
