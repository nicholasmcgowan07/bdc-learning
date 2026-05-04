import { Routes, Route } from 'react-router-dom'
import PlatformPage        from './pages/PlatformPage.jsx'
import SequencingPage      from './pages/SequencingPage.jsx'
import CategorisationPage  from './pages/CategorisationPage.jsx'
import MultipleChoicePage  from './pages/MultipleChoicePage.jsx'
import TrueOrFalsePage     from './pages/TrueOrFalsePage.jsx'
import MatchingPage        from './pages/MatchingPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<PlatformPage />} />
      <Route path="/sequencing"      element={<SequencingPage />} />
      <Route path="/categorisation"  element={<CategorisationPage />} />
      <Route path="/multiple-choice" element={<MultipleChoicePage />} />
      <Route path="/true-or-false"   element={<TrueOrFalsePage />} />
      <Route path="/matching"        element={<MatchingPage />} />
    </Routes>
  )
}
