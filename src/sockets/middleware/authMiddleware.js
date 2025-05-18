import sessionMiddleware from '../../config/session.js';

export default (socket, next) => {
  sessionMiddleware(socket.request, {}, next);
};
