// AboutUs.jsx
import { Avatar, Container, VStack, Text, Heading, Stack, Button, Box } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import termsAndConditions from './termsAndCondition.js';

const Founder = () => (
  <Stack direction={['column', 'row']} spacing={['4', '16']} padding={'8'} id="about">
    <VStack>
      <Avatar boxSize={['40', '48']} />
      <Text children="Co-founder" opacity={'0.7'} />
    </VStack>

    <VStack>
      <Heading children={'Aritra Sarkar'} size={['md', 'xl']} />
      <Text
        textAlign={['center', 'left']}
        children={
          'A developer who loves developing because the cause is unknown to him...'
        }
      />
    </VStack>
  </Stack>
);

const TandC = ({ termsAndCondition }) => (
  <Box id="terms-and-conditions">
    <Heading size={'md'} children={'Terms & Condition'} textAlign={['center', 'left']} my={'4'} />

    <Box h={'sm'} p={'4'} overflowY={'scroll'}>
      <Text textAlign={['center', 'left']} letterSpacing={'widest'}>
        {termsAndCondition}
      </Text>
      <Heading my={'4'} size={'xs'} children={'Refund only available within 7 days.'} />
    </Box>
  </Box>
);

const Services = () => {
  return (
    <Box id="services" p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Our Services
      </Heading>
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

const PrivacyPolicy = () => {
  return (
    <Box id="privacy-policy" p={4}>
      <Heading as="h2" size="lg" mb={4}>
        Privacy Policy
      </Heading>
      <Text>
        Your privacy is important to us. At VirtualAdda, we ensure that your personal information is kept secure and used responsibly. We do not sell or share your data with third parties without your consent.
      </Text>
      <Text>
        Please review our full privacy policy to understand how we collect, use, and protect your information.
      </Text>
    </Box>
  );
};

const AboutUs = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      // Remove the '#' from the hash
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Use a slight timeout to ensure the element is rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location]);

  return (
    <Container maxW={'container.lg'} padding={'16'} boxShadow={'lg'}>
      <Heading children="About Us" textAlign={['center', 'left']} />
      <Founder />

      <Stack m={'8'} direction={['column', 'row']} alignItems={'center'}>
        <Text>
          World's No.1 group chatting platform where you can find like-minded thinkers and spend time together.
        </Text>

        <RouterLink to="/mypage">
          <Button variant={'ghost'} colorScheme="blue">
            Checkout Our Platform
          </Button>
        </RouterLink>
      </Stack>

      <Services />
      <PrivacyPolicy />
      <TandC termsAndCondition={termsAndConditions}></TandC>
    </Container>
  );
};

export default AboutUs;
