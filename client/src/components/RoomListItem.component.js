import React, { useState, useEffect } from 'react';

import GroupIcon from '../images/group.png';

function RoomListItem({
  room,
  userState,
  chatBoxList,
  setChatBoxList,
  setIsSidebarHidden,
}) {
  const [currentItemStatus, setCurrentItemStatus] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    try {
      const index = chatBoxList.findIndex((item) => item.id === room.roomId);
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
    var roomExists = chatBoxList.some((item) => {
      if (item.id === room.roomId) {
        return true;
      }
    });
    let temp = chatBoxList;
    if (roomExists) {
      const roomIndex = chatBoxList.findIndex((item) => item.id === room.roomId);
      const statusIndex = chatBoxList.findIndex((item) => item.status === 1);
      const currentStatus = temp[roomIndex].status;

      temp[statusIndex] = {
        ...temp[statusIndex],
        status: 0,
      };
      temp[roomIndex] = {
        ...temp[roomIndex],
        name: room.roomId,
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
      temp.push({ id: room.roomId, name: room.roomId, type: 'room', status: 1 });
    }
    setChatBoxList(temp);
    setChatBoxList((prevList) => [...prevList]);
  };

  const copyToClipboard = (e) => {
    e.stopPropagation();
    var range = document.createRange();
    range.selectNode(document.getElementById(`roomId-` + room.roomId));
    window.getSelection().removeAllRanges(); // clear current selection
    window.getSelection().addRange(range); // to select text
    document.execCommand('copy');
    window.getSelection().removeAllRanges(); // to deselect
    setShowTooltip(true);
    setTimeout(() => {
      setShowTooltip(false);
    }, 1000);
  };

  return (
    <li
      className={`room-list-item ${currentItemStatus === 1 && `active`}`}
      onClick={(e) => openChatWindow()}
    >
      <div className='img-div'>
        <img src={GroupIcon} alt='' />
      </div>

      {room.host.userId === userState.userId && <div className='host'>Host</div>}

      <div className='name-div'>
        <p id={`roomId-` + room.roomId}>{room.roomId}</p>
      </div>

      <div className='status-div'>
        {room.host.userId === userState.userId && (
          <span
            className='material-icons copy-btn'
            title='Copy RoomID'
            onClick={(e) => copyToClipboard(e)}
          >
            file_copy
          </span>
        )}
        <div className='status-color'></div>
      </div>

      {showTooltip && <div className='tooltip'>RoomID copied</div>}
    </li>
  );
}

export default RoomListItem;
