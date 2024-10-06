import React, { useEffect, useState } from 'react';
import {
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  Input,
  useClipboard,
  InputRightElement,
  InputGroup,
  Avatar,
  FormLabel,
  Box,
  VStack,
  ModalCloseButton,
  Tag,
  Flex,
  useToast,
  MenuButton,
  MenuList,
  MenuItem,
  Menu,
  RadioGroup,
  Radio,
  HStack,
} from '@chakra-ui/react';
import { auth, db } from '../../firebase.js';
import { deleteDoc, doc, getDoc, setDoc, updateDoc, arrayRemove, collection, arrayUnion } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import { FaCrown, FaShieldAlt, FaUser } from 'react-icons/fa';

export const fileUploadCss = {
  cursor: 'pointer',
  marginLeft: '-5%',
  width: '110%',
  border: 'none',
  height: '100%',
  color: '#800080',
  backgroundColor: 'white',
};

const fileUploadStyle = {
  '&::file-selector-button': fileUploadCss,
};

export const CreateChannelModal = ({ isOpen, onClose, serverId }) => {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text'); // default to 'text'

  const handleCreate = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const channelId = `${Date.now()}_${user.uid}`;
    try {
      // Add the channel document with the chosen ID
      await setDoc(doc(db, "channels", channelId), {
        id: channelId,
        server: serverId,
        name: channelName,
        admin: user.uid,
        type: channelType, // Include the selected channel type
        createdAt: new Date(),
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Channel</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            mb={4}
          />

          {/* RadioGroup for selecting channel type */}
          <RadioGroup onChange={setChannelType} value={channelType}>
            <HStack spacing={5}>
              <Radio value="text">Text Channel</Radio>
              <Radio value="video">Video Channel</Radio>
            </HStack>
          </RadioGroup>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleCreate}>
            Create
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};


export const InvitePeopleModal = ({ isOpen, onClose, serverId }) => {
  const content = `${process.env.REACT_APP_FRONTEND_URL}/server/${serverId}`;
  const { hasCopied, onCopy } = useClipboard(content);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invite People</ModalHeader>
        <ModalBody>
          <InputGroup mb={4}>
            <Input value={content} isReadOnly />
            <InputRightElement width="4.5rem">
              <Button h="1.75rem" size="sm" onClick={onCopy} colorScheme={'blue'}>
                {hasCopied ? "Copied" : "Copy"}
              </Button>
            </InputRightElement>
          </InputGroup>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const EditModal = ({ isOpen, onClose, serverId }) => {
  const [serverName, setServerName] = useState('');
  const [serverPhoto, setServerPhoto] = useState('');
  const submitEditHandler = async (e) => {
    e.preventDefault();
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `serverImages/${serverId}`);
      await uploadString(storageRef, serverPhoto, 'data_url');
      const serverDoc = await getDoc(doc(db, 'servers', serverId));
      const photoURL = await getDownloadURL(storageRef);

      const previousPhotoURL = serverDoc.data().photoURL;

      if (previousPhotoURL) {
        const previousPhotoRef = ref(storage, previousPhotoURL);
        await deleteObject(previousPhotoRef);
      }

      await updateDoc(doc(db, 'servers', serverId), {
        name: serverName,
        photoURL: photoURL,
        updatedAt: new Date(), // Updated timestamp
      });
    } catch (e) {
      console.error("Error updating document: ", e);
    }
    onClose();
  };

  const changeImageHandle = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServerPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Server</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
            <form style={{ width: '100%' }} onSubmit={submitEditHandler}>
              <Box my={'4'} display={'flex'} justifyContent={'center'}>
                <Avatar src={serverPhoto} size={'2xl'} />
              </Box>
              <FormLabel htmlFor="serverName">Server Name</FormLabel>
              <Input
                required
                id="serverName"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder={'Enter server name'}
                type="text"
                focusBorderColor="blue.500"
              />
              <Box my={'4'}>
                <FormLabel htmlFor="chooseServerPhoto">Choose Server Photo</FormLabel>
                <Input
                  accept="image/*"
                  onChange={changeImageHandle}
                  required
                  id="chooseServerPhoto"
                  type="file"
                  focusBorderColor="blue.500"
                  css={fileUploadStyle}
                />
              </Box>
              <Button colorScheme="blue" my={'4'} type="submit" mx="auto" display="block">
                Update Server
              </Button>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};




export const MemberModal = ({ isOpen, onClose, serverId, userId }) => {
 
  const [admin, setAdmin] = useState(null);
  const [moderators, setModerators] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const user = auth.currentUser;
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const serverRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverRef);

        if (serverDoc.exists()) {
          const { members: { admin, member, moderator } } = serverDoc.data();

          const usersRef = collection(db, 'users');
          const adminDoc = admin ? await getDoc(doc(usersRef, admin)) : null;
          const adminData = adminDoc ? { ...adminDoc.data() } : null;

          const memberDocs = await Promise.all(member.map(uid => getDoc(doc(usersRef, uid))));
          const moderatorDocs = await Promise.all(moderator.map(uid => getDoc(doc(usersRef, uid))));

          const memberData = memberDocs.map(doc => ({ ...doc.data() }));
          const moderatorData = moderatorDocs.map(doc => ({ ...doc.data() }));

          setAdmin(adminData);
          setMembers(memberData);
          setModerators(moderatorData);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    };

    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen, serverId]);

  const toast = useToast();

  const handlePromote = async () => {
    try {
      if (serverId && selectedUserId) {
        const serverDocRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverDocRef);
        if (serverDoc.exists()) {
          const data = serverDoc.data();
          const moderators = Array.isArray(data?.members?.moderator)
            ? data.members.moderator
            : [];
          const members = Array.isArray(data?.members?.member)
            ? data.members.member
            : [];
  
          // Remove user from members and add to moderators
          const updatedMembers = members.filter(id => id !== selectedUserId);
          const updatedModerators = [...moderators, selectedUserId];
  
          await updateDoc(serverDocRef, {
            'members.moderator': updatedModerators,
            'members.member': updatedMembers,
          });
  
          toast({
            title: "User promoted.",
            description: "User promoted successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error promoting user.",
        description: "There was a problem promoting the user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleDemote = async () => {
    try {
      if (serverId && selectedUserId) {
        const serverDocRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverDocRef);
        if (serverDoc.exists()) {
          const data = serverDoc.data();
          const moderators = Array.isArray(data?.members?.moderator)
            ? data.members.moderator
            : [];
          const members = Array.isArray(data?.members?.member)
            ? data.members.member
            : [];
  
          // Remove user from moderators and add to members
          const updatedModerators = moderators.filter(id => id !== selectedUserId);
          const updatedMembers = [...members, selectedUserId];
  
          await updateDoc(serverDocRef, {
            'members.moderator': updatedModerators,
            'members.member': updatedMembers,
          });
  
          toast({
            title: "User demoted.",
            description: "User demoted successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
  
          
        }
      }
    } catch (error) {
      toast({
        title: "Error demoting user.",
        description: "There was a problem demoting the user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  

  const handleKick = async () => {
    try {
      if (serverId && selectedUserId) {
        const serverDocRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverDocRef);
        if (serverDoc.exists()) {
          const data = serverDoc.data();
          const moderators = Array.isArray(data?.members?.moderator)
            ? data.members.moderator
            : [];
          const members = Array.isArray(data?.members?.member)
            ? data.members.member
            : [];

          const updatedModerators = moderators.filter(id => id !== selectedUserId);
          const updatedMembers = members.filter(id => id !== selectedUserId);

          await updateDoc(serverDocRef, {
            'members.moderator': updatedModerators,
            'members.member': updatedMembers,
          });

          toast({
            title: "User kicked.",
            description: "User was kicked successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          onClose(); // Optionally close the modal after kicking
        }
      }
    } catch (error) {
      toast({
        title: "Error kicking user.",
        description: "There was a problem kicking the user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddFriend = async () => {
    try {
      console.log(selectedUserId);
      const userDocRef = doc(db, 'users', selectedUserId);

      // Get the target user's document
      const userSnapshot = await getDoc(userDocRef);
  
      if (userSnapshot.exists()) {
        // Update the requests array by adding the current user's UID
        await updateDoc(userDocRef, {
          requests: arrayUnion(user.uid)
        });
        
      }
      toast({
        title: "Request Sent",
        description: "User was asked to accept request.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error.",
        description: "Error in sending request.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Flex direction="column" align="center" gap={4}>
              Members
            </Flex>
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" align="center" gap={4}>
              {admin && (
                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    onClick={() => setSelectedUserId(admin.uid)}
                  >
                    {admin.name} <Tag ml={2}><FaCrown /></Tag>
                  </MenuButton>
                  {user.uid !== selectedUserId && 
                  <MenuList>
                    <MenuItem onClick={()=>handleAddFriend()}>Add Friend</MenuItem>
                  </MenuList>}
                </Menu>
              )}
              {moderators.map((moderator, index) => (
                <Menu key={index}>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    onClick={() => setSelectedUserId(moderator.uid)}
                  >
                    {moderator.name} <Tag ml={2}><FaShieldAlt /></Tag>
                  </MenuButton>
                  {user.uid !== selectedUserId && 
                    <MenuList>
                      <MenuItem onClick={handleAddFriend}>Add Friend</MenuItem>
                      {user.uid === admin.uid && <>
                    <MenuItem onClick={() => handleDemote()}>
                      Demote
                    </MenuItem>
                    <MenuItem onClick={handleKick}>Kick</MenuItem>
                    </>}
                      </MenuList>
                 }
                </Menu>
              ))}
              {members.map((member, index) => (
                <Menu key={index}>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    onClick={() => setSelectedUserId(member.uid)}
                  >
                    {member.name} <Tag ml={2}><FaUser /></Tag>
                  </MenuButton>
                 
                  {user.uid !== selectedUserId && 
                    <MenuList>
                      <MenuItem onClick={handleAddFriend}>Add Friend</MenuItem>
                      {user.uid === admin.uid && <>
                    <MenuItem onClick={() => handlePromote()}>
                      Promote
                    </MenuItem>
                    <MenuItem onClick={handleKick}>Kick</MenuItem>
                    </>}
                      </MenuList>
                 }
                 
                </Menu>
              ))}
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};


export const MemberSettingsModal = ({ isOpen, onClose, serverId, userId }) => {
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (isOpen && serverId && userId) {
      const fetchModeratorStatus = async () => {
        setLoading(true);
        try {
          const serverDoc = await getDoc(doc(db, 'servers', serverId));
          if (serverDoc.exists()) {
            const moderators = Array.isArray(serverDoc.data()?.members?.moderator) ? serverDoc.data().members.moderator : [];
            setIsModerator(moderators.includes(userId));
          }
        } catch (error) {
          toast({
            title: "Error fetching status.",
            description: "There was a problem fetching the moderator status.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        } finally {
          setLoading(false);
        }
      };

      fetchModeratorStatus();
    }
  }, [isOpen, serverId, userId, toast]);

  const handlePromoteOrDemote = async () => {
    setLoading(true);
    try {
      if (serverId && userId) {
        const serverDocRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverDocRef);
        if (serverDoc.exists()) {
          const data = serverDoc.data();
          const moderators = Array.isArray(data?.members?.moderator) ? data.members.moderator : [];
          const members = Array.isArray(data?.members?.member) ? data.members.member : [];

          let updatedModerators;
          let updatedMembers;

          if (isModerator) {
            // Demoting
            updatedModerators = moderators.filter(id => id !== userId);
            updatedMembers = [...members, userId];
          } else {
            // Promoting
            updatedMembers = members.filter(id => id !== userId);
            updatedModerators = [...moderators, userId];
          }

          await updateDoc(serverDocRef, {
            'members.moderator': updatedModerators,
            'members.member': updatedMembers
          });

          toast({
            title: `User ${isModerator ? 'demoted' : 'promoted'}.`,
            description: `User ${isModerator ? 'demoted' : 'promoted'} successfully.`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          // Update local state
          setIsModerator(!isModerator);
        }
      }
    } catch (error) {
      toast({
        title: "Error updating status.",
        description: "There was a problem updating the user's status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKick = async () => {
    setLoading(true);
    try {
      if (serverId && userId) {
        const serverDocRef = doc(db, 'servers', serverId);
        const serverDoc = await getDoc(serverDocRef);
        if (serverDoc.exists()) {
          const data = serverDoc.data();
          const moderators = Array.isArray(data?.members?.moderator) ? data.members.moderator : [];
          const members = Array.isArray(data?.members?.member) ? data.members.member : [];

          const updatedModerators = moderators.filter(id => id !== userId);
          const updatedMembers = members.filter(id => id !== userId);

          await updateDoc(serverDocRef, {
            'members.moderator': updatedModerators,
            'members.member': updatedMembers
          });

          toast({
            title: "User kicked.",
            description: "User was kicked successfully.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });

          onClose(); // Optionally close the modal after kicking
        }
      }
    } catch (error) {
      toast({
        title: "Error kicking user.",
        description: "There was a problem kicking the user.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <Flex direction="column" align="center" gap={4}>
            <Button 
              variant="ghost" 
              onClick={handlePromoteOrDemote} 
              isDisabled={loading}
            >
              {isModerator ? 'Demote' : 'Promote'}
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleKick} 
              isDisabled={loading}
            >
              Kick
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
export const DeleteModal = ({ isOpen, onClose, serverId }) => {
  const handleDelete = async () => {
    try {
      const storage = getStorage();
      const serverDocRef = doc(db, 'servers', serverId);
      const serverDoc = await getDoc(serverDocRef);

      if (serverDoc.exists()) {
        const previousPhotoURL = serverDoc.data().photoURL;

        if (previousPhotoURL) {
          const previousPhotoRef = ref(storage, previousPhotoURL);
          await deleteObject(previousPhotoRef);
        }

        await deleteDoc(serverDocRef);
       
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Delete Server</ModalHeader>
        <ModalBody>
          <Text>Do you want to delete the server parmanently</Text>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleDelete}>
            Delete
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export const LeaveModal = ({ isOpen, onClose, serverId }) => {
  const handleLeave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user is currently logged in.');
  
      const serverRef = doc(db, 'servers', serverId);
      const serverDoc = await getDoc(serverRef);
  
      if (serverDoc.exists()) {
        const data = serverDoc.data();
        const { moderator, member } = data?.members || {};
  
        const updates = [];
  
        if (moderator.includes(user.uid)) {
          // Remove from moderator
          updates.push(updateDoc(serverRef, { 'members.moderator': arrayRemove(user.uid) }));
        }
  
        if (member.includes(user.uid)) {
          // Remove from member
          updates.push(updateDoc(serverRef, { 'members.member': arrayRemove(user.uid) }));
        }
  
        // Update user's servers array
        updates.push(updateDoc(doc(db, 'users', user.uid), {
          servers: arrayRemove(serverId)
        }));
  
        if (updates.length > 0) {
          // Execute all update operations
          await Promise.all(updates);
        } 
      } 
    } catch (e) {
      console.error("Error leaving the server:", e);
    }
    onClose();
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Leave Server</ModalHeader>
        <ModalBody>
          <Text
            value={'Do you want to leave the server parmanently'}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" mr={3} onClick={handleLeave}>
            Leave
          </Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
