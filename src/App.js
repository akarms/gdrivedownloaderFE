// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import GoogleLogin from './components/googlelogin/GoogleLogin';
import Home from './home';
import OAuth2Callback from './OAuth2Callback';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import {TorrentDownloader} from './pages/TorrentDownloader'


function App() {
  return (
   <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<GoogleLogin />} />
          <Route path="/home" element={ <ProtectedRoute> <Home /> </ProtectedRoute> }/> 
          <Route path="/oauth2callback" element={<OAuth2Callback />} />
          <Route path='/torrentDownloader' element={<TorrentDownloader />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;