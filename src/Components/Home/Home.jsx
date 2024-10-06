import React from 'react';
import { VStack, Text, Heading, Box, Container, Image } from '@chakra-ui/react';
import Header from '../Layout/Header.jsx'
import Footer from '../Layout/Footer.jsx';

function Home() {
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
        src={'https://firebasestorage.googleapis.com/v0/b/virtual-adda-523b4.appspot.com/o/Illustration-with-young-people-talking-Graphics-18175733-1.png?alt=media&token=1d3de690-4076-46c3-b2ed-32b44f883d28'}/>
    </Container>
    <Footer/>
    </Box>
  )
}

export default Home
