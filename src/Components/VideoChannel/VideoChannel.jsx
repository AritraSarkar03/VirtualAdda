import { Flex, Text, Box, useColorModeValue, VStack, HStack, IconButton } from '@chakra-ui/react';
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import React, { useEffect, useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase.js';

const VideoChannel = ({channel}) => {
  const [isCallOn, setIsCall] = useState(true);
  const [isVideoOn, setIsVideo] = useState(false);
  const [isMicOn, setIsMic] = useState(false);
  const bg = useColorModeValue('white', 'gray.600');
  const button = useColorModeValue('gray.300', 'gray.700');

  const toggleVideo = () => {
    setIsVideo(!isVideoOn);
  }

  const toggleMic = () => {
    setIsMic(!isMicOn);
  }

  const toggleCall = () => {
    setIsCall(!isCallOn);
  }

  const [token, setToken] = useState(null);
  const user = auth.currentUser;

  // Ensure user is available and channel ID is valid before fetching token
  useEffect(() => {
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    const userId = user.uid;
    const roomName = channel.id;

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/generateToken', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, roomName }),
        });
    
        if (!response.ok) {
          throw new Error('Failed to generate token');
        }
    
        const data = await response.json();
        return data.token;
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
 fetchToken();    
  }, [user, channel.id]); // Dependency on user and channel ID

  useEffect(() => {
    console.log("token:", token); // Log the token after it has been updated
  }, [token]);

  return (
    <VStack
      bg={bg}
      spacing={0}
      height="94.5vh"
    >
      {/* {!isCallOn && !isMicOn && !isVideoOn &&  (*/}
      <Flex
        align="center"
        justify="center"
        color="gray.400"
        flex='1'
      >
        <Box textAlign="center">
          <Text fontSize="2xl" fontWeight="bold">
            Start a Call!
          </Text>
          <Text fontSize="lg" mt={4}>
            Press Call to start a conversation!
          </Text>
        </Box>
      </Flex>
    {/*)} */}
      <HStack bg={button} rounded='2xl' m={2} p={1}>
        <IconButton
          onClick={toggleVideo}
          icon={isVideoOn ? <FaVideo /> : <FaVideoSlash />}
          isRound
        />
        <IconButton
          onClick={toggleCall}
          transform={isCallOn? 'rotate(135deg)' : 'none'}
          icon={<IoCall />}
          isRound
        />
        <IconButton
          onClick={toggleMic}
          icon={isMicOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
          isRound
        />
      </HStack>
    </VStack>
  );
}

export default VideoChannel
