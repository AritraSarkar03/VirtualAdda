import React, { useEffect, useState } from 'react';
import { VStack, Text, HStack, Stack, Heading, Box, Container, Image } from '@chakra-ui/react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Header from '../Layout/Header'
import Footer from '../Layout/Footer';

function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>; 
  }

  return (
    <Box
    h={'100vh'}
    css={{
      overflow: 'scroll', // Change to 'auto' or 'scroll' if you need scrolling
      '::-webkit-scrollbar': {
        display: 'none',
      },
      '-ms-overflow-style': 'none',
      'scrollbar-width': 'none',
    }}
    >
    <Header/>
    <Container
      maxW="container.md"        
      height="92.5vh" 
      display="flex"              
      flexDirection={['column', 'row']}
      justifyContent={['center', 'space-between']}  
      alignItems="center"       
      p={8}
    >
      <VStack
        width="full"
        alignItems={['center', 'flex-start']}
      >
        <Heading children="Group chat that’s all fun & games " size={'2xl'} textTransform={'uppercase'} />
        <Text children="VirtualAdda is great for playing games and chilling with friends, or even building a worldwide community. Customize your own space to talk, play, and hang out." />
      </VStack>
        <Image
        boxSize={'50vh'}
        src={'https://firebasestorage.googleapis.com/v0/b/virtualadda-7a947.appspot.com/o/IMG_20240928_204316.jpg?alt=media&token=3428829d-4bb6-4753-baa3-1e7bf629ef28'}/>
    </Container>
    <Footer/>
    </Box>
  )
}

export default Home
