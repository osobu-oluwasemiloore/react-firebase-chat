// IncomingCall.jsx
import React from 'react';

const IncomingCall = ({ username, acceptCall, declineCall }) => {
  return (
    <div className="incoming-call">
      <h2>Incoming Call from {username}</h2>
      <button onClick={acceptCall}>Accept</button>
      <button onClick={declineCall}>Decline</button>
    </div>
  );
};

export default IncomingCall;
