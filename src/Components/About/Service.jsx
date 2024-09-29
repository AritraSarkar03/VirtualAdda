import React from 'react';
import { Box, Text, Heading } from '@chakra-ui/react';

const Services = () => {
  return (
    <Box p={4}>
      <Heading as="h2" size="lg" mb={4}>Our Services</Heading>
      <Text>
        At VirtualAdda, we offer a variety of services including:
      </Text>
      <Text>
        - Voice Channels for real-time communication
        <br />
        - Text Channels for organized discussions
        <br />
        - Custom Emojis and Reactions
        <br />
        - Integration with various third-party apps
      </Text>
    </Box>
  );
};

export default Services;
