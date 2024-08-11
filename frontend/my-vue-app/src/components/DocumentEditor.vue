<template>
  <div class="container">
    <div class="sidebar">
      <div>
        <h3>Current User</h3>
        <div>
          <input type="text" v-model="username" :disabled="loggedIn" />
        </div>
        <button @click="login" v-if="!loggedIn">Log in as an editor</button>
      </div>

      <div>
        <!-- Display all active users editing the document -->
        <h3>Active Users</h3>
        <ul id="active-users-list">
          <li v-for="user in activeUsers" :key="user">
            {{ user }}
          </li>
        </ul>
      </div>

      <div>
        <h3>Document History</h3>
        <ul id="history-list">
          <li v-for="log in history" :key="log">
            {{ log }}
          </li>
        </ul>
      </div>
    </div>
    <div class="content">
      <div class="document-info">
        <input type="text" v-model="document.Title" :disabled="!loggedIn" @input="updateDocument"/>
        <!-- <p>Created by: User Name (date)</p> -->
      </div>
      <div id="editor" style="position: relative">
        <p v-if="!loggedIn">Log in to make edits to this document</p>
        <textarea
          class="textarea"
          ref="textareaRef"
          :disabled="!loggedIn"
          @click="getCoordinates"
          @input="updateDocument"
          v-model="document.Content"
        >
        </textarea>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../services/strapi.js";
import io from "socket.io-client";

export default {
  beforeMount() {
    this.socket = io("http://localhost:1337");

    this.socket.on("document:update", (data) => {
      this.document = data.data.attributes;
    });

    this.socket.on("active-users", (data) => {
      this.activeUsers = data.data;
    });

    this.socket.on("document-history", ({ data }) => {
      // only keeps track of the 10 latest actions
      if (this.history.length >= 10) {
        this.history.pop();
      }
      this.history.unshift(data);
    });
  },
  data() {
    return {
      socket: null,
      id: null,
      document: {
        Title: "",
        Content: "",
      },
      loggedIn: false,
      activeUsers: [],
      history: [],
      username: "",
    };
  },
  methods: {
    fetchDocument() {
      axios
        .get("/documents")
        .then(({ data }) => {
          if (data.data.length > 0) {
            this.id = data.data[0].id;
            this.document = data.data[0].attributes;
          } else {
            this.createDocument();
          }
        })
        .catch((err) => {
          let status = err.response.status;
          if (status === 404) {
            this.createDocument();
          }
        });
    },
    createDocument() {
      axios
        .post("/documents", {
          data: {
            Title: "New Document",
            Content: "start editing",
          },
        })
        .then(({ data }) => {
          this.id = data.data.id;
          this.document = data.data.attributes;
        });
    },
    updateDocument() {
      this.socket.emit("update-history", this.username);
      axios
        .put(`/documents/${this.id}`, {
          data: {
            Title: this.document.Title,
            Content: this.document.Content,
          },
        })
        .then(() => {});
    },
    login() {
      this.socket.emit("user-joined", this.username);
      this.loggedIn = true;
    },
  },
  mounted() {
    this.fetchDocument();
  },
};
</script>

<style>
body {
  font-family: sans-serif;
  margin: 0;
  padding: 0;
  display: flex;
  min-height: 100vh;
}

.container {
  display: flex;
  flex: 1;
  min-height: 100vh;
}

.sidebar {
  width: 40%;
  padding: 20px;
  border-right: 1px solid #ddd;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.sidebar h2 {
  margin-top: 0;
  margin-bottom: 10px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 5px;
}

.content {
  flex: 1;
  padding: 20px;
  height: 100%;
}

.document-info {
  margin-bottom: 20px;
}

.document-info h3 {
  font-size: 18px;
  margin-bottom: 5px;
}

#editor .textarea {
  width: 60vw;
  height: calc(100vh - 160px); /* Account for header and padding */
  border: 1px solid #ddd;
  padding: 10px;
  font-size: 16px;
}

input {
  padding: 8px;
  border-radius: 3px;
}

button {
  margin-top: 10px;
  padding: 6px;
  border: none;
  outline: none;
  background-color: #0d6aad;
  color: white;
  border-radius: 5px;
}

.cursor {
  display: inline-block;
  font-size: 20px;
  animation: blink 0.5s step-end infinite;
}

.cursor span {
  font-size: 12px;
  position: absolute;
  bottom: 0;
  visibility: hidden;
}

.cursor:hover span {
  visibility: visible;
}

@keyframes blink {
  0% {
    visibility: hidden;
  }
  50% {
    visibility: visible;
  }
}
</style>
