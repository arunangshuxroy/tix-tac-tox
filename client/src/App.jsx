import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import GameBoard from './components/GameBoard';
import Chat from './components/Chat';
import RoomStats from './components/RoomStats';

// Determine Socket.io server connection URL dynamically
const getSocketUrl = () => {
  // Respect environment variable if defined (for production splitting)
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl;

  const { hostname, origin } = window.location;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://${hostname}:3001`;
  }
  return origin; // In production, Express serves both static files and sockets
};

function App() {
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [role, setRole] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reactions, setReactions] = useState([]);
  const [myInfo, setMyInfo] = useState({ username: '', avatarColor: '#ec4899' });
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log(`Connecting to Socket server at: ${socketUrl}`);
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      upgrade: false
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server!');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server!');
      setIsConnected(false);
      setRoomId(null);
      setRole(null);
      setGameState(null);
      setMessages([]);
    });

    newSocket.on('room-joined', ({ roomId, role, gameState }) => {
      setRoomId(roomId);
      setRole(role);
      setGameState(gameState);
    });

    newSocket.on('room-update', (newGameState) => {
      setGameState(newGameState);
    });

    newSocket.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('emoji-reaction', (reaction) => {
      setReactions((prev) => [...prev, reaction]);
      
      // Auto-remove reaction after 2 seconds
      setTimeout(() => {
        setReactions((prev) => prev.filter((r) => r.id !== reaction.id));
      }, 2000);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleLeaveRoom = () => {
    if (socket) {
      window.location.reload();
    }
  };

  return (
    <>
      {/* Background Liquid Glass Ambient Blobs */}
      <div className="blob-container">
        <div className="ambient-blob blob-blue"></div>
        <div className="ambient-blob blob-magenta"></div>
        <div className="ambient-blob blob-cyan"></div>
      </div>

      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Header */}
        <header style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h1 className="minimal-title" style={{ letterSpacing: '0.2em', fontSize: '2.2rem' }}>
            TIX<strong>TAC</strong>TOX
          </h1>
          <p className="minimal-subtitle" style={{ fontSize: '0.72rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
            {isConnected ? (
              <>
                <span className="pulse-indicator"></span> ONLINE ARENA ACTIVE
              </>
            ) : (
              <span style={{ color: '#f43f5e' }}>ARENA STANDBY</span>
            )}
          </p>
        </header>

        {!roomId ? (
          <Lobby socket={socket} setMyInfo={setMyInfo} />
        ) : (
          <div className="layout-grid">
            {/* Room Controls & Scores */}
            <RoomStats 
              gameState={gameState} 
              role={role} 
              myInfo={myInfo} 
              roomId={roomId} 
              onLeave={handleLeaveRoom}
            />

            {/* Game Board */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GameBoard 
                gameState={gameState} 
                role={role} 
                socket={socket} 
              />
            </div>

            {/* Feed & Chat Panel */}
            <Chat 
              messages={messages} 
              socket={socket} 
              reactions={reactions} 
              myInfo={myInfo} 
              role={role}
            />
          </div>
        )}
      </main>
    </>
  );
}

export default App;
