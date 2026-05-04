import { Routes, Route } from 'react-router-dom'
import PlatformPage          from './pages/PlatformPage.jsx'
import SequencingPage        from './pages/SequencingPage.jsx'
import CategorisationPage    from './pages/CategorisationPage.jsx'
import MultipleChoicePage    from './pages/MultipleChoicePage.jsx'
import TrueOrFalsePage       from './pages/TrueOrFalsePage.jsx'
import MatchingPage          from './pages/MatchingPage.jsx'
import MythLabPage           from './pages/MythLabPage.jsx'
import WorldModelBuilderPage from './pages/WorldModelBuilderPage.jsx'
import CoViewerPage          from './pages/CoViewerPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"                    element={<PlatformPage />} />
      <Route path="/sequencing"          element={<SequencingPage />} />
      <Route path="/categorisation"      element={<CategorisationPage />} />
      <Route path="/multiple-choice"     element={<MultipleChoicePage />} />
      <Route path="/true-or-false"       element={<TrueOrFalsePage />} />
      <Route path="/matching"            element={<MatchingPage />} />
      <Route path="/myth-lab"            element={<MythLabPage />} />
      <Route path="/world-model-builder" element={<WorldModelBuilderPage />} />
      <Route path="/co-viewer"           element={<CoViewerPage />} />
    </Routes>
  )
}
