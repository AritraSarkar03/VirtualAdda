import {
  Container,
  Heading,
  HStack,
  VStack,
  FormLabel,
  Input,
  Button,
  Box,
  Divider,
  useToast
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../../firebase.js';
import { FcGoogle } from 'react-icons/fc';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const provider = new GoogleAuthProvider();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Signed In",
        description: "You have successfully signed in!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  const googleSigninHandler = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log(user)
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          avatar: user.photoURL,
          servers: [],
          friends: [],
          requests: [],
          requested: []
        });
      }

      toast({
        title: "Account Created.",
        description: "You have successfully signed up with Google!",
        status: "success",
        duration: 1500,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        status: "error",
        duration: 1500,
        isClosable: true,
      });
    }
  };

  return (
   <Container h={'95vh'}>
      <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
        <Heading children={'Welcome to VirtualAdda'} /> 
        <form onSubmit={submitHandler} style={{ width: '100%' }}>
          <Box my={'4'}>
            <FormLabel htmlFor="email" children={'Email Address'} />
            <Input
              required
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={'Enter your Email'}
              type="email"
              focusBorderColor="blue.500"
            />
          </Box>
          <Box my={'4'}>
            <FormLabel htmlFor="password" children={'Password'} />
            <Input
              required
              id="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={'Enter the Password'}
              type="password"
              focusBorderColor="blue.500"
            />
          </Box>
          <Box>
            <Link to="/forget-password">
              <Button
                variant={'link'}
                fontSize={'sm'}
                children={'Forget password?'}
              />
            </Link>
          </Box>
          <Button colorScheme="blue" my={'4'} type="submit" width={'full'}>
            Sign In
          </Button>
          {/* Divider with "OR" */}
          <HStack my="4">
            <Divider />
            <Box>OR</Box>
            <Divider />
          </HStack>

          {/* Google Sign-Up Button */}
          <Button
            variant="outline"
            my={'4'}
            width="full"
            onClick={googleSigninHandler}
            leftIcon={<FcGoogle />}
          >
            Continue with Google
          </Button>
          <Box>
            New User?{' '}
            <Link to="/signup">
              <Button variant={'link'} colorScheme="blue" children={'Sign Up'} />
            </Link>{' '}
            here
          </Box>
        </form>
      </VStack>
    </Container>
  );
};

export default SignIn;
