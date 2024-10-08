import React, { useEffect, useState } from 'react';
import {
  HStack, 
  VStack, 
  Text, 
  Tabs, 
  TabList, 
  Tab, 
  TabPanel, 
  TabPanels, 
  Button, 
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody, 
  useToast} from '@chakra-ui/react';
import { auth, db, rdb } from '../../firebase.js';
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { ref, get, set, child, serverTimestamp } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const Friend = ({isOpen, onClose}) => {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [newFriendId, setNewFriendId] = useState([]);
  const [chatID, setChatID] = useState([]);

  const user = auth.currentUser;

  // Fetch a user's document from Firestore by UID and return name and id
  const fetchUserById = async (uid) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return { id: uid, name: data.name }; // Return both id and name
      }
    } catch (error) {
      console.error(`Error fetching user ${uid}:`, error);
    }
    return null;
  };

  // Fetch friends list
  useEffect(() => {
    const fetchFriendsAndRequests = async () => {
      try {
        if (!user) return; // Ensure user is defined
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const friendIds = docSnap.get('friends');
          const friendData = await Promise.all(friendIds.map((uid) => fetchUserById(uid)));
          setFriends(friendData.filter(Boolean)); // Filter out null values (if any user is not found)
          const requestIds = docSnap.get('requests');
          const requestData = await Promise.all(requestIds.map((uid) => fetchUserById(uid)));
          setRequests(requestData.filter(Boolean));
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
      } catch (error) {
        console.error('Error fetching friends or requests:', error);
      }
    };

    if (isOpen) { // Only fetch when modal is open
      fetchFriendsAndRequests();
    }
  }, [isOpen, user, friends]);


  // Accept a friend request
  const handleAcceptRequest = async (requestId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const reqedUserRef = doc(db, 'users', requestId);
  
      // Update the requested user's friends list and remove the request
      await updateDoc(reqedUserRef, {
        friends: arrayUnion(user.uid),  // Add to friends
        requested: arrayRemove(user.uid) // Remove from requests
      });
  
      // Update the current user's friends list and remove the request
      await updateDoc(userRef, {
        friends: arrayUnion(requestId),  // Add to friends
        requests: arrayRemove(requestId) // Remove from requests
      });
  
      // Update the local requests state
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
  
      // Update the local friends state to include the new friend
      setFriends((prevFriends) => [...prevFriends, requestId]);
  
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };
  

  const handleRemoveRequest = async (requestId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        requests: arrayRemove(requestId)  // Remove from requests
      });
      const reqedUserRef = doc(db, 'users', requestId);
      await updateDoc(reqedUserRef, {
        requested: arrayRemove(user.uid)
      });
      setRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error("Error removing request:", error);
    }
  };

  // Remove a friend 
  const handleRemoveFriend = async (friendId) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(friendId)
      });
      
      const friendRef = doc(db, 'users', friendId);
      await updateDoc(friendRef, {
        friends: arrayRemove(user.uid)
      });
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };

  const toast = useToast(); // Initialize the toast hook
  const handleAddFriend = async () => {
  
    if (newFriendId) {
      try {
        const userRef = doc(db, 'users', user.uid);
        const friendRef = doc(db, 'users', newFriendId);
        await updateDoc(userRef, {
          requested: arrayUnion(newFriendId) // Add new friend ID to requests
        });
        await updateDoc(friendRef, {
          requests: arrayUnion(user.uid) // Add new friend ID to requests
        });
        setNewFriendId(''); // Clear the input after adding
  
        // Show success toast
        toast({
          title: 'Friend request sent!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error adding friend:", error);
        toast({
          title: 'Failed to send friend request.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };
  

  // Function to handle checking if a chat exists or creating a new one
  const navigate = useNavigate();
  const handleFriendChat = async (friend) => {
    const { id, name } = friend;
    const chatId = user.uid + "_" + id; // Create the chat ID for the current user and friend
    const altChatId = id + "_" + user.uid; // Alternate chat ID

    const personalChatsRef = ref(rdb, 'chats'); // Reference to the chats node

    try {
      // Check if chatId exists
      const chatSnapshot = await get(child(personalChatsRef, chatId));
      if (chatSnapshot.exists()) {
        setChatID(chatId); // Return the existing chatId
      } else {
        // Check for altChatId if chatId doesn't exist
        const altChatSnapshot = await get(child(personalChatsRef, altChatId));
        if (altChatSnapshot.exists()) {
          setChatID(altChatId); // Return the existing altChatId
        } else {
          // Neither exists, create a new chat with chatId
          await set(ref(rdb, `chats/${chatId}`), {
            createdAt: serverTimestamp(),
          });
          setChatID(chatId);
        }
      }
      const channel = { id : chatID, name }
      navigate('/mypage', { state: { ChannelId: channel } });
      onClose();
    } catch (error) {
      console.error("Error checking or creating chat:", error);
      throw error;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Friends</ModalHeader>
        <ModalBody>
          <Tabs>
            <TabList>
              <Tab>Friends</Tab>
              <Tab>Pending Requests</Tab>
              <Tab>Add Friend</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                {friends.length > 0 ? (
                  friends.map((friend, index) => (
                    <HStack key={index} spacing={4} justify="space-between">
                      <Button variant="ghost" onClick={() => handleFriendChat(friend)}>
                        {friend.name}
                      </Button>
                      <Button variant='ghost' colorScheme="red" onClick={() => handleRemoveFriend(friend.id)}>
                        Remove
                      </Button>
                    </HStack>
                  ))
                ) : (
                  <Text>No friends found</Text>
                )}
              </TabPanel>

              {/* Pending Requests Tab */}
              <TabPanel>
                {requests.length > 0 ? (
                  requests.map((request, index) => (
                    <HStack key={index} spacing={4} justify="space-between" mb={4}> {/* Added mb={4} for margin-bottom */}
                      <Text fontWeight={'bold'}>{request.name}</Text>
                      <HStack> {/* Spacing between buttons */}
                        <Button colorScheme="green" onClick={() => handleAcceptRequest(request.id)}>
                          Accept
                        </Button>
                        <Button colorScheme="red" onClick={() => handleRemoveRequest(request.id)}>
                          Remove
                        </Button>
                      </HStack>
                    </HStack>
                  ))
                ) : (
                  <Text>No pending requests</Text>
                )}
              </TabPanel>
              <TabPanel>
                <VStack spacing={4} align="stretch">
                  <Text fontSize="lg" fontWeight="bold">Send Request</Text>
                  <Input
                    placeholder="Enter User ID"
                    value={newFriendId}
                    onChange={(e) => setNewFriendId(e.target.value)}
                  />
                  <Button
                    colorScheme="blue"
                    onClick={handleAddFriend}
                  >
                    Request Friend
                  </Button>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default Friend;
