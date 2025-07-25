import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import { FavoriteProvider } from './context/favouritecontext';
import Header from './components/header';

import Favorites from './components/favouritelist';
import UploadSong from './pages/uploadsong';
import Login from './pages/login';
import Register from './pages/register';
import Subscribe from './pages/subscribe';
import SongsPage from './components/songpage';
import LogoutButton from './pages/logout';
import UserProfilePage from './components/userprofile';
import RequestResetOTP from './pages/RequestResetOTP';
import ResetPasswordOTP from './pages/ResetPasswordOTP';

export default function App() {
  return (
    <AuthProvider>
      <FavoriteProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<SongsPage />} /> 
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/upload" element={<UploadSong />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/subscribe" element={<Subscribe />} />
            <Route path="/logout" element={<LogoutButton/>}/>
            <Route path="/profile" element={<UserProfilePage />} />
             <Route path="/forgot-password" element={<RequestResetOTP />} />
        <Route path="/reset-password" element={<ResetPasswordOTP />} />
          </Routes>
        </BrowserRouter>
      </FavoriteProvider>
    </AuthProvider>
  );
}
