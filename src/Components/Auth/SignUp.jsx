import {
  Container,
  Heading,
  VStack,
  FormLabel,
  Input,
  Button,
  Box,
  Avatar,
  useToast,
  HStack,
  Divider,
  Icon,
  AvatarBadge,
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db, storage } from '../../firebase.js';
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FcGoogle } from 'react-icons/fc';
import { FiPlus } from 'react-icons/fi';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imgPrev, setImgPrev] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false); // Loading state
  const toast = useToast();

  const provider = new GoogleAuthProvider();

  const changeImageHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImgPrev(reader.result);
        setImage(file);
      };
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload image to Firebase Storage in the "profile" folder
      const imageRef = ref(storage, `profile/${user.uid}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);
      console.log("img:",imageUrl);

      // Store user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        avatar: imageUrl,
        servers: [],
        friends: []
      });

      toast({
        title: "Account Created.",
        description: "You have successfully signed up!",
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
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const googleSignupHandler = async () => {
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
        <Heading children={'Register to VirtualAdda'} />
        <form style={{ width: '100%' }} onSubmit={submitHandler}>
          <Box my={'4'} display={'flex'} justifyContent={'center'} position="relative">
            <Avatar
              name={name}
              size="xl"
              src={imgPrev}
              cursor="pointer"
            >
              {imgPrev === '' && (
                <AvatarBadge boxSize="1em" bg="gray.500">
                  <Icon as={FiPlus} boxSize={3} />
                </AvatarBadge>
              )}
            </Avatar>

            <Input
              type="file"
              accept="image/*"
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              opacity={0}
              cursor="pointer"
              onChange={changeImageHandle}
            />
          </Box>

          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            required
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'Enter your name'}
            type="text"
            focusBorderColor="blue.500"
          />

          <FormLabel htmlFor="email">Email Address</FormLabel>
          <Input
            required
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={'Enter your Email'}
            type="email"
            focusBorderColor="blue.500"
          />

          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            required
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'Enter a Password'}
            type="password"
            focusBorderColor="blue.500"
          />

          <Button colorScheme="blue" my={'4'} type="submit" width="full" isLoading={loading}>
            Sign Up
          </Button>

          <HStack my="4">
            <Divider />
            <Box>OR</Box>
            <Divider />
          </HStack>

          <Button
            variant="outline"
            my={'4'}
            width="full"
            onClick={googleSignupHandler}
            leftIcon={<FcGoogle />}
          >
            Continue with Google
          </Button>

          <Box>
            Already a member?{' '}
            <Link to="/signin">
              <Button colorScheme="blue" variant="link">
                Sign in
              </Button>
            </Link>{' '}
            here
          </Box>
        </form>
      </VStack>
    </Container>
  );
};

export default SignUp;
