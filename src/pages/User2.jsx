import React, { useEffect } from 'react';
import Chat from '../components/Chat';

const User2 = () => {
  useEffect(() => {
    document.title = "User 2 Chat | Secure Messaging";
  }, []);

  return (
    <div>
      <Chat username="User2" otherUsername="User1" />
    </div>
  );
};

export default User2;