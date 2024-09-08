import React, { useState, useEffect } from 'react';

import UserIcon from '../images/user.png';

function UserListItem({ user, chatBoxList, setChatBoxList, setIsSidebarHidden }) {
  const [currentItemStatus, setCurrentItemStatus] = useState(0);

  useEffect(() => {
    try {
      const index = chatBoxList.findIndex((item) => item.id === user.userId);
      const currentStatus = chatBoxList[index].status;
      setCurrentItemStatus(currentStatus);
      if (currentStatus) {
        setIsSidebarHidden(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, [chatBoxList]);

  // Open chat box
  const openChatWindow = () => {
    var userExists = chatBoxList.some((item) => {
      if (item.id === user.userId) {
        return true;
      }
    });
    let temp = chatBoxList;
    if (userExists) {
      const userIndex = chatBoxList.findIndex((item) => item.id === user.userId);
      const statusIndex = chatBoxList.findIndex((item) => item.status === 1);

      const currentStatus = temp[userIndex].status;

      temp[statusIndex] = {
        ...temp[statusIndex],
        status: 0,
      };
      temp[userIndex] = {
        ...temp[userIndex],
        name: user.name,
        status: currentStatus === 0 ? 1 : 0,
      };
    } else {
      const statusIndex = chatBoxList.findIndex((item) => item.status === 1);
      if (statusIndex >= 0) {
        temp[statusIndex] = {
          ...temp[statusIndex],
          status: 0,
        };
      }
      temp.push({ id: user.userId, name: user.name, type: 'private', status: 1 });
    }
    setChatBoxList(temp);
    setChatBoxList((prevList) => [...prevList]);
  };

  return (
    <li
      className={`user-list-item ${currentItemStatus === 1 && `active`}`}
      onClick={(e) => openChatWindow()}
    >
      <div className='img-div'>
        <img src={UserIcon} alt='' />
      </div>
      <div className='name-div'>
        <p>{user.name ? user.name : user.userId}</p>
      </div>
      <div className='status-div'>
        <div className='status-color'></div>
      </div>
    </li>
  );
}

export default UserListItem;
