import React, { useState, useEffect } from 'react';
import { Stack, Text, Container, Heading, Button, Avatar, VStack, HStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Input, useDisclosure, Box, Spacer, Flex, useToast } from '@chakra-ui/react';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { signOut, updateProfile } from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Link, useNavigate } from 'react-router-dom';
import { fileUploadCss } from '../Auth/SignUp';
import { RiLogoutBoxLine } from 'react-icons/ri'
import { useHistory } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
            const serverIdsObject = userDoc.data().servers || {};
            const serverIds = Object.values(serverIdsObject);
            const serverPromises = serverIds.map(async (id) => {
              const serverDoc = await getDoc(doc(db, 'servers', id));
              return serverDoc.exists() ? serverDoc.data() : null;
            });
            const serverDocs = await Promise.all(serverPromises);
            setServers(serverDocs.filter(data => data !== null));
          }
        }
      } catch (error) {
        console.error('Error fetching user or servers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const changeImageSubmitHandler = async (e, image) => {
    e.preventDefault();
    try {
      if (!user) throw new Error('No user is signed in.');
      if (!image) throw new Error('No image selected.');

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
  const navigate = useNavigate();
  const handleButtonClick = (id) => {
    console.log(id);
    navigate('/mypage', { state: { ServerId: id } });
  }
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logged out.",
        description: "You have successfully logged out.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      navigate('/signin');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      <Flex justifyContent="flex-end" mb="4">
        <Button variant={'ghost'} onClick={handleLogout}>
          <RiLogoutBoxLine style={{ marginRight: '8px' }} />
          Log Out
        </Button>
      </Flex>
      <Container h={'90vh'} maxW="container.lg" py="8">
        <Heading children="Profile" m="8" textTransform={'uppercase'} />

        <Stack justifyContent={'flex-start'} direction={['column', 'row']} alignItems={'center'} spacing={['8', '16']} padding={'8'}>
          <VStack>
            <Avatar src={userData.avatar} boxSize={'48'} />
            <Button isLoading={loading} onClick={onOpen} colorScheme="blue" variant="ghost">Change Photo</Button>
          </VStack>
          <VStack spacing={'4'} alignItems={['center', 'flex-start']}>
            <HStack><Text fontWeight="bold">Name</Text><Text>{userData.name}</Text></HStack>
            <HStack><Text fontWeight="bold">Email</Text><Text>{userData.email}</Text></HStack>
            <Stack direction={['column', 'row']} alignItems={'center'}>
              <Link to={'/updateprofile'}><Button colorScheme="blue">Update Profile</Button></Link>
              <Link to={'/changepassword'}><Button colorScheme="blue">Change Password</Button></Link>
            </Stack>
          </VStack>
        </Stack>
        <Heading children="My Servers" size={'md'} my={'8'} />
        <HStack spacing={4}>
          {servers.map((item) => (
            <VStack key={item.id}>
              <Avatar src={item.photoURL} objectFit="cover" onClick={() => handleButtonClick(item.id)} />
              <Text>{item.name}</Text>
            </VStack>
          ))}
        </HStack>
        <ChangePhotoBox changeImageSubmitHandler={changeImageSubmitHandler} isOpen={isOpen} onClose={onClose} />
      </Container>
    </>
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
                <Input type='file' css={{ '&::file-selector-button': fileUploadCss }} onChange={ChangeImage} />
                <Button w='full' colorScheme='blue' type='submit'>Change</Button>
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
