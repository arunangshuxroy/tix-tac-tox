import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files in production
const clientDistPath = path.join(__dirname, 'client', 'dist');
app.use(express.static(clientDistPath));

// Fallback all routes to frontend index.html (SPA routing support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// In-memory room storage
const rooms = new Map();

// Helper to generate room ID
function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Winning combinations for Tic Tac Toe
const WINNING_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWin(board) {
  for (const combo of WINNING_COMBOS) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], winningLine: combo };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', winningLine: null };
  }
  return null;
}

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Handle joining a room
  socket.on('join-room', ({ roomId, username, avatarColor }) => {
    let targetRoomId = roomId ? roomId.trim().toUpperCase() : null;

    // If no room ID provided, create a new room
    if (!targetRoomId) {
      do {
        targetRoomId = generateRoomId();
      } while (rooms.has(targetRoomId));
    }

    // Get or create room state
    if (!rooms.has(targetRoomId)) {
      rooms.set(targetRoomId, {
        id: targetRoomId,
        players: {
          X: null,
          O: null
        },
        spectators: [],
        board: Array(9).fill(null),
        turn: 'X',
        status: 'waiting', // waiting, playing, ended
        winner: null,
        winningLine: null,
        scores: { X: 0, O: 0, draws: 0 },
        rematchRequests: []
      });
    }

    const room = rooms.get(targetRoomId);
    let role = null;

    // Assign player or spectator role
    if (!room.players.X || room.players.X.socketId === socket.id) {
      role = 'X';
      room.players.X = { socketId: socket.id, username, avatarColor, connected: true };
    } else if (!room.players.O || room.players.O.socketId === socket.id) {
      role = 'O';
      room.players.O = { socketId: socket.id, username, avatarColor, connected: true };
    } else {
      role = 'spectator';
      // Prevent duplicate spectators
      if (!room.spectators.some(s => s.socketId === socket.id)) {
        room.spectators.push({ socketId: socket.id, username, avatarColor });
      }
    }

    // Bind room info to socket session
    socket.roomId = targetRoomId;
    socket.role = role;
    socket.username = username;
    socket.avatarColor = avatarColor;

    socket.join(targetRoomId);

    // If both players are present, start the game
    if (room.players.X && room.players.O && room.status === 'waiting') {
      room.status = 'playing';
      room.board = Array(9).fill(null);
      room.winner = null;
      room.winningLine = null;
    }

    // Send individual join confirmation
    socket.emit('room-joined', {
      roomId: targetRoomId,
      role,
      gameState: room
    });

    // Notify room of state change
    io.to(targetRoomId).emit('room-update', room);

    // Broadcast system message to room chat
    const joinedAs = role === 'spectator' ? 'a spectator' : `Player ${role}`;
    io.to(targetRoomId).emit('chat-message', {
      username: 'System',
      avatarColor: '#6b7280',
      role: 'system',
      text: `${username} joined as ${joinedAs}!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Handle player moves
  socket.on('make-move', ({ cellIndex }) => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    
    // Safety checks
    if (room.status !== 'playing') return;
    if (room.turn !== socket.role) return;
    if (room.board[cellIndex] !== null) return;

    // Apply move
    room.board[cellIndex] = socket.role;

    // Check game outcome
    const outcome = checkWin(room.board);

    if (outcome) {
      room.status = 'ended';
      room.winner = outcome.winner;
      room.winningLine = outcome.winningLine;
      room.rematchRequests = []; // Reset rematch approvals

      if (outcome.winner === 'draw') {
        room.scores.draws++;
        io.to(roomId).emit('chat-message', {
          username: 'System',
          avatarColor: '#6b7280',
          role: 'system',
          text: `It's a draw! What a intense match!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        room.scores[outcome.winner]++;
        const winnerName = room.players[outcome.winner]?.username || outcome.winner;
        io.to(roomId).emit('chat-message', {
          username: 'System',
          avatarColor: '#6b7280',
          role: 'system',
          text: `Player ${outcome.winner} (${winnerName}) wins the round!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    } else {
      // Toggle turns
      room.turn = room.turn === 'X' ? 'O' : 'X';
    }

    io.to(roomId).emit('room-update', room);
  });

  // Handle rematch requests
  socket.on('request-rematch', () => {
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    if (room.status !== 'ended') return;

    const role = socket.role;
    if (role !== 'X' && role !== 'O') return; // Spectators cannot request rematch

    if (!room.rematchRequests.includes(role)) {
      room.rematchRequests.push(role);
      
      // Notify about rematch state change
      io.to(roomId).emit('room-update', room);
      
      // Broadcast chat message
      io.to(roomId).emit('chat-message', {
        username: 'System',
        avatarColor: '#6b7280',
        role: 'system',
        text: `${socket.username} requested a rematch.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // If both players agreed, reset board
    if (room.rematchRequests.includes('X') && room.rematchRequests.includes('O')) {
      room.board = Array(9).fill(null);
      room.status = 'playing';
      room.winner = null;
      room.winningLine = null;
      room.rematchRequests = [];
      
      // Toggle starting player for fairness (winner starts, or just keep X starting. Let's make starting player alternate or toggle)
      room.turn = Math.random() < 0.5 ? 'X' : 'O';

      io.to(roomId).emit('room-update', room);
      io.to(roomId).emit('chat-message', {
        username: 'System',
        avatarColor: '#6b7280',
        role: 'system',
        text: `Rematch started! Play safe. Player ${room.turn} starts!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
  });

  // Handle incoming chat messages
  socket.on('chat-message', (text) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    io.to(roomId).emit('chat-message', {
      username: socket.username,
      avatarColor: socket.avatarColor,
      role: socket.role,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  // Handle floating emoji reactions
  socket.on('send-reaction', (emoji) => {
    const roomId = socket.roomId;
    if (!roomId) return;

    io.to(roomId).emit('emoji-reaction', {
      id: Math.random().toString(36).substring(2, 9),
      username: socket.username,
      emoji
    });
  });

  // Handle client disconnecting
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    const roomId = socket.roomId;
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    
    if (socket.role === 'X') {
      room.players.X = null;
      room.status = 'waiting';
      room.rematchRequests = [];
      io.to(roomId).emit('chat-message', {
        username: 'System',
        avatarColor: '#6b7280',
        role: 'system',
        text: `Player X (${socket.username}) left the game. Waiting for a player to join...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (socket.role === 'O') {
      room.players.O = null;
      room.status = 'waiting';
      room.rematchRequests = [];
      io.to(roomId).emit('chat-message', {
        username: 'System',
        avatarColor: '#6b7280',
        role: 'system',
        text: `Player O (${socket.username}) left the game. Waiting for a player to join...`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else if (socket.role === 'spectator') {
      room.spectators = room.spectators.filter(s => s.socketId !== socket.id);
      io.to(roomId).emit('chat-message', {
        username: 'System',
        avatarColor: '#6b7280',
        role: 'system',
        text: `Spectator ${socket.username} left.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    // Clean up empty rooms to conserve memory
    if (!room.players.X && !room.players.O && room.spectators.length === 0) {
      rooms.delete(roomId);
      console.log(`Room ${roomId} was deleted because it is empty.`);
    } else {
      io.to(roomId).emit('room-update', room);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
