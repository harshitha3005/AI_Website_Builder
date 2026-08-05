import React, { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Home from './pages/Home'
// import useGetCurrentUser from './hooks/useGetCurrentUser'
import Dashboard from './pages/Dashboard'
import { useSelector, useDispatch } from 'react-redux'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/WebsiteEditor'
import LiveSite from './pages/LiveSite'
import Pricing from './pages/Pricing'
import { setUserData } from './redux/userSlice'

const App = () => {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (token) {
      axios.defaults.headers.common.Authorization = `Bearer ${token}`
    } else {
      dispatch(setUserData(null))
    }

    const interceptorId = axios.interceptors.request.use((config) => {
      const savedToken = localStorage.getItem('authToken')
      if (savedToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${savedToken}`
      }
      return config
    }, (error) => Promise.reject(error))

    const fetchCurrentUser = async () => {
      if (!token) {
        setAuthLoading(false)
        return
      }

      try {
        const { data } = await axios.get(`${import.meta.env.VITE_SERVER_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        dispatch(setUserData(data))
      } catch (error) {
        dispatch(setUserData(null))
        localStorage.removeItem('authToken')
        delete axios.defaults.headers.common.Authorization
        console.log('Auth check failed:', error?.response?.data?.message || error.message)
      } finally {
        setAuthLoading(false)
      }
    }
    fetchCurrentUser()

    return () => axios.interceptors.request.eject(interceptorId)
  }, [dispatch])

  if (authLoading) return null

  return (
    <BrowserRouter>   
       <Routes>
         <Route path='/' element={<Home/>}/>
         <Route path='/dashboard' element={userData?<Dashboard/>:<Home/>}/>
         <Route path='/generate' element={userData?<Generate/>:<Home/>}/>
         <Route path='/editor/:id' element={userData?<WebsiteEditor/>:<Home/>}/>
         <Route path='/site/:id' element={<LiveSite/>}/>
         <Route path='/pricing' element={<Pricing/>}/>
       </Routes>
    </BrowserRouter>
  )
}

export default App