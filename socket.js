const { Server } = require("socket.io");

const io = new Server({
 cors: {
   origin: "*", // Allows any origin to connect
   methods: ["GET", "POST"], // Allowed methods
 },
});

let activeUsers = {};

io.on("connection", (socket) => {
 console.log(`New client connected: ${socket.id}`);

 // Event listener for text changes
 socket.on("edit-document", (data) => {
   // Broadcast the changes to all connected clients except the sender
   socket.broadcast.emit("document-updated", data);
 });

 // Event listener for cursor movements
 socket.on("move-cursor", (data) => {
   // Broadcast the cursor position to all connected clients except the sender
   socket.broadcast.emit("cursor-moved", data);
 });

 // When a user joins, add them to the active users list
 socket.on('user-joined', (username) => {
   activeUsers[socket.id] = username;
   io.emit('active-users', Object.values(activeUsers));
 });


 // Handle disconnection
 socket.on("disconnect", () => {
   console.log(`Client disconnected: ${socket.id}`);
   delete activeUsers[socket.id];
   io.emit('active-users', Object.values(activeUsers));
 });
});


module.exports = io;