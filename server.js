const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const usersFile = './users.json';
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]));

// Register
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  if (users.find(u => u.username === username)) return res.status(400).json({ message: 'Username exists' });
  users.push({ username, password });
  fs.writeFileSync(usersFile, JSON.stringify(users));
  res.json({ message: 'Registered' });
});

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ message: 'Login successful' });
});

// Socket.io real-time chat
io.on('connection', (socket) => {
  console.log('User connected', socket.id);

  socket.on('message', (msg) => {
    io.emit('message', msg); // broadcast to all users
  });

  socket.on('disconnect', () => {
    console.log('User disconnected', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
