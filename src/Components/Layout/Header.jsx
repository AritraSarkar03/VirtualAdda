import React from 'react';
import { HStack, VStack, useDisclosure, useToast } from '@chakra-ui/react';
import { ColorModeSwitcher } from '../../ColorModeSwitcher';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from '@chakra-ui/react';
import { AiOutlineMenu } from 'react-icons/ai';
import { RiDashboardFill, RiLogoutBoxLine } from 'react-icons/ri';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

const Header = ({ isAuthenticated, user }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const auth = getAuth();
  const toast = useToast();

  const logoutHandler = async () => {
    try {
      await signOut(auth);
      onClose();
      navigate('/signin');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "There was an error logging out.",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const LinkButton = ({ url, title }, onClose) => (
    <Link to={url}>
      <Button onClick={onClose} variant="ghost">{title}</Button>
    </Link>
  );

  return (
    <div>
      <Button
        onClick={onOpen}
        colorScheme={'purple'}
        width="12"
        zIndex={'overlay'}
        height={'12'}
        rounded={'full'}
        position={'fixed'}
        top={'4'}
        left={'6'}
      >
        <AiOutlineMenu />
      </Button>
      <ColorModeSwitcher />
      <Drawer placement="left" isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth={'1px'}>LearnTube</DrawerHeader>
          <DrawerBody>
            <VStack alignItems={'flex-start'} spacing={'4'}>
              <LinkButton url="/" title="Home" />
              <LinkButton url="/mypage" title="My Page" />
              <LinkButton url="/requestcourse" title="Request for a Course" />
              <LinkButton url="/contactus" title="Contact Us" />
              <LinkButton url="/about" title="About Us" />
            </VStack>
            <HStack position={'absolute'} bottom={'2rem'} justifyContent={'space-evenly'} width={'80%'}>
              {isAuthenticated ? (
                <VStack>
                  <HStack justifyContent={'space-evenly'}>
                    <Link to='/profile'>
                      <Button onClick={onClose} colorScheme="purple" variant="outline">
                        Profile
                      </Button>
                    </Link>
                    <Button onClick={logoutHandler}>
                      <RiLogoutBoxLine />
                      Sign out
                    </Button>
                  </HStack>
                  {user && user.role === 'admin' && (
                    <Link to='/admin/dashboard'>
                      <Button onClick={onClose} colorScheme="purple" variant="ghost">
                        <RiDashboardFill style={{ margin: '4px' }} />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                </VStack>
              ) : (
                <HStack>
                  <Link to='/signin'>
                    <Button onClick={onClose} colorScheme="purple" variant="outline">
                      Sign in
                    </Button>
                  </Link>
                  <p>OR</p>
                  <Link to='/signup'>
                    <Button onClick={onClose} colorScheme="purple" variant="outline">
                      Sign up
                    </Button>
                  </Link>
                </HStack>
              )}
            </HStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default Header;
