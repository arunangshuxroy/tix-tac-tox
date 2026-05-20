import { useState } from 'react';
import { Play, Plus } from 'lucide-react';

const AVATAR_COLORS = [
  '#ec4899', // Pink/Magenta
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6'  // Violet
];

function Lobby({ socket, setMyInfo }) {
  const [username, setUsername] = useState(() => {
    const descriptors = ['Super', 'Mega', 'Hyper', 'Neon', 'Cosmic', 'Pixel', 'Sonic'];
    const nouns = ['Player', 'Gamer', 'Master', 'Knight', 'Ninja', 'Specter', 'Wizard'];
    const randomDesc = descriptors[Math.floor(Math.random() * descriptors.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `${randomDesc}${randomNoun}${randomNum}`;
  });
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Enter a display name');
      return;
    }
    if (!joinRoomCode.trim()) {
      setError('Enter a room code');
      return;
    }
    setError('');
    
    const info = { username: username.trim(), avatarColor: selectedColor };
    setMyInfo(info);
    
    socket.emit('join-room', {
      roomId: joinRoomCode.trim(),
      ...info
    });
  };

  const handleCreate = () => {
    if (!username.trim()) {
      setError('Enter a display name');
      return;
    }
    setError('');

    const info = { username: username.trim(), avatarColor: selectedColor };
    setMyInfo(info);

    socket.emit('join-room', {
      roomId: null,
      ...info
    });
  };

  return (
    <div 
      className="liquid-glass-card" 
      style={{ 
        width: '100%', 
        maxWidth: '440px', 
        padding: '2.5rem 2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '2rem' 
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <span className="minimal-subtitle" style={{ fontSize: '0.7rem' }}>Combat Arena Entrance</span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '300', color: '#ffffff', marginTop: '0.2rem' }}>Configure Profile</h2>
      </div>

      {error && (
        <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.15)', color: '#fda4af', padding: '0.6rem 1rem', borderRadius: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Username / Avatar Setting */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <div 
            className="mini-avatar" 
            style={{ 
              backgroundColor: selectedColor, 
              width: '46px', 
              height: '46px', 
              flexShrink: 0,
              fontSize: '1.25rem',
              fontWeight: '600'
            }}
          >
            {username.trim() ? username.trim().charAt(0).toUpperCase() : '?'}
          </div>
          <input
            type="text"
            className="minimal-input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Display Name"
            maxLength={16}
          />
        </div>

        {/* Curated color select */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-slate)', letterSpacing: '0.05em' }}>ACCENT HIGHLIGHT</span>
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            {AVATAR_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{
                  backgroundColor: color,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: selectedColor === color ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: selectedColor === color ? `0 0 10px ${color}` : 'none',
                  cursor: 'pointer',
                  transform: selectedColor === color ? 'scale(1.1)' : 'none',
                  transition: 'all 0.3s var(--ease-spring)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

      {/* Lobby Choice */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <button 
          onClick={handleCreate} 
          className="btn-glass btn-glass-primary"
          style={{ width: '100%' }}
        >
          <Plus size={16} /> Create Private Room
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-slate)', fontSize: '0.75rem', fontWeight: '400', letterSpacing: '0.08em' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
          <span>OR MATCH CODE</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.04)' }} />
        </div>

        <form onSubmit={handleJoin} style={{ display: 'flex', gap: '0.6rem' }}>
          <input
            type="text"
            className="minimal-input"
            value={joinRoomCode}
            onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
            placeholder="6-LETTER CODE"
            maxLength={6}
            style={{ textAlign: 'center', letterSpacing: '0.2em', fontWeight: '600' }}
          />
          <button 
            type="submit" 
            className="btn-glass"
            style={{ flexShrink: 0 }}
          >
            <Play size={15} /> Join
          </button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;
