module.exports = {
  // Generate random username
  generateUsername: function (length) {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  console.log('generated username',result )
    return result;
  },

  // Generate random room id
  generateRoomId: function (length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  console.log('generated room id',result )

    return result;
  },

  // Generate random color
  generateRandomColor: function () {
    let randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
  console.log('generated randomColor',randomColor )

    return randomColor;
  },

  // Generate random userId
  generateUserId: function (length) {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
  console.log('generated user id',result )

    return result;
  },
};
