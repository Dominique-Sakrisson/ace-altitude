import express from "express";import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicPath = join(__dirname, "..");

app.use(express.static(publicPath));

// 2️⃣ Serve index.html explicitly
app.get("/", (req, res) => {
  res.sendFile(join(publicPath, "index.html"));
});

io.on("connection", (socket) => {
  console.log("a user has connected");
});

server.listen(3000, () => {
  console.log("server running at port : 3000");
});
