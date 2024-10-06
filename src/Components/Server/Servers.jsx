// Server.js
import React from 'react';
import { VStack, Avatar, Button, Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@chakra-ui/react';
import { FaPlus } from 'react-icons/fa';
import { auth } from '../../firebase';

const Servers = ({ servers, loading, addServer }) => {
    const user = auth.currentUser;
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const [newServer, setNewServer] = React.useState({});

  const handleAddServerClick = () => {
    // Logic for opening the add server modal
    setIsModalVisible(true);
  };

  const handleServerAdd = (serverData) => {
    addServer(serverData.id); // Add the new server to the list
    setIsModalVisible(false);
  };

  if (loading) {
    return <div>Loading...</div>; // Or a loader component
  }

  return (
    <VStack spacing={4}>
      {servers.map((server) => (
        <Tooltip label={server.name} key={server.id}>
          <Avatar src={server.photoURL} onClick={() => { /* handle server click */ }} />
        </Tooltip>
      ))}
      <Tooltip label="Add Server">
        <Button onClick={handleAddServerClick}>
          <FaPlus />
        </Button>
      </Tooltip>

      <Modal isOpen={isModalVisible} onClose={() => setIsModalVisible(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Server</ModalHeader>
          <ModalBody>
            {/* Add Server Form goes here */}
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleServerAdd({ id: 'newServerId' })}>Add</Button>
            <Button onClick={() => setIsModalVisible(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Servers;
