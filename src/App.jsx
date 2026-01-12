import { Routes, Route } from 'react-router-dom';
import { ToastProvider, useToast } from './context/ToastContext';
import Modal from './components/Common/Modal';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import VerifyOTP from './pages/Auth/VerifyOTP';

// Main Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs/JobList';
import JobDetails from './pages/Jobs/JobDetails';
import PostJob from './pages/Jobs/PostJob';
import Freelancers from './pages/Freelancers/FreelancerList';
import FreelancerProfile from './pages/Freelancers/FreelancerProfile';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import MyJobs from './pages/MyJobs';

function App() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Jobs */}
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route
            path="/post-job"
            element={
              <ProtectedRoute requireClient>
                <PostJob />
              </ProtectedRoute>
            }
          />
          
          {/* Freelancers */}
          <Route path="/freelancers" element={<Freelancers />} />
          <Route path="/freelancers/:id" element={<FreelancerProfile />} />
          
          {/* Protected Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute>
                <MyJobs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />

      {/* Modal Notifications - Show only the first (most recent) toast as modal */}
      {toasts.length > 0 && (
        <Modal
          key={`modal-${toasts[0].id}`}
          message={toasts[0].message}
          type={toasts[0].type}
          duration={toasts[0].duration}
          onClose={() => {
            console.log(`%c[🔔 APP] onClose called for modal: ${toasts[0].id}`, 'color: #FF5722;');
            removeToast(toasts[0].id);
          }}
        />
      )}
    </div>
  );
}

export default App;

