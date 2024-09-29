import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Icon,
  Divider,
  HStack,
} from '@chakra-ui/react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <Box bg="gray.800" color="white" py={6}>
      <Container maxW="container.lg">
        <Stack spacing={4}>          
          <HStack spacing={6} justify="space-between">
            <Stack spacing={1}>
              <Text fontWeight="bold">Contact Us</Text>
              <Text>Email: info@example.com</Text>
              <Text>Phone: (123) 456-7890</Text>
              <Text>Address: 123 Main St, City, Country</Text>
            </Stack>

            <Stack spacing={1}>
              <Text fontWeight="bold">Quick Links</Text>
              <Link href="#" color="teal.200">About Us</Link>
              <Link href="#" color="teal.200">Services</Link>
              <Link href="#" color="teal.200">Privacy Policy</Link>
              <Link href="#" color="teal.200">Terms of Service</Link>
            </Stack>

            <HStack spacing={4}>
              <Link href="#" isExternal>
                <Icon as={FaFacebook} boxSize={6} />
              </Link>
              <Link href="#" isExternal>
                <Icon as={FaTwitter} boxSize={6} />
              </Link>
              <Link href="#" isExternal>
                <Icon as={FaInstagram} boxSize={6} />
              </Link>
            </HStack>
          </HStack>

          <Text textAlign="center" fontSize="sm">
            © {new Date().getFullYear()} VirtualAdda. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
