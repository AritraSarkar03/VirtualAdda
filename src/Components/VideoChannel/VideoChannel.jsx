import { Flex, Text, Box, useColorModeValue, VStack, Button, Spinner, Center } from '@chakra-ui/react';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase.js';
import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

export const MyVideoConference = () => {
  const tracks = useTracks(
    [
      { source: 'camera', withPlaceholder: true },
      { source: 'microphone', withPlaceholder: true },
    ],
    { onlySubscribed: false },
  );

  return (
    <div>
      <GridLayout tracks={tracks} style={{ height: 'calc(94vh - var(--lk-control-bar-height))' }}>
        <ParticipantTile />
      </GridLayout>
    </div>
  );
}

const VideoChannel = ({ channel, serverId }) => {
  const [isCall, setIsCall] = useState(false); // This will be updated based on call status from Firestore
  const bg = useColorModeValue('white', 'gray.600');

  const { id } = channel;
  const user = auth.currentUser;
  const userId = user ? user.email : null;
  const roomName = id;

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Fetch user roles from Firestore and check if they are admin or moderator
  useEffect(() => {
    const fetchUserRoles = async () => {
      const serverRef = doc(db, 'servers', serverId);

      try {
        const snapshot = await getDoc(serverRef);
        
        if (snapshot.exists()) {
          const { members } = snapshot.data();
          const isAdmin = user.uid === members.admin;
          const isModerator = members.moderator && members.moderator.includes(user.uid);

          setHasAccess(isAdmin || isModerator);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error("Error fetching server data: ", error);
      }
    };

    fetchUserRoles();
  }, [serverId, user]);

  // Fetch token from serverless function
  useEffect(() => {
    if (!userId || !roomName) {
      setError('User not authenticated or room name missing.');
      setLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        const response = await fetch('/api/generateToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, roomName }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch token');
        }

        const data = await response.json();
        setToken(data.token);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching token:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchToken();
  }, [userId, roomName]);

  // Listen for changes to the call status (isCallActive) in Firestore
  useEffect(() => {
    const serverRef = doc(db, 'servers', serverId);

    const unsubscribe = onSnapshot(serverRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const { isCallActive } = docSnapshot.data();
        setIsCall(isCallActive); // Update isCall based on Firestore
      } else {
        console.log("No such document!");
      }
    });

    return () => unsubscribe();
  }, [serverId]);

  // Update Firestore to start a call
  const joinCall = async () => {
    const serverRef = doc(db, 'servers', serverId);

    try {
      // Update Firestore to set isCallActive to true
      await updateDoc(serverRef, { isCallActive: true });
      setIsCall(true); // Start the call in the frontend
    } catch (error) {
      console.error("Error updating call status: ", error);
    }
  };

  // Handle room events (when participants connect/disconnect)
  const handleRoomUpdate = (room) => {
    const participantDisconnected = (participant) => {
      console.log(`${participant.identity} has disconnected`);
    };

    const roomDisconnected = () => {
      console.log('Room disconnected');
      setIsCall(false); // Reset call status when the room disconnects
    };

    const participantConnected = (participant) => {
      console.log(`${participant.identity} has connected`);
    };

    room.on('participantDisconnected', participantDisconnected);
    room.on('roomDisconnected', roomDisconnected);
    room.on('participantConnected', participantConnected);

    return () => {
      room.off('participantDisconnected', participantDisconnected);
      room.off('roomDisconnected', roomDisconnected);
      room.off('participantConnected', participantConnected);
    };
  };

  if (loading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="100vh">
        <Box color="red.500">Error: {error}</Box>
      </Center>
    );
  }

  return (
    <VStack bg={bg} spacing={0} height="94.5vh">
      {isCall && token ? (
        <LiveKitRoom
          video={true}
          audio={true}
          token={token}
          serverUrl={process.env.REACT_APP_WEBSOCKET_URL}
          data-lk-theme="default"
          style={{ height: '94.5vh' }}
          onRoomUpdate={handleRoomUpdate}
        >
          <MyVideoConference />
          <RoomAudioRenderer />
          <ControlBar />
        </LiveKitRoom>
      ) : (
        <Flex align="center" justify="center" color="gray.400" flex='1'>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold">
              {hasAccess ? (
                <>
                  Click to Join or Start the Call!
                  <Button
                    colorScheme={'green'}
                    color={'white'}
                    onClick={joinCall} // Start the call
                    m={'5'}
                  >
                    Start Call
                  </Button>
                </>
              ) : isCall ? (
                <>
                  A Call is in progress
                  <Button
                    colorScheme={'green'}
                    color={'white'}
                    onClick={joinCall} // Join the ongoing call
                    m={'5'}
                  >
                    Join Call
                  </Button>
                </>
              ) : (
                'Please wait! The Call will be started soon!'
              )}
            </Text>
          </Box>
        </Flex>
      )}
    </VStack>
  );
}

export default VideoChannel;
