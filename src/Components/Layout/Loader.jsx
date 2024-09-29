import { Spinner, VStack, Text, Flex, Box, useColorModeValue } from '@chakra-ui/react';
import React from 'react';

export const Loader = ({color="blue.500"}) => {
    return <VStack h='100vh' justifyContent='center'>
        <div style={{ transform: 'scale(4)' }}>
            <Spinner thickness='2px' speed='0.65s' emptyColor='transparent' color={color}
            size={'xl'} />
        </div>
    </VStack>
};

export const ChatLoader = () => {
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
              Welcome to VirtualAdda!
            </Text>
            <Text fontSize="lg" mt={4}>
              Select a chat to start a conversation with your online friends!
            </Text>
          </Box>
        </Flex>
      );
};