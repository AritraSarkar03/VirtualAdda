import React, { useState, useEffect } from 'react';
import { Stack, Text, Container, Heading, Button, Avatar, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, useDisclosure } from '@chakra-ui/react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link } from 'react-router-dom';
import { fileUploadCss } from '../Auth/SignUp';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  const changeImageSubmitHandler = async (e, image) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('No user is signed in.');
      }

      if (!image) {
        throw new Error('No image selected.');
      }

      const storage = getStorage();
      const storageRef = ref(storage, `profile_pictures/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, image);

      const downloadURL = await getDownloadURL(snapshot.ref);
      await updateProfile(user, { photoURL: downloadURL }); 
      setUserData(prev => ({ ...prev, avatar: downloadURL }));

    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  return (
    <Container h={'95vh'} maxW="container.lg" py="8">
      <Heading children="Profile" m="8" textTransform={'uppercase'} />

      <Stack
        justifyContent={'flex-start'}
        direction={['column', 'row']}
        alignItems={'center'}
        spacing={['8', '16']}
        padding={'8'}
      >
        <VStack>
          <Avatar src={userData.avatar} boxSize={'48'} />
          <Button isLoading={loading} onClick={onOpen} colorScheme="purple" variant="ghost">Change Photo</Button>
        </VStack>

        <VStack spacing={'4'} alignItems={['center', 'flex-start']}>
          <HStack>
            <Text fontWeight="bold">Name</Text>
            <Text>{userData.name}</Text>
          </HStack>
          <HStack>
            <Text fontWeight="bold">Email</Text>
            <Text>{userData.email}</Text>
          </HStack>
          <Stack direction={['column', 'row']} alignItems={'center'}>
            <Link to={'/updateprofile'}>
              <Button colorScheme="purple">Update Profile</Button>
            </Link>
            <Link to={'/changepassword'}>
              <Button colorScheme="purple">Change Password</Button>
            </Link>
          </Stack>
        </VStack>
      </Stack>
      
      <ChangePhotoBox
        changeImageSubmitHandler={changeImageSubmitHandler}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Container>
  );
};

const ChangePhotoBox = ({ isOpen, onClose, changeImageSubmitHandler }) => {
  const [imagePrev, setImagePrev] = useState('');
  const [image, setImage] = useState(null);

  const ChangeImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setImagePrev(reader.result);
        setImage(file);
      };
    }
  };

  const closeHandler = () => {
    onClose();
    setImagePrev('');
    setImage(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeHandler}>
      <ModalOverlay backdrop={'blur(10px)'} />
      <ModalContent>
        <ModalHeader>Change Photo</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Container>
            <form onSubmit={(e) => changeImageSubmitHandler(e, image)}>
              <VStack spacing={'8'}>
                {imagePrev && <Avatar src={imagePrev} boxSize={'48'} />}
                <Input
                  type='file'
                  css={{'&::file-selector-button':fileUploadCss}}
                  onChange={ChangeImage}
                />
                <Button w='full' colorScheme='purple' type='submit'>Change</Button>
              </VStack>
            </form>
          </Container>
        </ModalBody>
        <ModalFooter>
          <Button mr='3' onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Profile;
