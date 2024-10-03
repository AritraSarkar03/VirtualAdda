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
import { doc, setDoc, getFirestore, getDoc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, getStorage, uploadString } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ColorModeSwitcher } from '../../ColorModeSwitcher.js';
import { Loader } from '../Layout/Loader.jsx';
import { FiPlus } from 'react-icons/fi';

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
              <Button colorScheme="blue" my={'4'} type="submit" mx="auto" display="block" width={'full'}>
                Add Server
              </Button>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

function Server({ serverId, onSelectServer }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.200', 'gray.900');
  const buttonBgColor = useColorModeValue('gray.400', 'gray.700');
  const dividerColor = useColorModeValue('black', 'white');

  const handleButtonClick = (id) => {
    onSelectServer(id);
  };

  const handleAddServer = () => {
    onOpen();
  };

  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const serverIdsObject = userDoc.data().servers || {};
          const serverIds = Object.values(serverIdsObject);

          if (serverIds.length > 0) {
            const unsubscribeFunctions = serverIds.map((id) => {
              return onSnapshot(doc(db, 'servers', id), (serverDoc) => {
                if (isMounted) {
                  if (serverDoc.exists()) {
                    const serverData = serverDoc.data();
                    setServers(prevServers => {
                      const updatedServers = prevServers.filter(s => s.id !== id); // Remove old data for the same server ID
                      return [...updatedServers, { ...serverData, id }]; // Add updated data
                    });
                  } else {
                    console.warn(`Document with ID ${id} does not exist.`);
                  }
                }
              }, (error) => {
                console.error(`Error listening to server with ID ${id}:`, error);
              });
            });

            // Stop loading when all snapshots are set up
            if (isMounted) {
              setLoading(false);
            }

            // Clean up all snapshots when component unmounts or user changes
            return () => {
              unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
            };
          } else {
            if (isMounted) {
              setLoading(false);
            }
          }
        } catch (error) {
          console.error('Error fetching servers:', error);
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
  }, [user, db]);


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
  }, [db, user]);
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
  }, [serverId, servers, db]);

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
        <Tooltip label={process.env.REACT_APP_DEFAULT_SERVER_NAME} placement="right">
          <Avatar
            src={process.env.REACT_APP_DEFAULT_SERVER_PHOTO}
            objectFit="cover"
            border={serverId === process.env.REACT_APP_DEFAULT_SERVER ? '2px solid blue' : 'none'}
            onClick={() => handleButtonClick(process.env.REACT_APP_DEFAULT_SERVER)}
            bg={buttonBgColor}
            mb={2}
          />
        </Tooltip>
        <Divider borderColor={dividerColor} mb={2} />
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
          >
            <FaPlus color="green" size="50%" />
          </Button>
        </Tooltip>

      </Flex>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        position="absolute"
        bottom="0"
        width="100%"
        pb={4}
        pr={4}
      >
        <ColorModeSwitcher mb='3vh' />
        <Tooltip label={'Profile'} placement="right">
          <Avatar
            src={userData.avatar}
            size="sm"
            objectFit="cover"
            bg={buttonBgColor}
            mb={2}
            onClick={handleProfileClick}
          />
        </Tooltip>
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
    </Box>
  );
}

export default Server;
