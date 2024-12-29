// ./config/functions/bootstrap.js
module.exports = () => {
  const socket = require('../socket.io');
  socket(strapi).initialize();
};
