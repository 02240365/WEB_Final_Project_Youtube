"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./App.css"

// Layout components
import Header from "./components/layout/Header"
import Sidebar from "./components/layout/Sidebar"

// Page components
import Home from "./pages/Home"
import VideoPage from "./pages/VideoPage"
import SearchResults from "./pages/SearchResults"
import Login from "./pages/Login"
import Register from "./pages/Register"
import UploadVideo from "./pages/UploadVideo"
import Channel from "./pages/Channel"
import NotFound from "./pages/NotFound"

// Auth components and context
import { AuthProvider, useAuth } from "./context/AuthContext"

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()

  if (!currentUser) {
    // Redirect to login if user is not authenticated
    return <Navigate to="/login" replace />
  }

  return children
}

function AppContent() {
  return (
    <Router>
      <div className="app">
        <Header />
        <div className="app__page">
          <Sidebar />
          <div className="app__content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/video/:videoId" element={<VideoPage />} />
              <Route path="/search/:searchQuery" element={<SearchResults />} />
              <Route path="/channel/:channelId" element={<Channel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route
                path="/upload"
                element={
                  <ProtectedRoute>
                    <UploadVideo />
                  </ProtectedRoute>
                }
              />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
