'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) { },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    const activeUsers = {};

    const { Server } = require("socket.io");

    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "*", // Allows any origin to connect
        methods: ["GET", "POST"], // Allowed methods
      },
    });

    io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('disconnect', () => {
        // delete active user from record and broadcast new list to connected users
        delete activeUsers[socket.id]
        io.emit('active-users', Object.values(activeUsers));
      });

      // emit the active users to the newly joined socket (user)
      io.to(socket.id).emit('active-users', Object.values(activeUsers));

      socket.on('user-joined', (username) => {
        activeUsers[socket.id] = username;
        io.emit('active-users', Object.values(activeUsers));
      });

      socket.on("edit-document", async (data) => {
        const { id, ...updateData } = data;
        await strapi.service('api::document.document').update(id, { data: updateData });
        // Broadcast the changes to all connected clients except the sender
        socket.broadcast.emit("document-updated", 
        { message: `${activeUsers[socket.id]} just made a change.`, updateData });
      });

      // Event listener for cursor movements
      socket.on("move-cursor", (data) => {
        // Broadcast the cursor position to all connected clients except the sender
        socket.broadcast.emit("cursor-moved", { ...data, user: activeUsers[socket.id] });
      });
    });
  },
};

// socket.on("edit-document", async (data) => {
//   // Broadcast the changes to all connected clients except the sender
//   socket.broadcast.emit("document-updated");

//   const { id, ...updateData } = data;
//   await strapi.service('api::document.document').update(id, { data: updateData });
// });


// Event listener for cursor movements
// socket.on("move-cursor", (data) => {
//   // Broadcast the cursor position to all connected clients except the sender
//   socket.broadcast.emit("cursor-moved", data);
// });


// socket.on('user_joined', (data) => {
//   io.emit('active-users', Object.values(this.activeUsers));
// })

// Event listener for cursor movements
// socket.on("move-cursor", (data) => {
  // Broadcast the cursor position to all connected clients except the sender
  // socket.broadcast.emit("cursor-moved", data);
// });