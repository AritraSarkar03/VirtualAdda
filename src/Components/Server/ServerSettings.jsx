import {
    Button,
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    MenuDivider,
    useDisclosure,
    useColorModeValue,
    Icon
} from '@chakra-ui/react';
import { FaAngleDown, FaUserPlus, FaUsers, FaPlus, FaEdit, FaSignOutAlt, FaTrash } from "react-icons/fa";
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';
import { CreateChannelModal, InvitePeopleModal, MemberModal, EditModal, DeleteModal, LeaveModal } from './SettingFunctionality.jsx';
import { Loader } from '../Layout/Loader.jsx';
// Import other modals similarly

function ServerSettings({ serverId }) {
    const [server, setServer] = useState(null);
    const [memberStatus, setMemberStatus] = useState('member');

    const { isOpen: isInviteOpen, onOpen: onInviteOpen, onClose: onInviteClose } = useDisclosure();
    const { isOpen: isCreateChannelOpen, onOpen: onCreateChannelOpen, onClose: onCreateChannelClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const { isOpen: isMemberOpen, onOpen: onMemberOpen, onClose: onMemberClose } = useDisclosure();
    const { isOpen: isLeaveOpen, onOpen: onLeaveOpen, onClose: onLeaveClose } = useDisclosure();

    useEffect(() => {
        const fetchServerById = async () => {
            try {
                const serverDocRef = doc(db, 'servers', serverId);
                const serverDocSnapshot = await getDoc(serverDocRef);

                if (serverDocSnapshot.exists()) {
                    const serverData = { id: serverDocSnapshot.id, ...serverDocSnapshot.data() };
                    setServer(serverData); // Store the server data in state
                }
            } catch (error) {
                console.error('Error fetching server:', error);
            }
        };

        if (serverId) {
            fetchServerById();
        }
    }, [serverId]);


    useEffect(() => {
        const checkMembership = async () => {
            const status = await isJustMember(serverId);
            setMemberStatus(status);
        };

        if (serverId) {
            checkMembership();
        }
    }, [serverId]);

    const isJustMember = async (serverId) => {
        const user = auth.currentUser;

        if (!user) return 'member'; // Default to 'member' if no current user

        try {
            const serverDoc = await getDoc(doc(db, 'servers', serverId));
            if (!serverDoc.exists()) {
                return 'member';
            }

            const { members } = serverDoc.data();
            if (user.uid === members.admin) return 'admin';

            const isModerator = members.moderator.includes(user.uid);
            return isModerator ? 'moderator' : 'member';
        } catch (error) {
            return 'member';
        }
    };

    const bgColor = useColorModeValue('gray.100', 'gray.700'); // Background color
    const textColor = useColorModeValue('black', 'white'); // Text color
    const borderColor = useColorModeValue('gray.400', 'gray.500');

    return (
        server ? (<>
            <Menu isLazy>
                <MenuButton
                    as={Button}
                    w="100%"
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    p={1}
                    bg={bgColor}
                    color={textColor}
                    borderRight="1px"
                    borderBottom="1px"
                    borderColor={borderColor}
                    borderRadius="xs"
                    rightIcon={serverId !== process.env.REACT_APP_DEFAULT_SERVER && <FaAngleDown /> }
                    // isDisabled={serverId === process.env.REACT_APP_DEFAULT_SERVER}
                >
                    {server.name}
                </MenuButton>

                {/* Centering the MenuList and setting it to 80% width */}
                
                    <MenuList w={['138%','118%']}>
                        <MenuItem onClick={onInviteOpen} justifyContent="space-between">
                            Invite People
                            <Icon as={FaUserPlus} />
                        </MenuItem>

                        <MenuItem onClick={onMemberOpen} justifyContent="space-between">
                            Member
                            <Icon as={FaUsers} />
                        </MenuItem>

                        {memberStatus !== 'member' && (
                            <>
                                <MenuItem onClick={onCreateChannelOpen} justifyContent="space-between">
                                    Create Channel
                                    <Icon as={FaPlus} />
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem onClick={onEditOpen} justifyContent="space-between">
                                    Edit Server
                                    <Icon as={FaEdit} />
                                </MenuItem>
                            </>
                        )}

                        {memberStatus !== 'admin' && (
                            <>
                                <MenuItem onClick={onLeaveOpen} color="red.500" justifyContent="space-between">
                                    Leave Server
                                    <Icon as={FaSignOutAlt} />
                                </MenuItem>
                            </>
                        )}

                        {memberStatus === 'admin' && (
                            <>
                                <MenuItem onClick={onDeleteOpen} color="red.500" justifyContent="space-between">
                                    Delete Server
                                    <Icon as={FaTrash} />
                                </MenuItem>
                            </>
                        )}
                    </MenuList>
         
            </Menu>
            {/* Modals */}
            <InvitePeopleModal isOpen={isInviteOpen} onClose={onInviteClose} serverId={server.id} />
            <CreateChannelModal isOpen={isCreateChannelOpen} onClose={onCreateChannelClose} serverId={server.id} />
            <EditModal isOpen={isEditOpen} onClose={onEditClose} serverId={serverId} />
            <DeleteModal isOpen={isDeleteOpen} onClose={onDeleteClose} serverId={serverId} />
            <MemberModal isOpen={isMemberOpen} onClose={onMemberClose} serverId={serverId} />
            <LeaveModal isOpen={isLeaveOpen} onClose={onLeaveClose} serverId={serverId} />
        </>) : (<Loader />)
    );
}

export default ServerSettings;