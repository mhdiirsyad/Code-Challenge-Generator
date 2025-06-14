// import { useState } from 'react'
import ClerkProviderWithRoute from './auth/ClerkProviderWithRoute'
import { Routes, Route} from 'react-router-dom'
import { LayOut } from './layout/LayOut'
import { ChallengeGen } from './challenge/challengeGen'
import { HistoryPanel } from './history/historyPanel'
import { AuthPage } from './auth/authPage'

import './App.css'

function App() {
  return <ClerkProviderWithRoute>
    <Routes>
      <Route path='/signin/*' element={<AuthPage/>} />
      <Route path='/signup' element={<AuthPage/>} />
      <Route element={<LayOut/>}>
        <Route path='/' element={<ChallengeGen/>} />
        <Route path='/history' element={<HistoryPanel/>} />
      </Route>
    </Routes>
    
  </ClerkProviderWithRoute>
}

export default App
