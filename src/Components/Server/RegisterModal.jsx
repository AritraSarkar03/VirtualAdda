import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  VStack,
  Box,
  Avatar,
  AvatarBadge,
  Input,
  Button,
  FormLabel,
  Icon
} from '@chakra-ui/react';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { FiPlus } from 'react-icons/fi';
import { getAuth } from 'firebase/auth';

const RegisterServerModal = ({ isOpen, onClose, onAddServer }) => {
  const [loading, setLoading] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverPhoto, setServerPhoto] = useState('');
  const auth = getAuth();
  const db = getFirestore();

  const submitAddServerHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const user = auth.currentUser;
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `serverImages/${Date.now()}_${user.uid}`);
      await uploadString(storageRef, serverPhoto, 'data_url');
      const photoURL = await getDownloadURL(storageRef);
      const serverId = `${Date.now()}_${user.uid}`;
      await setDoc(doc(db, "servers", serverId), {
        id: serverId,
        name: serverName,
        members: {
          admin: user.uid,
          moderator: [],
          member: []
        },
        photoURL: photoURL,
        createdAt: new Date(),
      });
      await updateDoc(doc(db, "users", user.uid), {
        servers: arrayUnion(serverId)
      });

      // Call the parent function to update the server list
      onAddServer({ id: serverId, name: serverName, photoURL });

      onClose();
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setLoading(false);
    }
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
        <ModalHeader>Add a New Server</ModalHeader>
        <ModalBody>
          <VStack h={'full'} justifyContent={'center'} spacing={'16'}>
            <form style={{ width: '100%' }} onSubmit={submitAddServerHandler}>
              <Box my={'4'} display={'flex'} justifyContent={'center'}>
                <Avatar
                  size="xl"
                  name={serverName}
                  src={serverPhoto}
                  cursor="pointer"
                >
                  {serverPhoto === '' && (
                    <AvatarBadge
                      boxSize="1em"
                      bg="gray.500"
                    >
                      <Icon as={FiPlus} boxSize={3} />
                    </AvatarBadge>
                  )}
                </Avatar>
                <Input
                  type="file"
                  accept="image/*"
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  opacity={0}
                  cursor="pointer"
                  onChange={changeImageHandle}
                />
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
              <Button
                colorScheme="blue"
                my={'4'}
                type="submit"
                mx="auto"
                display="block"
                width={'full'}
                isDisabled={loading}
              >
                Add Server
              </Button>
            </form>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default RegisterServerModal;
