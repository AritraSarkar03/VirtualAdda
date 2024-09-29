import { Flex, Text, Box, useColorModeValue, VStack, HStack, IconButton } from '@chakra-ui/react';
import { FaVideo, FaVideoSlash } from "react-icons/fa6";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { IoCall } from "react-icons/io5";
import React, { useState } from 'react'

const VideoChannel = () => {
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
        {isVideoOn ? (
          <IconButton
            variant='ghost'
            onClick={toggleVideo}
            icon={<FaVideo />}
            isRound
          />
        ) : (
          <IconButton
            variant='ghost'
            onClick={toggleVideo}
            icon={<FaVideoSlash />}
            isRound
          />
        )}
        {isCallOn ? (
          <IconButton
            variant='ghost'
            bg={'green.700'}
            _hover={{ bg: 'green.500', color: 'white' }}
            onClick={toggleCall}
            icon={<IoCall />}
            isRound
          />
        ) : (
          <IconButton
            transform="rotate(135deg)"
            bg={'red.700'}
            _hover={{ bg: 'red.500', color: 'white' }}
            variant='ghost'
            onClick={toggleCall}
            icon={<IoCall />}
            isRound
          />
        )}
        {isMicOn ? (
          <IconButton
            variant='ghost'
            onClick={toggleMic}
            icon={<FaMicrophone />}
            isRound
          />
        ) : (
          <IconButton
            variant='ghost'
            onClick={toggleMic}
            icon={<FaMicrophoneSlash />}
            isRound
          />
        )}
      </HStack>
    </VStack>
  );
}

export default VideoChannel