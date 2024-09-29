import React, { useState, useEffect } from 'react';
import { Container, Heading, Input, Button, VStack, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const UpdateProfile = ({ user }) => {
  // Initialize with empty strings or fallback values
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Use useEffect to handle user prop changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await updateProfile(currentUser, { displayName: name });
        await updateDoc(doc(db, 'users', currentUser.uid), { name, email });
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        navigate('/profile');
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxW="md" py="8" px={{ base: "4", md: "8" }}>
      <form onSubmit={submitHandler}>
        <Heading
          mb={'8'}
          textAlign={'center'}
          fontSize="3xl"
          color="blue.600"
          textTransform={'uppercase'}
        >
          Update Profile
        </Heading>

        <VStack spacing={'6'} align="stretch">
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={'Enter Name'}
            type="text"
            focusBorderColor="blue.500"
            size="lg"
          />
          <Input
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={'Enter Email'}
            type="email"
            focusBorderColor="blue.500"
            size="lg"
          />
          <Button
            isLoading={loading}
            w='full'
            colorScheme='blue'
            size="lg"
            type='submit'
          >
            Update Profile
          </Button>
        </VStack>
      </form>
    </Container>
  );
};

export default UpdateProfile;
