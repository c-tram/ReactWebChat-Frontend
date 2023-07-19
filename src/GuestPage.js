import React, { useState, useEffect, useCallback } from 'react';
import './GuestPage.css';
import io from 'socket.io-client';

const GuestPage = () => {
  const rooms = [
    { id: 1, name: 'Room 1' },
    { id: 2, name: 'Room 2' },
    { id: 3, name: 'Room 3' },
    // Add more rooms as needed
  ];

  const [currentChat, setCurrentChat] = useState('');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [chatName, setChatName] = useState('');
  const [backendUrl] = useState('http://localhost:3001'); // Replace with your backend server URL

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`${backendUrl}/messages/${currentChat}`);
      if (response.ok) {
        const data = await response.json();
        setChats((prevChats) => ({
          ...prevChats,
          [currentChat]: data,
        }));
      } else {
        console.log('Failed to fetch chat messages');
      }
    } catch (error) {
      console.log('Error fetching chat messages:', error);
    }
  }, [backendUrl, currentChat]);

  useEffect(() => {
    if (currentChat) {
      fetchMessages();
    }
  }, [currentChat, fetchMessages]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      setChats((prevChats) => {
        const updatedChats = {
          ...prevChats,
          [newMessage.roomId]: [...(prevChats[newMessage.roomId] || []), newMessage],
        };

        // If the current chat is the same as the new message's roomId, update the chat messages
        if (newMessage.roomId === currentChat) {
          return updatedChats;
        } else {
          // Otherwise, fetch the updated messages for the new message's roomId
          fetchMessages();
          return prevChats;
        }
      });
    };

    // Connect to the socket server
    const socket = io(backendUrl);

    socket.on('message', handleNewMessage);

    return () => {
      // Clean up the socket connection
      socket.off('message', handleNewMessage);
      socket.disconnect();
    };
  }, [backendUrl, currentChat, fetchMessages]);

  const saveMessage = async () => {
    if (!currentChat) {
      console.log('Not currently in a chat room');
      return;
    }

    const newMessage = {
      user: chatName || 'Guest',
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      roomId: currentChat,
    };

    try {
      const response = await fetch(`${backendUrl}/messages/${currentChat}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });

      if (response.ok) {
        setMessage('');
      } else {
        console.log('Failed to save chat message');
      }
    } catch (error) {
      console.log('Error saving chat message:', error);
    }
  };

  const handleJoin = (roomId, roomName) => {
    console.log(`Joining room ${roomId}`);
    setCurrentChat(roomId);
    // Implement the logic to join the room with the specified roomId
    if (!chats[roomId]) {
      setChats((prevChats) => ({
        ...prevChats,
        [roomId]: [],
      }));
    }
  };

  const handleLeave = (roomId) => {
    console.log(`Leaving room ${roomId}`);
    setCurrentChat('');
    // Implement the logic to leave the room with the specified roomId
  };

  const handleMessageSend = () => {
    console.log(`Sending message: ${message}`);
    try {
      if (!currentChat) {
        throw new Error('You are not currently in a chat room.');
      }
      const newMessage = {
        user: chatName || 'Guest',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        roomId: currentChat,
      };
      setChats((prevChats) => ({
        ...prevChats,
        [currentChat]: [...(prevChats[currentChat] || []), newMessage],
      }));
      setMessage('');
      saveMessage();
    } catch (error) {
      console.log(error.message);
      alert(error.message); // Display an alert to the user
    }
  };

  const getCurrentChatMessages = () => {
    return chats[currentChat] || [];
  };

  const handlePopupOpen = () => {
    setShowPopup(true);
  };

  const handlePopupClose = () => {
    setShowPopup(false);
  };

  const handleChatNameChange = (e) => {
    setChatName(e.target.value);
  };

  const handleChatNameSubmit = () => {
    handlePopupClose();
  };

  return (
    <div className="GuestChatContainer">
      <div className="roomColumn">
        <h3>Current Rooms</h3>
        <div className="chatRoomCSS">
          {rooms.map((room) => (
            <div key={room.id} className="roomItem">
              <div className="roomName">{room.name}</div>
              <div className="roomButtons">
                <button
                  className="chatRoomButton joinButton"
                  onClick={() => handleJoin(room.id, room.name)}
                >
                  Join
                </button>
                <button className="chatRoomButton leaveButton" onClick={() => handleLeave(room.id)}>
                  Leave
                </button>
              </div>
            </div>
          ))}
          <div className="tryAsGuestContainer">
            <button className="tryAsGuestButton" onClick={handlePopupOpen}>
              Change Name
            </button>
            {showPopup && (
              <div className="popupContainer">
                <div className="popupContent">
                  <h3>Enter Chat Name</h3>
                  <input
                    type="text"
                    value={chatName}
                    onChange={handleChatNameChange}
                    placeholder="Enter your chat name"
                  />
                  <button onClick={handleChatNameSubmit}>Submit</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="chatColumn">
        <h3>
          Current Chat -&gt;{' '}
          {currentChat ? rooms.find((room) => room.id === currentChat)?.name : 'Not Currently in a Chat'}
        </h3>
        <div className="currentChat">
          {getCurrentChatMessages().map((message, index) => (
            <div key={index} className="message">
              <div className="messageColumns">
                <span className="messageUser">{message.user}</span>
                <span className="messageContent">{message.content}</span>
                <span className="messageTimestamp">{message.timestamp}</span>
              </div>
              {index !== getCurrentChatMessages().length - 1 && <hr className="messageSeparator" />}
            </div>
          ))}
        </div>
        <div className="messageContainer">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
            className="messageInput"
          />
          <button onClick={handleMessageSend} className="sendMessageButton">
            Send
          </button>
        </div>
      </div>
      <div className="userColumn">
        <h3>Current Online</h3>
      </div>
    </div>
  );
};

export default GuestPage;
