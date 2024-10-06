import {
    Box,
    Button,
    useColorModeValue,
    Flex,
    Text,
    HStack,
    useToast,
    Icon,
    useDisclosure,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    VStack,
    FormLabel,
    Input
} from '@chakra-ui/react';
import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, where, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase.js';
import ServerSettings from './Server/ServerSettings.jsx';
import Friend from './Server/Friend.jsx';
import { FaHashtag, FaVideo, FaTrash, FaEdit } from 'react-icons/fa';
import { getStorage } from 'firebase/storage';

function Channels({ serverId, onSelectChannel, onSelectVideoChannel }) {
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const textColor = useColorModeValue('black', 'white');
    const buttonHoverBgColor = useColorModeValue('gray.200', 'gray.600');

    const [isOpen, setIsOpen] = useState(false);
    const onOpen = () => setIsOpen(true);
    const onClose = () => setIsOpen(false);

    const [textChannels, setTextChannels] = useState([]);
    const [videoChannels, setVideoChannels] = useState([]);
    const [error, setError] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState(null);

    const toast = useToast();

    const handleClick = (channel) => {
        const { id, name } = channel;
        onSelectChannel({ id, name });
    };

    const handleVideoClick = (channel) => {
        const { id, name } = channel;
        onSelectChannel({ id, name });
        onSelectVideoChannel(true);
    };

    const fetchChannelsById = async () => {
        console.log('Fetching channels...');
        try {
            const channelsCollection = collection(db, 'channels');
            const q = query(channelsCollection, where('server', '==', serverId));
            const querySnapshot = await getDocs(q);
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

            setTextChannels(textChannelsData);
            setVideoChannels(videoChannelsData);
        } catch (error) {
            console.error('Error fetching channels:', error);
            setError('Error fetching channels. Please try again later.');
        }
    };

    useEffect(() => {
        console.log(serverId);
        if (serverId) {
            const channelsCollection = collection(db, 'channels');
            const q = query(channelsCollection, where('server', '==', serverId));

            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                fetchChannelsById();
            }, (error) => {
                console.error('Error in onSnapshot:', error);
                setError('Error fetching channels. Please try again later.');
            });

            return () => unsubscribe();
        }
    }, [serverId]);

    const handleDeleteChannel = async (channelId) => {
        try {
            const channelDocRef = doc(db, 'channels', channelId);
            const channelDoc = await getDoc(channelDocRef);

            if (channelDoc.exists()) {
                await deleteDoc(channelDocRef);
                toast({
                    title: "Channel deleted!",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            toast({
                title: "Error deleting channel",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.error("Error deleting channel:", error);
        }
    };

    const openEditModal = (channel) => {
        setSelectedChannel(channel);
        onEditOpen();
    };

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
            <Box flex="1" overflowY="auto" p={0} m={0}>
                {error && <Text color="red.500" p={4}>{error}</Text>}
                {serverId === process.env.REACT_APP_DEFAULT_SERVER && (
                    <>
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
                            <Button
                                w="100%"
                                justifyContent="flex-start"
                                p={2}
                                onClick={handleClick(process.env.REACT_APP_DEFAULT_CHANNEL)}
                                bg={bgColor}
                                color={textColor}
                                _hover={{ bg: buttonHoverBgColor }}
                            >
                                Updates
                            </Button>
                    </>
                )}
                {(textChannels.length > 0 || videoChannels.length > 0) ? (
                    <>
                        {serverId !== process.env.REACT_APP_DEFAULT_SERVER && textChannels.length > 0 && (
                            <>
                                <Box color={textColor} px={2} fontWeight={'md'}>
                                    <HStack>
                                        <FaHashtag />
                                        <Text>Text Channels</Text>
                                    </HStack>
                                </Box>
                                {textChannels.map(channel => (
                                    <Flex key={channel.id} justifyContent="space-between" alignItems="center" w="95%">
                                        <Button
                                            w="90%"
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
                                        <Flex alignItems="center">
                                            <Icon
                                                as={FaEdit}
                                                cursor="pointer"
                                                onClick={() => openEditModal(channel)}
                                            />
                                            <Icon
                                                as={FaTrash}
                                                cursor="pointer"
                                                onClick={() => handleDeleteChannel(channel.id)}
                                                color="red.500"
                                                ml={5}
                                            />
                                        </Flex>
                                    </Flex>
                                ))}
                            </>
                        )}

                        {videoChannels.length > 0 && (
                            <>
                                <Box color={textColor} px={2} fontWeight={'md'}>
                                    <HStack>
                                        <FaVideo />
                                        <Text>Video Channels</Text>
                                    </HStack>
                                </Box>
                                {videoChannels.map(channel => (
                                    <Flex key={channel.id} justifyContent="space-between" alignItems="center" w="95%">
                                    <Button
                                        w="90%"
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
                                    <Flex alignItems="center">
                                        <Icon
                                            as={FaEdit}
                                            cursor="pointer"
                                            onClick={() => openEditModal(channel)}
                                        />
                                        <Icon
                                            as={FaTrash}
                                            cursor="pointer"
                                            onClick={() => handleDeleteChannel(channel.id)}
                                            color="red.500"
                                            ml={5}
                                        />
                                    </Flex>
                                </Flex>
                                ))}
                            </>
                        )}
                    </>
                ) : (
                    <Box color={textColor} p={4}>No channels found.</Box>
                )}
            </Box>
            <Friend isOpen={isOpen} onClose={onClose} />
            <EditModal isOpen={isEditOpen} onClose={onEditClose} channel={selectedChannel} />
        </Flex>
    );
}

export default Channels;

export const EditModal = ({ isOpen, onClose, channel }) => {
    const [channelName, setChannelName] = useState('');

    useEffect(() => {
        if (channel) {
            setChannelName(channel.name);
        }
    }, [channel]);

    const submitEditHandler = async (e) => {
        e.preventDefault();
        try {
            await updateDoc(doc(db, 'channels', channel.id), {
                name: channelName,
                updatedAt: new Date(),
            });
            onClose();
        } catch (e) {
            console.error("Error updating document: ", e);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Channel</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
                        <form style={{ width: '100%' }} onSubmit={submitEditHandler}>
                            <FormLabel htmlFor="channelName">Channel Name</FormLabel>
                            <Input
                                required
                                id="ChannelName"
                                value={channelName}
                                onChange={(e) => setChannelName(e.target.value)}
                                placeholder={'Enter Channel name'}
                                type="text"
                                focusBorderColor="blue.500"
                            />
                            <Button colorScheme="blue" my={'4'} type="submit" mx="auto" display="block">
                                Update Channel
                            </Button>
                        </form>
                    </VStack>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
