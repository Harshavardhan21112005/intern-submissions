import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Studentpage from './Studentpage'
import StaffPage from './staffPage'
import Profilepage from './Profilepage'
import Internpage from './internpage'
import Login from './Login'
import {createBrowserRouter,RouterProvider} from 'react-router-dom'
import GoogleRedirectHandler from './GoogleRedirectHandler';
import MySubmissionsPage from './MySubmissionsPage';
import ReviewPage from './ReviewPage'
import AcceptedSubmissionsPage from './AcceptedSubmissionpage'
import AdminOverviewPage from './Admin'

const router=createBrowserRouter([
  {
    path:'/',
    element:<Login/>
  },
  { path: "/admin" ,
    element: <AdminOverviewPage />
  },
  {
    path:'/studentpage',
    element:<Studentpage/>
  },
  {
    path:'/staffpage',
    element:<StaffPage/>
  },
  {
    path:'/profilepage',
    element:<Profilepage/>
  },
  {
    path:'/internpage',
    element:<Internpage/>
  },
  {
    path: '/auth/google/callback',
    element: <GoogleRedirectHandler />
  },
  { path: "/my-submissions" ,
    element : <MySubmissionsPage /> },
  { path: "/accepted-submissions" ,
    element : <AcceptedSubmissionsPage /> },

    { path: "/review" ,
    element : <ReviewPage/> }
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
