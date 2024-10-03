import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase.js'; // Adjust the import based on your setup
import { Alert, AlertDescription, AlertIcon, AlertTitle, CloseButton } from '@chakra-ui/react';
import SignIn from '../Auth/SignIn.jsx';

function ServerMembers() {
  const { serverId } = useParams();
  const user = auth.currentUser;
  const [isMemberAdded, setIsMemberAdded] = useState(false);



  useEffect(() => {
    const addMembers = async () => {
      if (user) {
        try {
          await updateDoc(doc(db, "servers", serverId), {
            "members.member": arrayUnion(user.uid)
          });
          await updateDoc(doc(db, "users", user.uid), {
            servers: arrayUnion(serverId)
          });
          setIsMemberAdded(true); // Indicate that member addition was successful
        } catch (error) {
          console.error("Error adding member: ", error);
        }
      }
    };

    if (user) {
      addMembers();
    }
  }, [user, serverId]);

  if (isMemberAdded) {
    return <Navigate to="/mypage" replace />;
  }

  return (
    <>
      {!user && (
        <>
          <Alert status="warning">
            <AlertIcon />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>No user is currently logged in.</AlertDescription>
            <CloseButton position="absolute" right="8px" top="8px" />
          </Alert>
          <SignIn />
        </>
      )}
    </>
  );
}

export default ServerMembers;
