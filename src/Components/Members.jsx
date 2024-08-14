// import { Box, Button, VStack } from '@chakra-ui/react';
// import { collection, doc, getDocs, query, where } from 'firebase/firestore';
// import React, { useEffect, useState } from 'react';
// import { db } from '../firebase';
// import ServerSettings from './Server/ServerSettings'

// function Members({ serverId, channelId }) {
//     const [members, setMembers] = useState([]);

//     const handleClick = (channel) => {
//         const { id } = channel;
//         const { name } = channel;
//         const data = { id: id, name: name };
//         onSelectChannel(data);
//     };

//     useEffect(() => {
//         const fetchChannelsById = async () => {
//             try {
//                 const docRef = await getDocs(doc(db, 'servers', serverId));
//                 const members = docRef.data().members;
//                 console.log(members)
//             } catch (error) {
//                 console.error('Error fetching channels:', error);
//             }
//         };

//         if (serverId) {
//             fetchChannelsById();
//         }
//     }, [serverId]);

//     return (
//         <VStack
//             spacing={'0'}
//             w="100%"
//             h="100vh" // Adjust height as needed
//             bg="gray"
//             position="relative"
//             overflowY="auto" // Ensure vertical scroll is allowed
//             css={{
//                 '&::-webkit-scrollbar': {
//                     display: 'none',
//                 },
//                 scrollbarWidth: 'none',
//             }}
//         >
//             <Box
//                 w="100%"
//                 css={{
//                     // Hide scrollbar for WebKit browsers (e.g., Chrome, Safari)
//                     '&::-webkit-scrollbar': {
//                         display: 'none',
//                     },
//                     // Hide scrollbar for Firefox
//                     scrollbarWidth: 'none',
//                 }}
//             >
//                 {channels.length > 0 ? (
//                     channels.map(channel => (
//                         <Button
//                             key={channel.id}
//                             w="100%"
//                             justifyContent="flex-start"
//                             p={1}
//                             size={'xs'}
//                             onClick={() => { handleClick(channel) }}
//                         >
//                             {channel.name}
//                         </Button>
//                     ))
//                 ) : (
//                     <Box color="white">No channels found.</Box>
//                 )}
//             </Box>
//         </VStack>
//     );
// }

// export default Members;
