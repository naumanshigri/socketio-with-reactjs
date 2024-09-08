const SocketEvent = Object.freeze({
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',

  NEW_USER: 'new_user',
  GET_USERS: 'get_users',
  USER_DISCONNECTED: 'user_disconnected',
  CHANGE_NAME: 'change_name',

  CREATE_ROOM: 'create_room',
  ROOM_CREATED: 'room_created',
  JOIN_ROOM: 'join_room',
  ROOM_JOINED: 'room_joined',
  CLOSE_ROOM: 'close_room',
  ROOM_CLOSED: 'room_closed',
  LEAVE_ROOM: 'leave_room',
  LEFT_ROOM: 'left_room',

  JOIN_NOTIFY: 'join_notify',
  JOIN_NOTIFY_ACKNOWLEDGE: 'join_notify_acknowledge',
  LEAVE_NOTIFY: 'leave_notify',
  JOIN_ROOM_NOTIFY: 'join_room_notify',
  JOIN_ROOM_NOTIFY_ACKNOWLEDGE: 'join_room_notify_acknowledge',
  LEAVE_ROOM_NOTIFY: 'leave_room_notify',
  REMOVED_FROM_ROOM_NOTIFY: 'removed_from_room_notify',

  TYPING_NOTIFY: 'typing_notify',
  TYPING_STOPPED_NOTIFY: 'typing_stopped_notify',
  TYPING_ROOM_NOTIFY: 'typing_room_notify',
  TYPING_STOPPED_ROOM_NOTIFY: 'typing_stopped_room_notify',

  SENT_MESSAGE: 'sent_message',
  PRIVATE_MESSAGE: 'private_message',
  RECEIVED_MESSAGE: 'received_message',
  ROOM_MESSAGE: 'room_message',
  ROOM_MESSAGE_LIST: 'room_message_list',
  SAVE_MESSAGE: 'save_message',
});

module.exports = { SocketEvent };
