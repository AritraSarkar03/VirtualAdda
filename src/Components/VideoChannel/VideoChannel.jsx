import { Flex, Text, Box, useColorModeValue, VStack, Button } from '@chakra-ui/react';
import React, { useState } from 'react';
import VideoCall from './VideoCall.jsx';

const VideoChannel = ({ channel }) => {
  const [isCallOn, setIsCall] = useState(false);
  const bg = useColorModeValue('white', 'gray.600');

  const { id } = channel;

  const toggleCall = () => {
    setIsCall(!isCallOn);
  }


  return (
    <VStack
      bg={bg}
      spacing={0}
      height="94.5vh"
    >
      {isCallOn ? (
        <VideoCall roomName={id} />
      ) : (
        <Flex
          align="center"
          justify="center"
          color="gray.400"
          flex='1'
        >
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold">
              Click to Join or Start the Call!
            </Text>
            <Button
              colorScheme={'green'}
              color={'white'}
              onClick={toggleCall}
              m={'5'}
            >
              Join Call
            </Button>
          </Box>
        </Flex>
      )}
    </VStack>
  );
}

export default VideoChannel