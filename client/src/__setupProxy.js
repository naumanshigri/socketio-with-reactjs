// const { createProxyMiddleware } = require('http-proxy-middleware');
//
// module.exports = function (app) {
//   app.use(
//     '/api', // Replace '/api' with the endpoint path you want to proxy
//     createProxyMiddleware({
//       target: process.env.REACT_APP_SERVER_BASE_PATH || 'http://localhost:3001',
//       changeOrigin: true,
//     }),
//   );
//
//   app.use(
//     '/socket.io', // Replace '/api' with the endpoint path you want to proxy
//     createProxyMiddleware({
//       target: process.env.REACT_APP_SERVER_BASE_PATH || 'http://localhost:3001',
//       changeOrigin: true,
//       ws: true, // Enable WebSocket proxy
//     }),
//   );
// };
