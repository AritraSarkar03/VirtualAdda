import {
  Container,
  Heading,
  VStack,
  FormLabel,
  Input,
  Button,
  Box,
  useToast
} from '@chakra-ui/react';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust the path according to your project structure

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

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
          <Button colorScheme="blue" my={'4'} type="submit">
            Sign In
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
