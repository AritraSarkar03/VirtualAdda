import {
  VStack,
  Box,
  Avatar,
  FormLabel,
  Input,
  Button,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Divider,
  useColorModeValue,
  Flex
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { RiCompassDiscoverFill } from "react-icons/ri";
import { fileUploadCss } from '../Auth/SignUp';
import { auth, db } from '../../firebase';
import { doc, setDoc, getFirestore, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { getDownloadURL, ref, getStorage, uploadString } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const RegisterServerModal = ({ isOpen, onClose }) => {
  const [serverName, setServerName] = useState('');
  const [serverPhoto, setServerPhoto] = useState('');

  const submitAddServerHandler = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `serverImages/${Date.now()}_${user.uid}`);
      await uploadString(storageRef, serverPhoto, 'data_url');
      const photoURL = await getDownloadURL(storageRef);
      const serverId = `${Date.now()}_${user.uid}`;
      await setDoc(doc(db, "servers", serverId), {
        id: serverId,
        name: serverName,
        members: {
          admin: user.uid,
          moderator: [],
          member: []
        },
        photoURL: photoURL,
        createdAt: new Date(),
      });
      await updateDoc(doc(db, "users", user.uid), {
        servers: arrayUnion(serverId)
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    onClose();
  };

  const changeImageHandle = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServerPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add a New Server</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
            <form style={{ width: '100%' }} onSubmit={submitAddServerHandler}>
              <Box my={'4'} display={'flex'} justifyContent={'center'}>
                <Avatar src={serverPhoto} size={'2xl'} />
              </Box>
              <FormLabel htmlFor="serverName">Server Name</FormLabel>
              <Input
                required
                id="serverName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder={'Enter server name'}
                type="text"
                focusBorderColor="purple.500"
              />
              <Box my={'4'}>
                <FormLabel htmlFor="chooseServerPhoto">Choose Server Photo</FormLabel>
                <Input
                  accept="image/*"
                  onChange={changeImageHandle}
                  required
                  id="chooseServerPhoto"
                  type="file"
                  focusBorderColor="purple.500"
                  css={{ '&::file-selector-button': fileUploadCss }}
                />
              </Box>
              <Button colorScheme="purple" my={'4'} type="submit" mx="auto" display="block">
                Add Server
              </Button>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

function Server({ onSelectServer }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.200', 'gray.900');
  const buttonBgColor = useColorModeValue('gray.400', 'gray.700');
  const dividerColor = useColorModeValue('black', 'white');

  const handleButtonClick = (id) => {
    setActiveButtonId(id);
    onSelectServer(id);
  };

  const handleAddServer = () => {
    onOpen();
  };

  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeButtonId, setActiveButtonId] = useState(null);
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const serverIdsObject = userDoc.data().servers || {};
          const serverIds = Object.values(serverIdsObject);

          if (serverIds.length > 0) {
            // Create promises to fetch server details
            const serverPromises = serverIds.map(async (id) => {
              const serverDoc = await getDoc(doc(db, 'servers', id));
              if (serverDoc.exists()) {
                return serverDoc.data();
              } else {
                console.warn(`Document with ID ${id} does not exist.`);
                return null;
              }
            });

            // Await all promises and extract server data
            const serverDocs = await Promise.all(serverPromises);
            // Filter out null values
            const serverData = serverDocs.filter(data => data !== null);

            if (isMounted) {
              // Set the fetched server data to state
              setServers(serverData);
              setLoading(false);
            }
          } else {
            if (isMounted) {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('Error fetching servers:', error);
          // Handle errors appropriately, e.g., show a toast notification
          if (isMounted) setLoading(false);
        }
      } else {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [auth, db]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box
      w="fit-content" // Adjust width to fit content
      h="100vh"
      bg={bgColor}
      p={2}
      position="relative"
      overflow="auto"
      css={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {servers.map((item, index) => (
          <Tooltip label={item.name} placement="right" key={index}>
            <Avatar
              src={item.photoURL}
              objectFit="cover"
              border={activeButtonId === item.id ? '2px solid purple' : 'none'}
              onClick={() => handleButtonClick(item.id)}
              bg={buttonBgColor}
              mb={2}
            />
          </Tooltip>
        ))}
      </Box>

      {servers.length > 0 && (<Divider borderColor={dividerColor} />)}

      <Flex direction="column" align="center" mt={4} gap={2}>
        <Tooltip label="Add Server" placement="right">
        
            <Button
              variant="unstyled"
              onClick={handleAddServer}
              bg={buttonBgColor}
              borderRadius="2xl"
              w="100%" // Full width
              h="50px" // Full height
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
            <FaPlus color="green" size="50%" />
          </Button>
        </Tooltip>

        <Tooltip label="Discover Servers" placement="right">
        <Button
              variant="unstyled"
              onClick={handleAddServer}
              bg={buttonBgColor}
              borderRadius="2xl"
              w="100%" // Full width
              h="50px" // Full height
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <RiCompassDiscoverFill color="green" size="50%" />
            </Button>
        </Tooltip>
      </Flex>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
          <Tooltip label={'Profile'} placement="right" >
            <Avatar
              src={user.avatar}
              objectFit="cover"
              onClick={() => handleButtonClick(item.id)}
              bg={buttonBgColor}
              mb={2}
            />
          </Tooltip>
      </Box>
      <RegisterServerModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default Server;
