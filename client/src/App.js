import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';

import LeftSidebarComponent from './components/LeftSidebarComponent';
import ChatComponent from './components/ChatComponent';
import ChatRoomComponent from './components/ChatRoomComponent';

import LandingComponent from './components/LandingComponent';
import './styles/App.scss';

// const socket = io.connect('http://localhost:3001');
const socket = io.connect('/');

const App = () => {
  const [userState, setUserState] = useState({
    userId: '',
    name: '',
    color: '',
  });

  const [userList, setUserList] = useState([]);

  const [roomList, setRoomList] = useState([]);

  const [chatBoxList, setChatBoxList] = useState([]);

  const [isSidebarHidden, setIsSidebarHidden] = useState(false);

  // Ping Heroku server at fixed interval to stop it from sleeping
  useEffect(() => {
    setInterval(() => {
      pingServer();
    }, 600000);
  }, []);

  const pingServer = () => {
    const res = axios.get('/api');
    console.log(res);
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => setIsSidebarHidden(true),
    onSwipedRight: () => setIsSidebarHidden(false),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  useEffect(() => {
    console.log('***********************');
    console.log(chatBoxList);
    console.log('***********************');
  }, [chatBoxList]);

  return (
    <div className='main-content' {...handlers}>
      {userState.name.length === 0 ? (
        <LandingComponent userState={userState} setUserState={setUserState} />
      ) : (
        <>
          <LeftSidebarComponent
            socket={socket}
            userList={userList}
            setUserList={setUserList}
            userState={userState}
            chatBoxList={chatBoxList}
            setChatBoxList={setChatBoxList}
            roomList={roomList}
            setRoomList={setRoomList}
            // isSidebarHidden={isSidebarHidden}
            // setIsSidebarHidden={setIsSidebarHidden}
          />

          {chatBoxList.map((item, index) => {
            if (item.type === 'room') {
              let currentRoom = roomList.find((room) => room.roomId === item.id);
              return (
                <ChatRoomComponent
                  key={index}
                  socket={socket}
                  userState={userState}
                  chatBoxItem={item}
                  currentRoom={currentRoom}
                  setRoomList={setRoomList}
                  setChatBoxList={setChatBoxList}
                  setIsSidebarHidden={setIsSidebarHidden}
                />
              );
            } else {
              return <ChatComponent key={index} socket={socket} userState={userState} chatBoxItem={item} />;
            }
          })}
        </>
      )}
    </div>
  );
};

export default App;
