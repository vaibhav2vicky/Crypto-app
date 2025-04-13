import React, { useEffect } from 'react';
import Chat from '../components/Chat';

const User1 = () => {
  useEffect(() => {
    document.title = "User 1 Chat | Secure Messaging";
  }, []);

  return (
    <div>
      <Chat username="User1" otherUsername="User2" />
    </div>
  );
};

export default User1;