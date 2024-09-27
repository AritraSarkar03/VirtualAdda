import {
    Box,
    Button,
    useColorModeValue,
    Flex,
    Text
} from '@chakra-ui/react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import ServerSettings from './Server/ServerSettings';
import Friend from './Server/Friend';

function Channels({ serverId, onSelectChannel }) {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('black', 'white');
    const buttonHoverBgColor = useColorModeValue('gray.200', 'gray.600');
    
    // Modal control state for the Friend modal
    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);
    
    const [channels, setChannels] = useState([]);
    const [error, setError] = useState(null);

    const handleClick = (channel) => {
        const { id, name } = channel;
        onSelectChannel({ id, name });
    };

    useEffect(() => {
        const fetchChannelsById = async () => {
            try {
                const channelsCollection = collection(db, 'channels');
                const q = query(channelsCollection, where('server', '==', serverId));
                const querySnapshot = await getDocs(q);
                const channelsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setChannels(channelsData);
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
                {channels.length > 0 ? (
                    channels.map(channel => (
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
                        >
                            {channel.name}
                        </Button>
                    ))
                ) : (
                    <Box color={textColor} p={4}>No channels found.</Box>
                )}
                {/* The Friends button that opens the Friend modal */}
                {serverId === process.env.REACT_APP_DEFAULT_SERVER && (
                    <Button
                        w="100%"
                        justifyContent="flex-start"
                        p={1}
                        size="xs"
                        onClick={onOpen}
                        bg={bgColor}
                        color={textColor}
                        _hover={{ bg: buttonHoverBgColor }}
                    >
                        Friends
                    </Button>
                )}
            </Box>
            {/* Friend modal rendered outside the Box to avoid being affected by channel buttons */}
            <Friend isOpen={isOpen} onClose={onClose} />
        </Flex>
    );
}

export default Channels;
