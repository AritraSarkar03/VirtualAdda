import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Button,
  Input,
  VStack, HStack,
  Avatar,
  Tooltip,
  useColorModeValue,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalBody,
  ModalHeader,
  useDisclosure
} from '@chakra-ui/react';
import { auth, db, rdb } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { set, ref, push, onValue, off, update } from 'firebase/database';
import { isLastMessage, isNewTime, isSameSender, isSameSenderMargin } from '../Config.js/ChatLogic';
import OthersProfile from '../Profile/OthersProfile';
import { useNavigate } from 'react-router-dom';

export const EditMessageModal = ({ isOpen, onClose, onSubmit }) => {
  const [newMessage, setNewMessage] = useState("");

  const handleSubmit = () => {
    onSubmit(newMessage);
    setNewMessage(""); // Clear the input field after submission
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Message</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Enter new message"
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Chat = ({ channel }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [messageId, setMessageId] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); // State to track which message menu is active
  const { isOpen, onOpen, onClose } = useDisclosure();

  const bgColor = useColorModeValue('white', 'gray.600'); // Background color for HStack
  const messageBgColorSender = useColorModeValue('#5A9FCF', '#4A8CC2'); // Message background for sender
  const messageBgColorReceiver = useColorModeValue('#5ABA84', '#4A9A6E'); // Message background for receiver
  const inputBgColor = useColorModeValue('white', 'gray.600'); // Input background color
  const inputBorderColor = useColorModeValue('purple', 'purple.300'); // Input border color
  const dropdownBgColor = useColorModeValue('white', 'gray.500');
  const user = auth.currentUser;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (channel) {
      const { id } = channel;
      try {
        const avatar = (await getDoc(doc(db, 'users', user.uid))).data().avatar;
        const name = (await getDoc(doc(db, 'users', user.uid))).data().name;
        const messagesRef = ref(rdb, `chats/${id}/messages`);
        const newMessageRef = push(messagesRef);

        // Save the new message to the Realtime Database
        await set(newMessageRef, {
          sender: user.uid,
          senderName: name,
          senderAvatar: avatar,
          message: input,
          timestamp: new Date().toISOString()
        });

        // Clear input after sending the message
        setInput('');

      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  useEffect(() => {
    if (channel) {
      console.log(channel);
      const { id } = channel;
      const messagesRef = ref(rdb, `chats/${id}/messages`);

      // Set up the real-time listener
      onValue(messagesRef, (snapshot) => {
        if (snapshot.exists()) {
          const messagesData = snapshot.val();
          const messagesArray = Object.entries(messagesData).map(([id, message]) => ({
            id,
            ...message
          }));
          setMessages(messagesArray);
        } else {
          setMessages([]);
        }
      }, (error) => {
        console.error('Error getting messages:', error);
      });

      // Clean up the listener on component unmount or channel change
      return () => {
        off(messagesRef);  // Unsubscribe from the listener
      };
    }
  }, [channel]);

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleEdit = (mid) => {
    setMessageId(mid); // Set the message ID to be edited
    onOpen(); // Open the modal
  };

  const handleSubmit = async (newMessage) => {
    if (channel) {
      const { id } = channel;
      const editMessageRef = ref(rdb, `chats/${id}/messages/${messageId}`);
      await update(editMessageRef, {
        message: newMessage,
        edit: true
      });
    }
    onClose(); // Close the modal after submission
  };

  const handleDelete = async (mid) => {
    if (channel) {
      const { id } = channel;
      const editMessageRef = ref(rdb, `chats/${id}/messages/${mid}`);
      await update(editMessageRef, {
        message: '',
        edit: false
      });
    }
  };

  const handleMenuToggle = (id) => {
    setActiveMenu(activeMenu === id ? null : id); // Toggle menu for the clicked message
  };
 
  const navigate = useNavigate();
  const handleViewProfile = (id) => {
    navigate(`/otherprofile/${id}`);
  }

  return (
    <HStack
      w="100%"
      h="94.5vh"
      p={4}
      pt={0}
      bg={bgColor}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack
        w="full"
        h="full"
        p={4}
        borderRadius="md"
        overflowY="auto"
        spacing={3}
        align="flex-start"
        css={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }}
      >
        {messages &&
          messages.map((m, i) => (
            <React.Fragment key={m.id}>
              {isNewTime(m.timestamp, i, i > 0 ? new Date(messages[i - 1].timestamp) : null) && (
                <Box
                  fontSize="sm"
                  color="gray.500"
                  display="flex"
                  m={0}
                  p={0}
                  spacing='0'
                  justifyContent="center"
                  w="100%"
                >
                  {new Date(m.timestamp).toDateString()}
                </Box>
              )}
              <Box
                w={'100%'}
                display="flex"
                alignItems="center"
              >
                {(isSameSender(messages, m, i, user.uid) ||
                  isLastMessage(messages, i, user.uid)) && (
                    <Tooltip label={m.senderName} placement="bottom-start" hasArrow>
                      <Avatar
                        onClick={()=>handleViewProfile(m.sender)}
                        mr={1}
                        size="sm"
                        cursor="pointer"
                        src={m.senderAvatar}
                      />
                    </Tooltip>
                  )}
                

                <Box
                position='relative'
                  bg={m.sender === user.uid ? messageBgColorSender : messageBgColorReceiver}
                  mx="2"
                  borderRadius="20px"
                  p="5px 15px"
                  w="fit-content"
                  maxW="60%"
                  ml={isSameSenderMargin(messages, m, i, user.uid)} 
                  onClick={() => handleMenuToggle(m.id)} // Toggle menu for the specific message
                >
                  {m.message !== "" ? m.message : <em>This message has been deleted</em>}
                  <HStack w={'100%'} spacing={0}>
                    {m.edit === true && (
                      <Text fontSize="0.5em" color="gray.900" mr={2}>
                        {'(edited)'}
                      </Text>
                    )}
                    <Text fontSize="0.5em" color="gray.900">
                      {new Date(m.timestamp).toLocaleTimeString()}
                    </Text>
                  </HStack>

                  {activeMenu === m.id && m.message !== "" && (
                    <Box
                      position="absolute"
                      borderRadius="md"
                      mt={2}
                      bg={dropdownBgColor}
                      boxShadow="md"
                      zIndex="1000"
                    >
                      <Text px={4} py={2} cursor="pointer" onClick={() => handleEdit(m.id)}>
                        Edit
                      </Text>
                      <Text px={4} py={2} cursor="pointer" onClick={() => handleDelete(m.id)}>
                        Delete
                      </Text>
                    </Box>
                  )}
                </Box>

                
              </Box>
            </React.Fragment>
          ))}
        <div ref={messagesEndRef} />
      </VStack>

      <HStack w="full" spacing={4} mt={4}>
        <Input
          flex="1"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)}
          variant="outline"
          bg={inputBgColor} // Dynamic input background color
          color={{ color: useColorModeValue('white', 'black') }} // Static text color
          borderColor={inputBorderColor} // Dynamic border color
          _placeholder={{ color: useColorModeValue('gray.700', 'gray.200') }} // Placeholder text color
        />
        <Button colorScheme="purple" onClick={handleSendMessage}>
          Send
        </Button>
      </HStack>
      <EditMessageModal
        isOpen={isOpen}
        onClose={onClose}
        onSubmit={handleSubmit}
      />
    </HStack>
  );
};

export default Chat;
