import { useNavigate } from 'react-router-dom'

export default function ActivityShell({ children }) {
  const navigate = useNavigate()
  return (
    <div>
      <div style={{
        height: 48,
        borderBottom: '1px solid #E8ECF0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
        gap: '1rem',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <button onClick={() => navigate('/')} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#4A6070',
          fontSize: 13,
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: 0,
        }}>
          ← Back to catalog
        </button>
      </div>
      {children}
    </div>
  )
}