// config/server.js

// const { Server } = require("socket.io");
const strapi = require("@strapi/strapi");

module.exports = ({ env }) => ({
  host: env("HOST", "0.0.0.0"),
  port: env.int("PORT", 1337),
  app: {
    keys: env.array("APP_KEYS"),
  },
  webhooks: {
    populateRelations: env.bool("WEBHOOKS_POPULATE_RELATIONS", false),
  },
});

// const io = new Server({
//   cors: {
//     origin: "*", // Allows any origin to connect
//     methods: ["GET", "POST"], // Allowed methods
//   },
// });

// strapi().then((app) => {
//   io.listen(app.server);
//   console.log(`Socket.io server running at http://localhost:${app.server.address().port}`);
// });
