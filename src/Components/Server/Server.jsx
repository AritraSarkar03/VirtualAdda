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
  ModalFooter,
  Divider,
  useColorModeValue,
  Flex,
  Icon,
  AvatarBadge
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { auth, db } from '../../firebase.js';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, getStorage, uploadString } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { ColorModeSwitcher } from '../../ColorModeSwitcher.js';
import { Loader } from '../Layout/Loader.jsx';
import { FiPlus } from 'react-icons/fi';

const RegisterServerModal = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverPhoto, setServerPhoto] = useState('');

  const submitAddServerHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      onClose();
      setLoading(false);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
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
        <ModalBody>
          <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
            <form style={{ width: '100%' }} onSubmit={submitAddServerHandler}>
              <Box my={'4'} display={'flex'} justifyContent={'center'}>
                <Avatar
                  size="xl"
                  name={serverName}
                  src={serverPhoto}
                  cursor="pointer"
                >

                  {serverPhoto === '' && (
                    <AvatarBadge
                      boxSize="1em"
                      bg="gray.500"
                    >
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
              <FormLabel htmlFor="serverName">Server Name</FormLabel>
              <Input
                required
                id="serverName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder={'Enter server name'}
                type="text"
                focusBorderColor="blue.500"
              />
              <Button
                colorScheme="blue"
                my={'4'}
                type="submit"
                mx="auto"
                display="block"
                width={'full'}
                isDisabled={loading}>
                Add Server
              </Button>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const Server = ({ serverId, onSelectServer }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.200', 'gray.900');
  const buttonBgColor = useColorModeValue('gray.400', 'gray.700');
  const dividerColor = useColorModeValue('black', 'white');

  const handleButtonClick = (id) => {
    console.log("server:",id);
    onSelectServer(id);
  };

  const handleAddServer = () => {
    onOpen();
  };

  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const fetchServers = async (serverIds) => {
    console.log('helo3');
    const serverPromises = serverIds.map(async (id) => {
      const serverDoc = await getDoc(doc(db, 'servers', id));
      if (serverDoc.exists()) {
        return { ...serverDoc.data(), id }; // Include the ID in the returned object
      } else {
        console.warn(`Server document with ID ${id} does not exist.`);
        return null; // Handle non-existent documents
      }
    });

    // Wait for all server data to be fetched
    const servers = await Promise.all(serverPromises);
    // Filter out any null values
    const validServers = servers.filter(server => server !== null);
    
    // Update state with the fetched servers
    setServers(validServers);
  };


  useEffect(() => {
    console.log("helo2");
    const user = auth.currentUser;
    if (user) {
      // Listen for changes to the user's document
      const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), async (userDoc) => {
        if (userDoc.exists()) {
          const serverIdsObject = userDoc.data().servers || {};
          const serverIds = Object.values(serverIdsObject);

          // Fetch server data when user data changes
          await fetchServers(serverIds);
        } else {
          console.warn(`User document does not exist.`);
        }
      }, (error) => {
        console.error('Error listening to user document:', error);
      });

      // Cleanup: Call unsubscribeUser when the component unmounts
      return () => unsubscribeUser();
    }
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
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
  }, [user]);
  const handleProfileClick = () => {
    navigate('/profile');
  };
  const [isAdded, setIsAdded] = useState(true);
  const [newServer, setNewServer] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Check if the server is added, and fetch server data if it is not
  useEffect(() => {
    const checkServer = async () => {
      if (!servers.some((server) => server.id === serverId) && serverId !== process.env.REACT_APP_DEFAULT_SERVER) {
        try {
          const serverDoc = await getDoc(doc(db, 'servers', serverId));

          if (serverDoc.exists()) {
            const serverData = serverDoc.data();
            setNewServer(serverData);
            setIsAdded(false);
          } else {
            console.log("No such server exists!");
          }
        } catch (error) {
          console.error("Error fetching server:", error);
        }
      }
      else {
        setIsAdded(true);
      }
    };

    checkServer();
  }, [serverId, servers]);

  useEffect(() => {
    let interval;
    if (!isAdded) {
      setIsModalVisible(true);
      interval = setInterval(() => {
        setIsModalVisible(true);
      }, 4000);
    }
    return () => {
      clearInterval(interval);
      setIsModalVisible(false); // Optionally hide the modal when `isAdded` changes
    };
  }, [isAdded]);

  const addServer = async () => {
    const user = auth.currentUser;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        servers: arrayUnion(serverId)
      });
      setIsModalVisible(false);
    } catch (e) {
      console.log("Error adding server:", e)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <VStack spacing={0} m={0} p={0}>
          {console.log(process.env.REACT_APP_DEFAULT_SERVER)}
        <Tooltip label={process.env.REACT_APP_DEFAULT_SERVER_NAME} placement="right">
          <Avatar
            src={process.env.REACT_APP_DEFAULT_SERVER_PHOTO}
            objectFit="cover"
            border={serverId === process.env.REACT_APP_DEFAULT_SERVER ? '2px solid blue' : 'none'}
            onClick={() => handleButtonClick(process.env.REACT_APP_DEFAULT_SERVER)}
            bg={buttonBgColor}
            my={2}
          />
        </Tooltip>
        <Divider borderColor={dividerColor} mb={2} w={'85%'}/>
      <Box
        w="fit-content"
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
        <Box display="flex" flexDirection="column" alignItems="center">
          {servers.map((item, index) => (
            <Tooltip label={item.name} placement="right" key={index}>
              <Avatar
                src={item.photoURL}
                objectFit="cover"
                border={serverId === item.id ? '2px solid blue' : 'none'}
                onClick={() => handleButtonClick(item.id)}
                bg={buttonBgColor}
                mb={2}
              />
            </Tooltip>
          ))}
        </Box>
        {!isAdded &&
          <Tooltip label={newServer.name} placement="right">
            <Avatar
              src={newServer.photoURL}
              objectFit="cover"
              border={serverId === newServer.id ? '2px solid blue' : 'none'}
              onClick={() => handleButtonClick(newServer.id)}
              bg={buttonBgColor}
              mb={2}
            />
          </Tooltip>}

        {servers.length > 0 && (<Divider borderColor={dividerColor} />)}

        <Flex direction="column" align="center" mt={4} gap={2}>
          <Tooltip label="Add Server" placement="right">
            <Button
              variant="unstyled"
              onClick={handleAddServer}
              bg={buttonBgColor}
              borderRadius="2xl"
              w="100%"
              h="50px"
              display="flex"
              justifyContent="center"
              alignItems="center"
              aria-label="Add Server"
            >
              <FaPlus color="green" size="50%" />
            </Button>
          </Tooltip>
        </Flex>
      </Box>

      <Box
        w="fit-content"
        bg={bgColor}
        p={2}
        position="relative"
      >
        <Flex direction="column" align="center" justify="flex-start">
          <ColorModeSwitcher mb='3vh' />

          <Tooltip label={'Profile'} placement="right">
            <Avatar
              src={userData.avatar}
              size="sm"
              objectFit="cover"
              bg={buttonBgColor}
              onClick={handleProfileClick}
              aria-label="Open Profile"
            />
          </Tooltip>
        </Flex>
      </Box>


      <Modal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)} isCentered size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Notification</ModalHeader>
          <ModalBody>
            <p>The server has not been added yet! Join the server to hang out with bew friends!</p>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={addServer} mx={2}>Add</Button>
            <Button colorScheme="red" onClick={() => setIsModalVisible(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <RegisterServerModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  );
}

export default Server;
