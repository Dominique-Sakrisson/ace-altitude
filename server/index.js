import express from "express";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
server.cors = {
  origin: [
    "http://localhost:5173", // dev
  ],
  methods: ["GET", "POST"],
};
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = join(__dirname, "..");
const viteBuildPath = join(__dirname, "../dist");
const viteFallbackPath = join(__dirname, "../dist/index.html");

const players = [];
// app.use(express.static(publicPath));

// // Serve the built Vite frontend
// app.use(express.static(viteBuildPath));

app.use(express.static(join(__dirname, "../dist")));

// Fallback for SPA routes
// app.get('*', (req, res) => {
//   res.sendFile(viteFallbackPath)
// })

// 2️⃣ Serve index.html explicitly
// app.get("/", (req, res) => {
//   res.sendFile(join(publicPath, "index.html"));
// });

io.on("connection", (socket) => {
  console.log("a user has connected");
  socket.on("disconnect", (payload) => {
    // console.log({ payload });
  });
  socket.on("new player", (player) => {
    socket.broadcast.emit("join players", player);
  });
  socket.on("spawn bullet", (shot) => {
   
    socket.broadcast.emit("spawn bullet", shot);
  });

  socket.on("player movement", (data) => {
    socket.broadcast.emit("player moved", data);
  });
});

server.listen(3000, () => {
  console.log("server running at port : 3000");
});
