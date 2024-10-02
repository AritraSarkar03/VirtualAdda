import React, { useEffect, useState } from 'react';
import { Box, Button, HStack, useBreakpointValue, VStack, useColorModeValue } from '@chakra-ui/react';
import { AiOutlineMenu } from 'react-icons/ai';
import Server from './Server/Server.jsx';
import Channels from './Channels.jsx';
import Chat from './ChatComponents/Chat.jsx';
import { useLocation } from 'react-router-dom';
import VideoChannel from './VideoChannel/VideoChannel.jsx';
import { ChatLoader } from './Layout/Loader.jsx';

function Page() {
  const location = useLocation();
  const { ServerId } = location.state || {};
  const { ChannelId } = location.state || {};
  const isTabletOrSmaller = useBreakpointValue({ base: true, xl: false });
  const [isSidebarVisible, setIsSidebarVisible] = useState(true); // Sidebar visibility state
  const [serverId, setServerId] = useState(process.env.REACT_APP_DEFAULT_SERVER);
  useEffect(() => {
    if (ServerId) setServerId(ServerId);
  }, [ServerId]);
  const [channel, setChannel] = useState(null);
  const [videoChannel, setVideoChannel] = useState(false);
  useEffect(() => {
    if (ChannelId) setChannel(ChannelId);
  }, [ChannelId]);
  const bgColor = useColorModeValue('gray.100', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.600');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleServerSelect = (id) => {
    setServerId(id);
  };

  const handleChannelSelect = (cid) => {
    setVideoChannel(false);
    setChannel(cid);
  };
  const handleVideoChannelSelect = (cid) => {
    setVideoChannel(true);
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
      <HStack
        bg={bgColor}
        h="100%"
        w={{ xl: '23%', base: '100%' }}
        overflow="auto"
        display={isSidebarVisible ? 'flex' : 'none'}
        spacing={0} // Ensure no spacing between children
        alignItems="stretch"
      >
        <Server serverId={serverId} onSelectServer={handleServerSelect} />
        <Channels serverId={serverId} onSelectChannel={handleChannelSelect} onSelectVideoChannel={handleVideoChannelSelect} />
      </HStack>


      {channel ? (<VStack
        bg={bgColor}
        h="100%"
        w={{ xl: '77%', base: '100%' }}
        display={isTabletOrSmaller && isSidebarVisible ? 'none' : 'block'}
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
          h={'5.5vh'}
          align="center"
          px={5}
          bg={headerBgColor}
          borderBottom="1px"
          borderColor={borderColor}
        // spacing={3}
        >
          {isTabletOrSmaller && (
            <Button onClick={toggleSidebar} variant="ghost">
              <AiOutlineMenu />
            </Button>
          )}
          <Box
            w="full"
            h="full"
            display="flex"
            alignItems="center"
          >
            {channel.name}
          </Box>
        </HStack>
        {!videoChannel && (<Chat channel={channel} serverId={serverId} flex="1" />)}
        {videoChannel && (<VideoChannel channel={channel} serverId={serverId} flex="1" />)}
      </VStack>) :
        <VStack
          bg={bgColor}
          h="100%"
          w={{ xl: '77%', base: '100%' }}
          display={isTabletOrSmaller && isSidebarVisible ? 'none' : 'block'}
        >
          <ChatLoader/>
        </VStack>}
    </HStack>
  );
}

export default Page;
