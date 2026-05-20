import { useState } from 'react';
import { RefreshCw, Info, Volume2, VolumeX } from 'lucide-react';

// Web Audio API Synthesizer for high-fidelity retro sounds
const playSynthSound = (type, mute) => {
  if (mute) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'move') {
      // Snappy digital pop sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } 
    else if (type === 'win') {
      // Elegant minimal retro triad
      const notes = [293.66, 369.99, 440.00, 587.33]; // D major triad
      notes.forEach((freq, idx) => {
        const time = ctx.currentTime + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.005, time + 0.22);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + 0.25);
      });
    } 
    else if (type === 'draw') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.005, ctx.currentTime + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.42);
    } 
    else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    }
  } catch (e) {
    console.warn('Web Audio synthesis blocked', e);
  }
};

// Calculate SVG winning line coordinates based on winning combination index
const getWinLineCoords = (combo) => {
  if (!combo) return null;
  const comboStr = combo.toString();
  
  if (comboStr === '0,1,2') return { x1: 15, y1: 50, x2: 285, y2: 50 };
  if (comboStr === '3,4,5') return { x1: 15, y1: 150, x2: 285, y2: 150 };
  if (comboStr === '6,7,8') return { x1: 15, y1: 250, x2: 285, y2: 250 };
  
  if (comboStr === '0,3,6') return { x1: 50, y1: 15, x2: 50, y2: 285 };
  if (comboStr === '1,4,7') return { x1: 150, y1: 15, x2: 150, y2: 285 };
  if (comboStr === '2,5,8') return { x1: 250, y1: 15, x2: 250, y2: 285 };
  
  if (comboStr === '0,4,8') return { x1: 20, y1: 20, x2: 280, y2: 280 };
  if (comboStr === '2,4,6') return { x1: 280, y1: 20, x2: 20, y2: 280 };
  
  return null;
};

function GameBoard({ gameState, role, socket }) {
  const [muted, setMuted] = useState(false);
  const [shakingCell, setShakingCell] = useState(null);

  if (!gameState) return null;

  const { board, turn, status, winner, winningLine, rematchRequests, players } = gameState;
  const isMyTurn = role === turn;
  const isPlayer = role === 'X' || role === 'O';

  // Handle cell selection
  const handleCellClick = (index) => {
    if (!isPlayer) return;

    if (status !== 'playing' || !isMyTurn || board[index] !== null) {
      playSynthSound('error', muted);
      setShakingCell(index);
      setTimeout(() => setShakingCell(null), 400);
      return;
    }

    playSynthSound('move', muted);
    socket.emit('make-move', { cellIndex: index });
  };

  const handleRematch = () => {
    if (!isPlayer) return;
    socket.emit('request-rematch');
  };

  // SVGs for minimal elements
  const RenderX = () => (
    <svg className="cell-x-minimal" width="50%" height="50%" viewBox="0 0 100 100" fill="none">
      <path className="mark-x-path" d="M25 25L75 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path className="mark-x-path" d="M75 25L25 75" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );

  const RenderO = () => (
    <svg className="cell-o-minimal" width="55%" height="55%" viewBox="0 0 100 100" fill="none">
      <circle className="mark-o-path" cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );

  const RenderGhost = () => {
    if (role === 'X') {
      return (
        <svg style={{ opacity: 0.1, transition: 'opacity 0.3s' }} width="50%" height="50%" viewBox="0 0 100 100" fill="none">
          <path d="M25 25L75 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M75 25L25 75" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    }
    if (role === 'O') {
      return (
        <svg style={{ opacity: 0.1, transition: 'opacity 0.3s' }} width="55%" height="55%" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="4" fill="none" />
        </svg>
      );
    }
    return null;
  };

  const lineCoords = getWinLineCoords(winningLine);

  return (
    <div 
      className="liquid-glass-card" 
      style={{ 
        width: '100%', 
        padding: '2rem 1.75rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1.5rem', 
        position: 'relative' 
      }}
    >
      
      {/* Sound & Mode Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-slate)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
          <Info size={13} />
          {role === 'spectator' ? (
            <span>SPECTATING ARENA</span>
          ) : (
            <span>COMBATANT: <strong>ROLE {role}</strong></span>
          )}
        </div>

        <button 
          onClick={() => setMuted(!muted)} 
          style={{ background: 'none', border: 'none', color: 'var(--text-slate)', cursor: 'pointer', padding: '0.2rem', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.target.style.color = '#ffffff'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-slate)'}
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* Intersecting Hairline Game Board Grid */}
      <div className="minimal-grid">
        {board.map((cell, idx) => (
          <div
            key={idx}
            onClick={() => handleCellClick(idx)}
            className={`minimal-cell ${cell ? 'occupied' : ''} ${shakingCell === idx ? 'shake' : ''}`}
          >
            {cell === 'X' && <RenderX />}
            {cell === 'O' && <RenderO />}
            {!cell && isMyTurn && status === 'playing' && <RenderGhost />}
          </div>
        ))}

        {/* Dynamic Strike-through SVG line overlay on win */}
        {status === 'ended' && lineCoords && (
          <svg className="win-line-overlay" viewBox="0 0 300 300">
            <line
              x1={lineCoords.x1}
              y1={lineCoords.y1}
              x2={lineCoords.x2}
              y2={lineCoords.y2}
              className={`win-path win-path-${winner}`}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>

      {/* Turn indicator card */}
      {status === 'playing' && (
        <div 
          style={{ 
            fontSize: '0.82rem', 
            fontWeight: '400', 
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'center',
            height: '24px'
          }}
        >
          {isMyTurn ? (
            <span style={{ color: turn === 'X' ? 'var(--accent-magenta)' : 'var(--accent-blue)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="pulse-indicator" style={{ backgroundColor: turn === 'X' ? 'var(--accent-magenta)' : 'var(--accent-blue)' }}></span>
              YOUR TURN TO STRIKE
            </span>
          ) : (
            <span style={{ color: 'var(--text-slate)' }}>
              WAITING FOR OPPONENT ({players[turn]?.username || `Player ${turn}`})
            </span>
          )}
        </div>
      )}

      {/* Spectator/Waiting message */}
      {status === 'waiting' && (
        <div style={{ textAlign: 'center', height: '24px' }}>
          <p style={{ color: 'var(--text-slate)', fontSize: '0.8rem', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'center' }}>
            <span className="pulse-indicator" style={{ backgroundColor: '#ef4444' }}></span>
            WAITING FOR ENEMY COMBATANT
          </p>
        </div>
      )}

      {/* Minimal Match Result Overlay Modal */}
      {status === 'ended' && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(3, 3, 6, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
            padding: '2rem',
            zIndex: 20,
            animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <span className="minimal-subtitle" style={{ fontSize: '0.7rem' }}>ROUND CONCLUSION</span>
            
            {winner === 'draw' ? (
              <h2 style={{ fontSize: '2rem', fontWeight: '200', color: '#ffffff', letterSpacing: '0.08em', marginTop: '0.3rem' }}>
                MATCH DRAWN
              </h2>
            ) : (
              <h2 
                style={{ 
                  fontSize: '2rem', 
                  fontWeight: '300', 
                  letterSpacing: '0.08em',
                  marginTop: '0.3rem',
                  color: winner === 'X' ? 'var(--accent-magenta)' : 'var(--accent-blue)',
                  filter: `drop-shadow(0 0 8px ${winner === 'X' ? 'var(--accent-magenta)' : 'var(--accent-blue)'})`
                }}
              >
                {players[winner]?.username ? players[winner].username.toUpperCase() : `PLAYER ${winner}`} WINS
              </h2>
            )}
          </div>

          {isPlayer ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%', maxWidth: '220px' }}>
              <button 
                onClick={handleRematch} 
                className="btn-glass btn-glass-primary"
                style={{ width: '100%', fontSize: '0.8rem', padding: '0.7rem' }}
                disabled={rematchRequests.includes(role)}
              >
                <RefreshCw size={14} className={rematchRequests.includes(role) ? '' : 'spin'} />
                {rematchRequests.includes(role) ? 'WAITING FOR OPPONENT' : 'REQUEST REMATCH'}
              </button>

              <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.7rem', color: 'var(--text-slate)', letterSpacing: '0.05em' }}>
                <span>X: {rematchRequests.includes('X') ? 'READY' : 'PENDING'}</span>
                <span>•</span>
                <span>O: {rematchRequests.includes('O') ? 'READY' : 'PENDING'}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-slate)', fontSize: '0.8rem', fontStyle: 'italic', letterSpacing: '0.02em', textAlign: 'center' }}>
              Waiting for players to initiate rematch...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GameBoard;
