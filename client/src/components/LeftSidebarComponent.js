import React, {  useEffect, Fragment } from 'react';

import Avatar from '../images/avatar.png';
import CreateJoinRoom from './CreateJoinRoom.component';
import UserListItem from './UserListItem.component';
import RoomListItem from './RoomListItem.component';
import { SocketEvent } from '../socket-event.enum';

function LeftSidebarComponent({
  socket,
  userList,
  setUserList,
  userState,
  chatBoxList,
  setChatBoxList,
  roomList,
  setRoomList,
}) {
  const { userId, name, color } = userState;

  // Tell server to add new user when userId changes
  useEffect(() => {
    socket.emit(SocketEvent.NEW_USER, userId, name, color);
  }, [userId]);


  // Watch the socket to update userList & roomList
  useEffect(() => {
    socket.on(SocketEvent.GET_USERS, (users) => {
      setUserList(users);
    });

    socket.on(SocketEvent.USER_DISCONNECTED, (disconnectedUserId) => {
      setUserList((prevList) => {
        let tempUserList = prevList;
        tempUserList = prevList.filter((item) => item.userId !== disconnectedUserId);
        return tempUserList;
      });
      setChatBoxList((prevList) => {
        let tempList = prevList;
        tempList = prevList.filter((item) => {
          if (item.id === disconnectedUserId && item.status === 1) {
          } else if (item.id !== disconnectedUserId) {
            return item;
          }
        });
        return tempList;
      });
    });

    socket.on(SocketEvent.ROOM_CLOSED, (closedRoomId) => {
      try {
        setChatBoxList((prevList) => {
          let tempList = prevList;
          tempList = tempList.filter((item) => item.id !== closedRoomId);
          return tempList;
        });
        setRoomList((prevList) => {
          let tempList = prevList;
          tempList = tempList.filter((roomItem) => roomItem.roomId !== closedRoomId);
          return tempList;
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on(SocketEvent.LEFT_ROOM, (from_roomId, leftUserId) => {
      try {
        if (leftUserId === userState.userId) {
          setChatBoxList((prevList) => {
            let tempList = prevList;
            tempList = tempList.filter((item) => item.id !== from_roomId);
            return tempList;
          });
          setRoomList((prevList) => {
            let tempList = prevList;
            tempList = tempList.filter((roomItem) => roomItem.roomId !== from_roomId);
            return tempList;
          });
        } else {
          setRoomList((prevList) => {
            let tempList = prevList;
            var roomIndex = tempList.findIndex((roomItem) => roomItem.roomId === from_roomId);
            let temp = tempList[roomIndex].participants.filter((participant) => participant.userId !== leftUserId);
            tempList[roomIndex].participants = temp;
            return tempList;
          });
        }
      } catch (error) {
        console.log(error);
      }
    });
  }, []);

  return (
    <Fragment>
      <div className={`left-sidebar-container`} >
        <div className={`left-sidebar`}>
          <div className='current-user' id='current-user'>
            <div className='avatar'>
              <img src={Avatar} alt='' />
            </div>
            <div className='details'>
              {name.length > 0 && (
                <div style={{ display: 'flex' }}>
                  <p className='name' title={name}>
                    {name}
                  </p>
                </div>
              )}
              <p className='userId'>
                User Id: <span>{userId}</span>
              </p>
            </div>
          </div>

          <div className='btn-container' id='btn-container'>
            <CreateJoinRoom socket={socket} userState={userState} roomList={roomList} setRoomList={setRoomList} />
          </div>

          <div className='user-list-container'>
            <p className='heading'>Online users and rooms</p>

            <ul className='user-list'>
              {roomList.map((room, index) => (
                <RoomListItem
                  key={index}
                  room={room}
                  userState={userState}
                  chatBoxList={chatBoxList}
                  setChatBoxList={setChatBoxList}
                />
              ))}

              {userList.map(
                (user, index) =>
                  user.userId !== userId && (
                    <UserListItem
                      key={index}
                      user={user}
                      chatBoxList={chatBoxList}
                      setChatBoxList={setChatBoxList}
                    />
                  ),
              )}
            </ul>
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default LeftSidebarComponent;
