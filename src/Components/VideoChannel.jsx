import { Flex, Text, Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react'

const VideoChannel = () => {
  const bg = useColorModeValue('white', 'gray.600');
    return (
        <Flex
          height="100vh"
          width="100%"
          align="center" 
          justify="center"
          bg={bg}
          color="gray.400"
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
      );
}

export default VideoChannel