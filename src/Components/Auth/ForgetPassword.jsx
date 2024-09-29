// ForgetPassword.js
import React, { useState } from 'react';
import { Container, Heading, FormLabel, Input, Button, useToast } from '@chakra-ui/react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase';

const ForgetPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setEmail('');
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred: ${error.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Container h="90vh" py="16">
      <form onSubmit={submitHandler}>
        <Heading my="16" textAlign={['center', 'left']}>Forget Password</Heading>
        <FormLabel htmlFor="email">Email Address</FormLabel>
        <Input
          required
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your Email"
          type="email"
          focusBorderColor="blue.500"
        />
        <Button isLoading={loading} w="full" colorScheme="blue" my="4" type="submit">
          Send Reset Link
        </Button>
      </form>
    </Container>
  );
};

export default ForgetPassword;
