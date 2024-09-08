import React, { useState, useEffect } from 'react';
import { SocketEvent } from '../socket-event.enum';

function CreateJoinRoom({ socket, userState, roomList, setRoomList }) {
  const { userId } = userState;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState('');

  useEffect(() => {
    socket.on(SocketEvent.ROOM_CREATED, (room) => {
      setRoomList((prevState) => [room, ...prevState]);
    });

    socket.on(SocketEvent.ROOM_JOINED, (roomId, joinedUserId, joinedUserName, room) => {
      if (joinedUserId === userId) {
        setRoomList((prevState) => [room, ...prevState]);
      } else {
        setRoomList((prevState) => {
          let roomIndex = prevState.findIndex((roomItem) => roomItem.roomId === roomId);
          const userExists = prevState[roomIndex].participants.some((user) => user.userId === joinedUserId);

          if (!userExists) {
            prevState[roomIndex].participants.push({
              userId: joinedUserId,
              name: joinedUserName,
            });
          }
          console.log(prevState);

          return prevState;
        });
        console.log(joinedUserId + ' joined ' + roomId);
      }
    });
  }, []);

  useEffect(() => {
    console.log(roomList);
  }, [roomList]);

  const onChange = (e) => {
    setFormData(e.target.value.trim());
  };

  const joinRoom = (e) => {
    e.preventDefault();
    socket.emit(SocketEvent.JOIN_ROOM, formData);
    setFormData('');
    setShowForm(false);
  };

  const createRoom = (e) => {
    e.preventDefault();
    socket.emit(SocketEvent.CREATE_ROOM);
    if (showForm) {
      setShowForm(false);
    }
  };

  return (
    <div>
      <div className='row1'>
        <button className='btn btn-md btn-success' onClick={(e) => createRoom(e)}>
          Create Room
        </button>
        <button className='btn btn-md btn-dark' onClick={() => setShowForm(!showForm)}>
          Join Room
        </button>
      </div>
      {showForm && (
        <div className='row2'>
          <form onSubmit={joinRoom}>
            <input
              type='text'
              name='joinRoomId'
              placeholder='Enter room id'
              autoFocus
              autoComplete='off'
              value={formData}
              onChange={onChange}
            />
            <button className='btn btn-sm btn-warning'>Join</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default CreateJoinRoom;
