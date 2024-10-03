import {
    Box,
    Button,
    useColorModeValue,
    Flex,
    Text,
    HStack
} from '@chakra-ui/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase.js';
import ServerSettings from './Server/ServerSettings.jsx';
import Friend from './Server/Friend.jsx';
import { FaHashtag, FaVideo } from 'react-icons/fa';

function Channels({ serverId, onSelectChannel, onSelectVideoChannel }) {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('black', 'white');
    const buttonHoverBgColor = useColorModeValue('gray.200', 'gray.600');

    // Modal control state for the Friend modal
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    const [textChannels, setTextChannels] = useState([]);
    const [videoChannels, setVideoChannels] = useState([]);
    const [error, setError] = useState(null);

    const handleClick = (channel) => {
        const { id, name } = channel;
        onSelectChannel({ id, name });
    };
    
    const handleVideoClick = (channel) => {
        const { id, name } = channel;
        onSelectChannel({ id, name });
        onSelectVideoChannel(true);
    };

    useEffect(() => {
        const fetchChannelsById = async () => {
            try {
                const channelsCollection = collection(db, 'channels');
                const q = query(channelsCollection, where('server', '==', serverId));
                const querySnapshot = await getDocs(q);

                // Separate channels by type
                const textChannelsData = [];
                const videoChannelsData = [];

                querySnapshot.docs.forEach((doc) => {
                    const channelData = { id: doc.id, ...doc.data() };
                    if (channelData.type === 'text') {
                        textChannelsData.push(channelData);
                    } else if (channelData.type === 'video') {
                        videoChannelsData.push(channelData);
                    }
                });

                // Set separate states for text and video channels
                setTextChannels(textChannelsData);
                setVideoChannels(videoChannelsData);
            } catch (error) {
                console.error('Error fetching channels:', error);
                setError('Error fetching channels. Please try again later.');
            }
        };

        if (serverId) {
            fetchChannelsById();
        }
    }, [serverId]);


    return (
        <Flex
            direction="column"
            flex="1"
            w="100%"
            bg={bgColor}
            position="relative"
            overflowY="auto"
            p={0}
            m={0}
        >
            <ServerSettings serverId={serverId} />
            <Box
                flex="1"
                overflowY="auto"
                p={0}
                m={0}
            >
                {error && <Text color="red.500" p={4}>{error}</Text>}
                {serverId === process.env.REACT_APP_DEFAULT_SERVER && (
                    <Button
                        w="100%"
                        justifyContent="flex-start"
                        p={2}
                        onClick={onOpen}
                        bg={bgColor}
                        color={textColor}
                        _hover={{ bg: buttonHoverBgColor }}
                    >
                        Friends
                    </Button>
                )}
                {(textChannels.length > 0 || videoChannels.length > 0) ? (
                    <>
                        {/* Section for Text Channels */}
                        {textChannels.length > 0 && (
                            <>
                                {serverId !== process.env.REACT_APP_DEFAULT_SERVER && (
                                    <>
                                        <Box color={textColor} px={2} fontWeight={'md'}>
                                        <HStack>
                                    <FaHashtag/> 
                                    <Text>Text Channels</Text>
                                    </HStack>
                                        </Box>
                                        {textChannels.map(channel => (
                                            <Button
                                                key={channel.id}
                                                w="100%"
                                                justifyContent="flex-start"
                                                p={1}
                                                size="xs"
                                                onClick={() => handleClick(channel)}
                                                bg={bgColor}
                                                color={textColor}
                                                _hover={{ bg: buttonHoverBgColor }}
                                                fontSize="sm"
                                                fontWeight="sm"
                                                pl={8} 
                                            >
                                                {channel.name}
                                            </Button>
                                        ))}
                                    </>
                                )}
                                {serverId === process.env.REACT_APP_DEFAULT_SERVER && (
                                    <>
                                        {textChannels.map(channel => (
                                            <Button
                                                key={channel.id}
                                                w="100%"
                                                justifyContent="flex-start"
                                                p={2}
                                                onClick={() => handleClick(channel)}
                                                bg={bgColor}
                                                color={textColor}
                                                _hover={{ bg: buttonHoverBgColor }}
                                            >
                                                {channel.name}
                                            </Button>
                                        ))}
                                    </>
                                )}

                            </>
                        )}

                        {/* Section for Video Channels */}
                        {videoChannels.length > 0 && (
                            <>
                                <Box color={textColor} px={2} fontWeight={'md'}>
                                    <HStack>
                                    <FaVideo/> 
                                    <Text>Video Channels</Text>
                                    </HStack>
                                    </Box>
                                {videoChannels.map(channel => (
                                    <Button
                                    key={channel.id}
                                    w="100%"
                                    justifyContent="flex-start"
                                    p={1}
                                    size="xs"
                                    onClick={() => handleVideoClick(channel)}
                                    bg={bgColor}
                                    color={textColor}
                                    _hover={{ bg: buttonHoverBgColor }}
                                    fontSize="sm"
                                    fontWeight="sm"
                                    pl={8}
                                    >
                                        {channel.name}
                                    </Button>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    <Box color={textColor} p={4}>No channels found.</Box>
                )}

                {/* The Friends button that opens the Friend modal */}
            </Box>
            {/* Friend modal rendered outside the Box to avoid being affected by channel buttons */}
            <Friend isOpen={isOpen} onClose={onClose} />
        </Flex>
    );
}

export default Channels;
