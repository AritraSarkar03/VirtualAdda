import React from 'react';
import { createLocalTracks, connect, RoomEvent } from 'livekit-client';

const VideoCall = ({token, video, audio}) => {
    const [room, setRoom] = useState(null);
    const [participants, setParticipants] = useState([]);
  
    useEffect(() => {
      // Function to connect to the LiveKit room
      const connectToRoom = async () => {
        if (!token) {
          console.error('No token provided for LiveKit connection');
          return;
        }
  
        try {
          // Connect to the room with the provided token
          const room = await connect(process.env.REACT_APP_WEBSOCKET_URL, token, {
            autoSubscribe: true,
          });
  
          setRoom(room);
  
          // Add event listeners for room events
          room.on(RoomEvent.ParticipantConnected, (participant) => {
            console.log(`Participant ${participant.identity} connected`);
            setParticipants((prev) => [...prev, participant]);
          });
  
          room.on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log(`Participant ${participant.identity} disconnected`);
            setParticipants((prev) =>
              prev.filter((p) => p.identity !== participant.identity)
            );
          });
  
          // Initialize local tracks (audio/video) and join the room
          const tracks = await createLocalTracks({
            audio: true,
            video: true,
          });
  
          tracks.forEach((track) => room.localParticipant.publishTrack(track));
  
          console.log('Successfully connected to the room:', roomName);
        } catch (error) {
          console.error('Error connecting to LiveKit room:', error);
        }
      };
  
      connectToRoom();
  
      // Cleanup function on component unmount
      return () => {
        if (room) {
          room.disconnect();
          console.log('Disconnected from room');
        }
      };
    }, [token, roomName]); // Re-run if token or roomName changes
  
    return (
      <div>
        <h2>LiveKit Room: {roomName}</h2>
        <p>Participants:</p>
        <ul>
          {participants.map((participant) => (
            <li key={participant.identity}>{participant.identity}</li>
          ))}
        </ul>
        {/* You can add more room-related UI elements like mute buttons, leave room button, etc. */}
      </div>
    );
  };

  export default VideoCall;