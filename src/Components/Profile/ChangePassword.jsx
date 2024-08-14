import React, { useState } from 'react';
import { Container, Heading, Input, Button, useToast, VStack, Box } from '@chakra-ui/react';
import { auth } from '../../firebase';
import { updatePassword } from 'firebase/auth';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  const changePasswordHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    try {
      await updatePassword(user, newPassword);
      toast({
        title: "Password Changed",
        description: "Your password has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setNewPassword('');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Container maxW="md" py="8" px={{ base: "4", md: "8" }}>
      <Box
        borderWidth={1}
        borderRadius="md"
        boxShadow="lg"
        p="6"
        bg="white"
        maxW="lg"
        mx="auto"
      >
        <Heading
          mb="6"
          textAlign="center"
          fontSize={{ base: "xl", md: "2xl" }}
          color="purple.600"
          textTransform="uppercase"
        >
          Change Password
        </Heading>
        <form onSubmit={changePasswordHandler}>
          <VStack spacing={4}>
            <Input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              variant="outline"
              focusBorderColor="purple.500"
              size="lg"
            />
            <Button
              isLoading={loading}
              type="submit"
              colorScheme="purple"
              size="lg"
              w="full"
            >
              Change Password
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default ChangePassword;
