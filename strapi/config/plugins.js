module.exports = () => ({
    io: {
        enabled: true,
        config: {
            // This will listen for all supported events on the document content type
            contentTypes: ['api::document.document'],
            socket: {
                serverOptions: {
                    cors: {
                        origin: "*",
                        methods: ["GET", "POST"],
                    },
                },
            },
            events: [
                {
                    name: 'connection',
                    handler: ({ strapi }, socket) => {
                        strapi.log.info(`[io] user with socket ${socket.id} connected.`);
                        strapi.activeUsers = strapi.activeUsers || []
                        strapi.$io.raw({ event: 'active-users', data: strapi.activeUsers.map(s => s.name) });
                    }
                },
                {
                    name: 'user-joined',
                    handler: ({ strapi }, socket, name) => {
                        strapi.log.info(`[io] trigger update for socket ${socket.id}.`);
                        socket.name = name;
                        strapi.activeUsers.push({ id: socket.id, name });
                        strapi.$io.raw({ event: 'active-users', data: strapi.activeUsers.map(s => s.name) });
                    },
                },
                {
                    name: "update-history",
                    handler: ({ strapi }, socket, name) => {
                        strapi.$io.raw({ event: 'document-history', data: `${name} just made a change` });
                    }
                },
                {
                    name: 'disconnect',
                    handler: ({ strapi }, socket) => {
                        strapi.log.info(`[io] user with socket ${socket.id} disconnected.`);
                        strapi.activeUsers = strapi.activeUsers.filter(s => s.id !== socket.id);
                        strapi.$io.raw({ event: 'active-users', data: strapi.activeUsers.map(s => s.name) });
                    }
                }
            ]
        },

    },
});
