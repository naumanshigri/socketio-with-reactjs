import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs'

import { SocketEvent } from '../socket-event.enum';
import { TypingNotifyDelay } from '../constant';

function ChatRoomComponent({
  socket,
  userState,
  chatBoxItem,
  currentRoom,
}) {


  const roomId = currentRoom.roomId;
  const status = chatBoxItem.status;

  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const [chatListElements, setChatListElements] = useState('');
  const [typingStatus, setTypingStatus] = useState('');
  

  useEffect(()=>{
    socket.on(SocketEvent.ROOM_MESSAGE_LIST, (message_list)=>{
      setChat(message_list)
    })
  },[])

  
  // Watch the socket to update chats and get notified
  useEffect(() => {
    socket.on(SocketEvent.ROOM_MESSAGE, (from_roomId, from_userId, from_name, from_color, message, messageId) => {
      if (from_roomId === roomId) {
        socket.emit(SocketEvent.SAVE_MESSAGE, {type: 'message', message, userId:from_userId, name:from_name, color:from_color, roomId:from_roomId, id:messageId})
      }
    });

    socket.on(SocketEvent.JOIN_ROOM_NOTIFY, (from_roomId, from_userId, from_name, notify_text) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        const id = uuid()
        socket.emit(SocketEvent.SAVE_MESSAGE, {type: 'notification', message:notify_text, userId:from_userId, name:from_name, color:'#00b518', roomId:from_roomId, id})
      }
    });

    socket.on(SocketEvent.JOIN_ROOM_NOTIFY_ACKNOWLEDGE, (from_roomId, from_userId, from_name, notify_text) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        const id = uuid()
        socket.emit(SocketEvent.SAVE_MESSAGE, {type: 'notification', message:notify_text, userId:from_userId, name:from_name, color:'#00b518', roomId:from_roomId, id})
      }
    });

    socket.on(SocketEvent.LEAVE_ROOM_NOTIFY, (from_roomId, from_userId, from_name, notify_text) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        const id = uuid()
        socket.emit(SocketEvent.SAVE_MESSAGE, {type: 'notification', message:notify_text, userId:from_userId, name:from_name, color:'#e00000', roomId:from_roomId, id})

      }
    });

    socket.on(SocketEvent.TYPING_ROOM_NOTIFY, (from_roomId, from_userId, from_name) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setTypingStatus(`${from_name ? from_name.split(' ')[0] : from_userId} is typing...`);
      }
    });

    socket.on(SocketEvent.TYPING_STOPPED_ROOM_NOTIFY, (from_roomId, from_userId) => {
      if (from_roomId === roomId && from_userId !== userState.userId) {
        setTypingStatus('');
      }
    });
  }, []);

  // Notify others if user joins or leaves the room
  useEffect(() => {
    if (status === 1) {
      document.getElementById(`message-input-` + roomId).focus();
      socket.emit(SocketEvent.JOIN_ROOM_NOTIFY, roomId, 'joined the chat');
    } else {
      socket.emit(SocketEvent.LEAVE_ROOM_NOTIFY, roomId, 'left the chat');
    }
  }, [status]);

  // Handle close room
  const closeRoom = () => {
    if (userState.userId === currentRoom.host.userId) {
      if (window.confirm(`Do you want to close the room (${currentRoom.roomId}) ?\nThis cannot be undone..!`)) {
        socket.emit(SocketEvent.CLOSE_ROOM, roomId);
      }
    }
  };

  // Handle leave room
  const leaveRoom = () => {
    if (window.confirm(`Do you want to leave the room (${currentRoom.roomId}) ?\nThis cannot be undone..!`)) {
      socket.emit(SocketEvent.LEAVE_ROOM, roomId, userState.userId);
      socket.emit(SocketEvent.LEAVE_ROOM_NOTIFY, roomId, 'left the room');
    }
  };

  // Update chatListElements when chat changes
  useEffect(() => {
    const all_chats = chat.map(({ type, userId, name, color, message, created_at }, index) => {
      if (type === 'message') {
        return (
          <div key={index} className={`chat-bubble ${userId === userState.userId ? ' right' : ''}`}>
            <p className='name' style={{ color: `${color}` }}>
              {name.length > 0 ? name : userId}
            </p>
            <p className='message'>{message}</p>
            <p className='message_time'>{dayjs(created_at).format('HH:mm A')}</p>
          </div>
        );
      } else if (type === 'notification') {
        return (
          <div key={index} className='notification-bubble'>
            <p className='notification-text' style={{ color: `${color}` }}>
              {name.length > 0 ? name : userId} {message}
            </p>
          </div>
        );
      }
    });
    
    setChatListElements(all_chats);
  }, [chat]);

  useEffect(() => {
    var element = document.getElementById('chat-list-' + roomId);
    element.scrollTop = element.scrollHeight;
  }, [chatListElements]);

  // Notify in room when user is typing
  useEffect(() => {
    document.getElementById(`message-input-${roomId}`)?.addEventListener('keydown', typingNotify);
    return () => {
      document.getElementById(`message-input-${roomId}`)?.removeEventListener('keydown', typingNotify);
    };
  }, []);

  let timer = null;
  const typingNotify = () => {
    socket.emit(SocketEvent.TYPING_ROOM_NOTIFY, roomId);
    clearTimeout(timer);
    timer = setTimeout(() => {
      socket.emit(SocketEvent.TYPING_STOPPED_ROOM_NOTIFY, roomId);
    }, TypingNotifyDelay);
  };

  // onChange
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  // Handle message submit
  const onMessageSubmit = (e) => {
    e.preventDefault();
    console.log('Event: ', e.target.message_id.value);
    const message_id = e.target.message_id.value
    
    const messageText = message.trim();
    if (messageText.length > 0) {
      socket.emit(SocketEvent.ROOM_MESSAGE, roomId, messageText, message_id);
      setMessage('');
    }
    document.getElementById('message-input-' + roomId).focus();
  };

  return (
    <div
      className='chat-box-container'
      id={`chat-box-container-${roomId}`}
      style={status === 0 ? { display: 'none' } : { display: 'block' }}
    >
      <div className='chat-box'>
        <div className='chat-list-container'>
          <div className='heading'>
            <p>RoomID: {roomId}</p>
            <p>{typingStatus}</p>

            <div className='details-box'>
              {userState.userId === currentRoom.host.userId ? (
                <button className='btn-outline btn-sm btn-outline-danger btn-top' onClick={() => closeRoom()}>
                  Close Room
                </button>
              ) : (
                <button className='btn-outline btn-sm btn-outline-danger btn-top' onClick={() => leaveRoom()}>
                  Leave Room
                </button>
              )}
            </div>
          </div>
          <div className='chat-list' id={`chat-list-` + roomId}>
            {chatListElements}
          </div>
        </div>

        <div className='chat-form'>
          <form onSubmit={onMessageSubmit}>
            <input name='message_id' type='hidden' id={Date.now() + roomId} value={uuid()} />
            <input
              id={`message-input-` + roomId}
              type='text'
              name='message'
              value={message}
              onChange={(e) => onChange(e)}
              placeholder='Type a message...'
              autoComplete='off'
              autoFocus
            />
            <button type='submit'>
              <span className='material-icons'>send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChatRoomComponent;
