import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Login from './pages/Login'
import About from './pages/About'
import Contact from './pages/Contact'
import MyProfile from './pages/MyProfile'
import MyAppointments from './pages/MyAppointments'
import Appointment from './pages/Appointment'
import Receipt from './pages/Receipt'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminAppointments from './pages/admin/AdminAppointments'
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorProfile from './pages/doctor/DoctorProfile'
import AdminAudit from './pages/admin/AdminAudit'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {
  const location = useLocation()
  const isPanel = location.pathname.startsWith('/admin') || location.pathname === '/doctor' || location.pathname.startsWith('/doctor/')

  return (
    <div className={isPanel ? '' : 'min-h-screen bg-sand text-ink'}>
      {!isPanel && <Navbar />}
      <div className={isPanel ? '' : 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'}>
        <div key={location.pathname} className={isPanel ? '' : 'page-enter'}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path='/my-appointments' element={<MyAppointments />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='/receipt/:id' element={<Receipt />} />
          <Route path='/admin' element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path='/admin/doctors' element={<ProtectedRoute roles={['admin']}><AdminDoctors /></ProtectedRoute>} />
          <Route path='/admin/appointments' element={<ProtectedRoute roles={['admin']}><AdminAppointments /></ProtectedRoute>} />
          <Route path='/admin/activity' element={<ProtectedRoute roles={['admin']}><AdminAudit /></ProtectedRoute>} />
          <Route path='/doctor' element={<ProtectedRoute roles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
          <Route path='/doctor/profile' element={<ProtectedRoute roles={['doctor']}><DoctorProfile /></ProtectedRoute>} />
        </Routes>
        </div>
      </div>
      {!isPanel && <Footer />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
