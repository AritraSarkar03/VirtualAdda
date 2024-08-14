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
} from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from '../../firebase';
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getToken } from 'firebase/messaging';
import { messaging } from '../../firebase';

export const fileUploadCss = {
  cursor: 'pointer',
  marginLeft: '-5%',
  width: '110%',
  border: 'none',
  height: '100%',
  color: '#800080',
  backgroundColor: 'white',
};

const fileUploadStyle = {
  '&::file-selector-button': fileUploadCss,
};

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [imgPrev, setImgPrev] = useState('');
  const [image, setImage] = useState(null);
  const toast = useToast();

  const changeImageHandle = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setImgPrev(reader.result);
      setImage(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Upload image to Firebase Storage in the "profile" folder
      const imageRef = ref(storage, `profile/${user.uid}`);
      await uploadBytes(imageRef, image);
      const imageUrl = await getDownloadURL(imageRef);

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
    }
  };


  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        console.log("Notification permission granted.");
        const token = await getToken(messaging, { vapidKey: "your-vapid-key" });
        console.log("FCM Token:", token);
        // Send the token to your backend to save it and use it for sending notifications
      } else {
        console.log("Notification permission denied.");
      }
    } catch (error) {
      console.error("Error getting notification permission:", error);
    }
  };


  requestNotificationPermission();

  return (
    <Container h={'95vh'}>
      <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
        <Heading children={'Register to LearnTube'} />

        <form style={{ width: '100%' }} onSubmit={submitHandler}>
          <Box my={'4'} display={'flex'} justifyContent={'center'}>
            <Avatar src={imgPrev} size={'2xl'} />
          </Box>

          <FormLabel htmlFor="name" children={'Name'} />
          <Input
            required
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={'Enter your name'}
            type="text"
            focusBorderColor="purple.500"
          />

          <FormLabel htmlFor="email" children={'Email Address'} />
          <Input
            required
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={'Enter your Email'}
            type="email"
            focusBorderColor="purple.500"
          />

          <FormLabel htmlFor="password" children={'Password'} />
          <Input
            required
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={'Enter a Password'}
            type="password"
            focusBorderColor="purple.500"
          />

          <Box my={'4'}>
            <FormLabel htmlFor="chooseAvatar" children="Choose Avatar" />
            <Input
              accept="image/*"
              onChange={changeImageHandle}
              required
              id="chooseAvatar"
              type="file"
              focusBorderColor="purple.500"
              css={fileUploadStyle}
            />
          </Box>

          <Button colorScheme="purple" my={'4'} type="submit">
            Sign Up
          </Button>
          <Box>
            Already a member?{' '}
            <Link to="/signin">
              <Button colorScheme="purple" variant="link">
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
