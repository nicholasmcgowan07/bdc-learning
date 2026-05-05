import { Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import PlatformPage            from './pages/PlatformPage.jsx'
import SequencingPage          from './pages/SequencingPage.jsx'
import CategorisationPage      from './pages/CategorisationPage.jsx'
import MultipleChoicePage      from './pages/MultipleChoicePage.jsx'
import TrueOrFalsePage         from './pages/TrueOrFalsePage.jsx'
import MatchingPage            from './pages/MatchingPage.jsx'
import MythLabPage             from './pages/MythLabPage.jsx'
import WorldModelBuilderPage   from './pages/WorldModelBuilderPage.jsx'
import CoViewerPage            from './pages/CoViewerPage.jsx'
import DecisionSimulatorPage   from './pages/DecisionSimulatorPage.jsx'
import PressureTestPage        from './pages/PressureTestPage.jsx'
import AdaptiveQuestionPackPage from './pages/AdaptiveQuestionPackPage.jsx'
import ConversationSimPage from './pages/ConversationSimPage.jsx'

function ActivityShell({ children }) {
  const navigate = useNavigate()
  return (
    <div>
      <div style={{
        height: 48,
        borderBottom: '1px solid #E8ECF0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 1.5rem',
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlatformPage />} />
      <Route path="/sequencing" element={
        <ActivityShell><SequencingPage /></ActivityShell>
      } />
      <Route path="/categorisation" element={
        <ActivityShell><CategorisationPage /></ActivityShell>
      } />
      <Route path="/multiple-choice" element={
        <ActivityShell><MultipleChoicePage /></ActivityShell>
      } />
      <Route path="/true-or-false" element={
        <ActivityShell><TrueOrFalsePage /></ActivityShell>
      } />
      <Route path="/matching" element={
        <ActivityShell><MatchingPage /></ActivityShell>
      } />
      <Route path="/myth-lab" element={
        <ActivityShell><MythLabPage /></ActivityShell>
      } />
      <Route path="/world-model-builder" element={
        <ActivityShell><WorldModelBuilderPage /></ActivityShell>
      } />
      <Route path="/co-viewer" element={
        <ActivityShell><CoViewerPage /></ActivityShell>
      } />
      <Route path="/decision-sim" element={
        <ActivityShell><DecisionSimulatorPage /></ActivityShell>
      } />
      <Route path="/pressure-test" element={
        <ActivityShell><PressureTestPage /></ActivityShell>
      } />
      <Route path="/adaptive-question-pack" element={
        <ActivityShell><AdaptiveQuestionPackPage /></ActivityShell>
      } />
      <Route path="/conversation-sim" element={
        <ActivityShell><ConversationSimPage /></ActivityShell>
      } />
    </Routes>
  )
}
