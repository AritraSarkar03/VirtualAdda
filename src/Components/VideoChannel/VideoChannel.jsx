import { Flex, Text, Box, useColorModeValue, VStack, HStack, IconButton } from '@chakra-ui/react';
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import React, { useEffect, useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth, functions } from '../../firebase.js';
import VideoCall from './VideoCall.jsx';

const VideoChannel = ({ channel }) => {
  const [isCallOn, setIsCall] = useState(true);
  const [isVideoOn, setIsVideo] = useState(false);
  const [isMicOn, setIsMic] = useState(false);
  const bg = useColorModeValue('white', 'gray.600');
  const button = useColorModeValue('gray.300', 'gray.700');

  const toggleCall = () => {
    setIsCall(!isCallOn);
  }


  return (
    <VStack
      bg={bg}
      spacing={0}
      height="94.5vh"
    >
      {!isCallOn ? (
        <VideoCall roomName={channel} />
      ) : (
        <>
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
          <HStack bg={button} rounded='2xl' m={2} p={1}>
            <IconButton
              onClick={toggleCall}
              transform={isCallOn ? 'rotate(135deg)' : 'none'}
              icon={<IoCall />}
              isRound
            />
          </HStack>
        </>
      )}
    </VStack>
  );
}

export default VideoChannel