import { useState, useEffect, useRef } from 'react';
import { Send, Smile } from 'lucide-react';

const REACTION_EMOJIS = ['🔥', '🎉', '😂', '😮', '💀', '👑', '😱', '👍'];

function Chat({ messages, socket, reactions, myInfo, role }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit('chat-message', inputText.trim());
    setInputText('');
  };

  const sendReaction = (emoji) => {
    socket.emit('send-reaction', emoji);
  };

  const getRoleBadge = (msgRole) => {
    if (msgRole === 'system') return null;
    if (msgRole === 'X') return <span className="minimal-badge badge-x">X</span>;
    if (msgRole === 'O') return <span className="minimal-badge badge-o">O</span>;
    return <span className="minimal-badge badge-spec">SPEC</span>;
  };

  return (
    <div 
      className="liquid-glass-card minimal-chat" 
      style={{ 
        width: '100%', 
        position: 'relative' 
      }}
    >
      {/* Floating Emojis Overlay */}
      <div className="minimal-reaction-feed">
        {reactions.map((r) => {
          const randomX = `${(Math.random() - 0.5) * 80}px`;
          const randomRot = `${(Math.random() - 0.5) * 60}deg`;
          return (
            <span
              key={r.id}
              className="floating-emoji"
              style={{
                '--random-x': randomX,
                '--random-rot': randomRot
              }}
            >
              {r.emoji}
            </span>
          );
        })}
      </div>

      {/* Header */}
      <div 
        style={{ 
          padding: '1rem 1.25rem', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}
      >
        <span className="minimal-subtitle" style={{ fontSize: '0.75rem', fontWeight: '500' }}>Arena Feed</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-slate)', letterSpacing: '0.02em' }}>({messages.length})</span>
      </div>

      {/* Chat Messages */}
      <div className="minimal-chat-messages">
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-slate)', fontSize: '0.8rem', letterSpacing: '0.02em', maxWidth: '80%', lineHeight: '1.4' }}>
            Feed is quiet. Wave hello to initiate contact.
          </div>
        ) : (
          messages.map((msg, index) => {
            const isSystem = msg.role === 'system';
            const isMe = !isSystem && msg.username === myInfo.username;
            
            if (isSystem) {
              return (
                <div key={index} className="minimal-msg-bubble is-system">
                  {msg.text}
                </div>
              );
            }

            return (
              <div 
                key={index} 
                className={`minimal-msg-bubble ${isMe ? 'is-self' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                  <span 
                    style={{ 
                      fontWeight: '600', 
                      fontSize: '0.75rem',
                      color: isMe ? '#ffffff' : msg.avatarColor 
                    }}
                  >
                    {msg.username}
                  </span>
                  {getRoleBadge(msg.role)}
                  <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', marginLeft: '0.4rem' }}>
                    {msg.timestamp}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)' }}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Reactions Toolbar */}
      <div 
        style={{ 
          padding: '0.4rem 0.75rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          background: 'rgba(0, 0, 0, 0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        <span style={{ fontSize: '0.65rem', color: 'var(--text-slate)', fontWeight: '500', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
          <Smile size={11} /> REACT
        </span>
        <div style={{ display: 'flex', gap: '0.35rem', flex: 1, justifyContent: 'flex-end', overflowX: 'auto', paddingBottom: '2px' }}>
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => sendReaction(emoji)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.15rem',
                cursor: 'pointer',
                padding: '0.1rem',
                borderRadius: '4px',
                transition: 'transform 0.2s var(--ease-spring)'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.25)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <form 
        onSubmit={handleSend}
        style={{ 
          padding: '0.6rem 0.8rem', 
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(0,0,0,0.1)'
        }}
      >
        <input
          type="text"
          className="minimal-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message..."
          maxLength={100}
          style={{ padding: '0.45rem 0.8rem', fontSize: '0.85rem', borderRadius: '10px' }}
        />
        <button 
          type="submit" 
          className="btn-glass"
          style={{ padding: '0.45rem 0.75rem', borderRadius: '10px', flexShrink: 0 }}
        >
          <Send size={12} />
        </button>
      </form>
    </div>
  );
}

export default Chat;
