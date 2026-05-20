import { useState } from 'react';
import { Copy, Check, LogOut, Users, Award, Shield } from 'lucide-react';

function RoomStats({ gameState, role, myInfo, roomId, onLeave }) {
  const [copied, setCopied] = useState(false);

  if (!gameState) return null;

  const { players, spectators, scores, turn, status } = gameState;

  const handleCopy = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Room Code Card */}
      <div className="liquid-glass-card" style={{ padding: '1.25rem 1.1rem' }}>
        <span className="minimal-subtitle" style={{ fontSize: '0.65rem' }}>LOBBY CODE</span>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '400', letterSpacing: '0.08em', color: '#ffffff' }}>
            {roomId}
          </h2>
          <button
            onClick={handleCopy}
            className="btn-glass"
            style={{ padding: '0.35rem 0.65rem', borderRadius: '8px', fontSize: '0.72rem' }}
            title="Copy Code"
          >
            {copied ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#10b981' }}>
                <Check size={12} /> COPIED
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <Copy size={12} /> COPY
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Scoreboard Card */}
      <div className="liquid-glass-card" style={{ padding: '1.25rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '0.4rem' }}>
          <Award size={14} style={{ color: '#f59e0b' }} />
          <span className="minimal-subtitle" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Scoreboard</span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.4rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.45rem 0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-slate)', fontWeight: '500', letterSpacing: '0.02em' }}>ROLE X</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-magenta)', marginTop: '0.1rem' }}>{scores.X}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.45rem 0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-slate)', fontWeight: '500', letterSpacing: '0.02em' }}>DRAWS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ffffff', marginTop: '0.1rem' }}>{scores.draws}</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.25)', padding: '0.45rem 0.2rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-slate)', fontWeight: '500', letterSpacing: '0.02em' }}>ROLE O</div>
            <div style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--accent-blue)', marginTop: '0.1rem' }}>{scores.O}</div>
          </div>
        </div>
      </div>

      {/* Players List Card */}
      <div className="liquid-glass-card" style={{ padding: '1.25rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '0.4rem' }}>
          <Shield size={14} style={{ color: 'var(--accent-blue)' }} />
          <span className="minimal-subtitle" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Arena Combatants</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Player X */}
          <div className={`minimal-player-row ${status === 'playing' && turn === 'X' ? 'active-turn' : ''}`}>
            <div 
              className="mini-avatar" 
              style={{ backgroundColor: players.X?.avatarColor || 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}
            >
              {players.X ? players.X.username.charAt(0).toUpperCase() : 'X'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', fontSize: '0.82rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {players.X ? players.X.username : 'Empty Slot'}
                </span>
                {status === 'playing' && turn === 'X' && (
                  <span className="minimal-badge badge-x" style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem' }}>PLAYING</span>
                )}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-slate)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {players.X ? (
                  <>
                    <span className="pulse-indicator" style={{ width: '4px', height: '4px', backgroundColor: 'var(--accent-magenta)' }}></span> Active X
                  </>
                ) : (
                  'Standby X'
                )}
              </div>
            </div>
          </div>

          {/* Player O */}
          <div className={`minimal-player-row ${status === 'playing' && turn === 'O' ? 'active-turn' : ''}`}>
            <div 
              className="mini-avatar" 
              style={{ backgroundColor: players.O?.avatarColor || 'rgba(255,255,255,0.05)', fontSize: '0.75rem' }}
            >
              {players.O ? players.O.username.charAt(0).toUpperCase() : 'O'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '500', fontSize: '0.82rem', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {players.O ? players.O.username : 'Empty Slot'}
                </span>
                {status === 'playing' && turn === 'O' && (
                  <span className="minimal-badge badge-o" style={{ fontSize: '0.55rem', padding: '0.05rem 0.25rem' }}>PLAYING</span>
                )}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-slate)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {players.O ? (
                  <>
                    <span className="pulse-indicator" style={{ width: '4px', height: '4px', backgroundColor: 'var(--accent-blue)' }}></span> Active O
                  </>
                ) : (
                  'Standby O'
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spectators List Card */}
      <div className="liquid-glass-card" style={{ padding: '1.25rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '0.4rem' }}>
          <Users size={14} style={{ color: 'var(--text-slate)' }} />
          <span className="minimal-subtitle" style={{ fontSize: '0.7rem', fontWeight: '600' }}>
            Spectators ({spectators.length})
          </span>
        </div>

        <div 
          className="minimal-spectator-list"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.4rem', 
            maxHeight: '90px', 
            overflowY: 'auto'
          }}
        >
          {spectators.length === 0 ? (
            <span style={{ color: 'var(--text-slate)', fontSize: '0.75rem', fontStyle: 'italic' }}>
              No observers present.
            </span>
          ) : (
            spectators.map((spec) => (
              <div 
                key={spec.socketId} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.01)'
                }}
              >
                <div 
                  style={{ 
                    backgroundColor: spec.avatarColor, 
                    width: '16px', 
                    height: '16px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: '700',
                    color: '#ffffff'
                  }}
                >
                  {spec.username.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {spec.username}
                </span>
                {spec.username === myInfo.username && (
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-slate)', marginLeft: 'auto' }}>(YOU)</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Disconnect Action */}
      <button 
        onClick={onLeave} 
        className="btn-glass"
        style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.2)', color: '#fda4af', background: 'rgba(244, 63, 94, 0.03)', padding: '0.6rem', fontSize: '0.8rem' }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(244, 63, 94, 0.08)';
          e.target.style.borderColor = 'rgba(244, 63, 94, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(244, 63, 94, 0.03)';
          e.target.style.borderColor = 'rgba(244, 63, 94, 0.2)';
        }}
      >
        <LogOut size={13} /> Abandon Arena
      </button>

    </div>
  );
}

export default RoomStats;
