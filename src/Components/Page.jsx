import React, { useEffect, useState } from 'react';
import { Box, Button, HStack, Text, useBreakpointValue, VStack, useColorModeValue } from '@chakra-ui/react';
import { AiOutlineMenu } from 'react-icons/ai';
import Server from './Server/Server';
import Channels from './Channels';
import Chat from './ChatComponents/Chat';
import { ColorModeSwitcher } from '../ColorModeSwitcher';

function Page() {
  const isTabletOrSmaller = useBreakpointValue({ base: true, xl: false });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visibility state
  const [serverId, setServerId] = useState(null);
  const [channel, setChannel] = useState(null); // Current selected channel

  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleServerSelect = (id) => {
    setServerId(id);
  };

  const handleChannelSelect = (cid) => {
    setChannel(cid);
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  useEffect(() => {
    if (isTabletOrSmaller) {
      if (channel) {
        setIsSidebarVisible(false); // Hide sidebar when chat is visible on smaller screens
      } else {
        setIsSidebarVisible(true);
      }
    } else {
      setIsSidebarVisible(true);
    }
  }, [channel, isTabletOrSmaller]);

  return (
    <HStack
      h="100vh"
      w="100vw"
      spacing={0}
      overflow="hidden"
    >
      {console.log(isSidebarVisible)}
      <HStack
    bg={bgColor}
    h="100%"
    w={{ xl: '23%', base: '100%' }}
    overflow="auto"
    display={isSidebarVisible ? 'flex' : 'none'}
    spacing={0} // Ensure no spacing between children
    alignItems="stretch"
>
    <Server onSelectServer={handleServerSelect} />
    <Channels serverId={serverId} onSelectChannel={handleChannelSelect} />
</HStack>


      <VStack
        bg={bgColor}
        h="100%"
        w={{ xl: '77%', base: '100%' }}
        display={isTabletOrSmaller && isSidebarVisible?'none':'block'}
        overflow="auto" 
        css={{ 
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
        }} 
      >
        <HStack
          w="100%"
          align="center"
          px={5}
          bg={headerBgColor}
          borderBottom="1px"
          borderColor={borderColor}
          spacing={3}
        >
          {isTabletOrSmaller && (
            <Button onClick={toggleSidebar} variant="ghost">
              <AiOutlineMenu />
            </Button>
          )}
          <Box
            w="full"
            h="5.5vh"
            display="flex"
            alignItems="center"
          >
            {channel ? channel.name : <Text>Loading...</Text>}
          </Box>
        </HStack>
        <Chat channel={channel} flex="1" /> {/* Ensure Chat takes up remaining space */}
      </VStack>
      {isTabletOrSmaller && !isSidebarVisible?(<ColorModeSwitcher/>):(<></>)}
    </HStack>
  );
}

export default Page;
