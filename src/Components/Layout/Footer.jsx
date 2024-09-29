// Footer.jsx
import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  HStack
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box bg="gray.800" color="white" py={6}>
      <Container maxW="container.lg">
        <Stack spacing={4}>
          {/* Contact Information */}
          <HStack spacing={6} justify="space-between">
            <Stack spacing={1}>
              <Text fontWeight="bold">Contact Us</Text>
              <Text>Email: info@example.com</Text>
              <Text>Phone: (123) 456-7890</Text>
              <Text>Address: 123 Main St, City, Country</Text>
            </Stack>

            {/* Navigation Links */}
            <HStack spacing={4}>
              <Link as={RouterLink} to="/aboutus#about">
                About
              </Link>
              <Link as={RouterLink} to="/aboutus#services">
                Services
              </Link>
              <Link as={RouterLink} to="/aboutus#privacy-policy">
                Privacy Policy
              </Link>
              <Link as={RouterLink} to="/aboutus#terms-and-conditions">
                Terms & Conditions
              </Link>
            </HStack>
          </HStack>

          {/* Footer Bottom Text */}
          <Text textAlign="center" fontSize="sm">
            © {new Date().getFullYear()} VirtualAdda. All rights reserved.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;