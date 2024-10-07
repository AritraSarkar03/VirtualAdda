import React, { useState, useEffect } from 'react';
import { Stack, Text, Container, Heading, Button, Avatar, VStack, HStack } from '@chakra-ui/react';
import { auth, db } from '../../firebase.js';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { Loader } from '../Layout/Loader.jsx';
import { useToast } from '@chakra-ui/react';

const OthersProfile = () => {
  const { userID } = useParams();
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(false);
  const [servers, setServers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (userID) {
          const userDoc = await getDoc(doc(db, 'users', userID));
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
  }, [userID]);

  const [isFriend, setIsFriend] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const user = auth.currentUser; // Replace with logic to get the logged-in user ID

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', user.uid); // Assuming users are stored in the "users" collection
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Check if the userIdToCheck is in the current user's friends array
          if (userData.friends && Array.isArray(userData.friends)) {
            setIsFriend(userData.friends.includes(userID));
          }
          if (userData.requested && Array.isArray(userData.requested)) {
            setIsRequested(userData.requested.includes(userID));
          }
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, userID]);


  const toast = useToast();
  const handleAddFriend = async () => {
    if (user && !isFriend) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const reqUserRef = doc(db, 'users', userID);
  
        // Get current user's data to check for arrays
        const userSnapshot = await getDoc(userRef);
        const reqUserSnapshot = await getDoc(reqUserRef);

        const currentUserData = userSnapshot.exists() ? userSnapshot.data() : {};
        const reqUserData = reqUserSnapshot.exists() ? reqUserSnapshot.data() : {};
  
        const currentUserRequested = currentUserData.requested || [];
        const reqUserRequests = reqUserData.requests || [];
  
        // Update the current user's 'requested' array
        await updateDoc(userRef, {
          requested: [...currentUserRequested, userID],
        });
  
        // Update the other user's 'requests' array
        await updateDoc(reqUserRef, {
          requests: [...reqUserRequests, user.uid],
        });
  
        setIsRequested(true);
  
        // Success toast
        toast({
          title: "Request Sent",
          description: "You have successfully added a new friend.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error adding friend:', error);
  
        // Error toast
        toast({
          title: "Error",
          description: "An error occurred while adding a friend.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  
  

  const navigate = useNavigate();
  const handleButtonClick = (id) => {
    navigate('/mypage', { state: { ServerId: id } });
  }

  if (loading) return <Loader />;;

  return (
    <Container h={'95vh'} maxW="container.lg" py="8">
      <Heading children="Profile" m="8" textTransform={'uppercase'} />
      <Stack justifyContent={'flex-start'} direction={['column', 'row']} alignItems={'center'} spacing={['8', '16']} padding={'8'}>
        <VStack>
          <Avatar name={userData.name} src={userData.avatar} boxSize={'48'} />
        </VStack>
        <VStack spacing={'4'} alignItems={['center', 'flex-start']}>
          <HStack><Text fontWeight="bold">Name</Text><Text>{userData.name}</Text></HStack>
          <HStack><Text fontWeight="bold">Email</Text><Text>{userData.email}</Text></HStack>
            <Stack direction={['column', 'row']} alignItems={'center'}>
          {!isFriend && !isRequested && (<Button colorScheme="blue" onClick={handleAddFriend}>Send Request</Button>)}
          {isRequested && (<Button colorScheme="blue" variant={'ghost'}>Request Sent</Button>)}
            </Stack>
        </VStack>
      </Stack>
      <Heading children="Servers" size={'md'} my={'8'} />
      <HStack spacing={4}>
        {servers ? servers.map((item) => (
          <VStack key={item.id}>
            <Avatar name={item.name} src={item.photoURL} objectFit="cover" onClick={() => handleButtonClick(item.id)} />
            <Text>{item.name}</Text>
          </VStack>
        )) : (
          <Text>No Server Found</Text>
        )
        }
      </HStack>
    </Container>
  );
};


export default OthersProfile;
