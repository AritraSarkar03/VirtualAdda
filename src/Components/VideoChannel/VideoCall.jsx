import React, { useEffect, useState } from 'react';
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Spinner, Box, Center } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase.js';

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

// VideoCall Component
const VideoCall = ({ roomName }) => {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const user = auth.currentUser;
    const userId = user ? user.uid : null;

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
                    headers: {
                        'Content-Type': 'application/json',
                    },
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

    const handleRoomUpdate = (room) => {
        room.on('participantDisconnected', (participant) => {
            console.log(`${participant.identity} has disconnected`);
            navigate('/signin');
        });
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
        <LiveKitRoom
            video={true}
            audio={true}
            token={token}
            serverUrl={process.env.REACT_APP_WEBSOCKET_URL} // Ensure this is set correctly
            data-lk-theme="default"
            style={{ height: '94.5vh' }}
            onRoomUpdate={handleRoomUpdate}  // Handle room updates
        >
            <MyVideoConference />
            <RoomAudioRenderer />
            <ControlBar />
        </LiveKitRoom>
    );
}

export default VideoCall;
