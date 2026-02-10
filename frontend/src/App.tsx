import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Category from './pages/Category'
import Search from './pages/Search'
import ItemDetail from './pages/ItemDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateItem from './pages/CreateItem'
import Notifications from './pages/Notifications'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="category/:categoryId" element={<Category />} />
        <Route path="search" element={<Search />} />
        <Route path="item/:itemId" element={<ItemDetail />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="create-item" element={<CreateItem />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
