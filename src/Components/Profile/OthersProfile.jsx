import React, { useState, useEffect } from 'react';
import { Stack, Text, Container, Heading, Button, Avatar, VStack, HStack } from '@chakra-ui/react';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';

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
  const [currentUser, setCurrentUser] = useState(null);
  const user = auth.currentUser; // Replace with logic to get the logged-in user ID

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = doc(db, 'users', user); // Assuming users are stored in the "users" collection
        const userSnap = await getDoc(userDoc);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setCurrentUser(userData);

          // Check if the userIdToCheck is in the current user's friends array
          if (userData.friends && Array.isArray(userData.friends)) {
            setIsFriend(userData.friends.includes(userID));
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

  const handleAddFriend = async () => {
    if (user && !isFriend) {
      try {
        const userRef = doc(db, 'users', user);
        await updateDoc(userRef, {
          friends: [...currentUser.friends, userID]
        });
        setIsFriend(true);
      } catch (error) {
        console.error('Error adding friend:', error);
      }
    }
  };

  const navigate = useNavigate();
  const handleButtonClick = (id) => {
    console.log(id);
    navigate('/mypage', { state: { ServerId: id } });
  }

  return (
    <Container h={'95vh'} maxW="container.lg" py="8">
      <Heading children="Profile" m="8" textTransform={'uppercase'} />
      <Stack justifyContent={'flex-start'} direction={['column', 'row']} alignItems={'center'} spacing={['8', '16']} padding={'8'}>
        <VStack>
          <Avatar src={userData.avatar} boxSize={'48'} />
        </VStack>
        <VStack spacing={'4'} alignItems={['center', 'flex-start']}>
          <HStack><Text fontWeight="bold">Name</Text><Text>{userData.name}</Text></HStack>
          <HStack><Text fontWeight="bold">Email</Text><Text>{userData.email}</Text></HStack>
          {isFriend && (
            <Stack direction={['column', 'row']} alignItems={'center'}>
              <Button colorScheme="blue" onClick={handleAddFriend}>Add Friend</Button>
            </Stack>
          )}
        </VStack>
      </Stack>
      <Heading children="Servers" size={'md'} my={'8'} />
      <HStack spacing={4}>
        {servers.map((item) => (
          <VStack key={item.id}>
            <Avatar src={item.photoURL} objectFit="cover" onClick={() => handleButtonClick(item.id)} />
            <Text>{item.name}</Text>
          </VStack>
        ))}
      </HStack>
    </Container>
  );
};


export default OthersProfile;