import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { ToastProvider } from './components/Toast'
import { ContentProvider } from './context/ContentContext'
import { EASE } from './lib/ease'
import Home from './pages/Home'

const Shop = lazy(() => import('./pages/Shop'))
const ProductPage = lazy(() => import('./pages/ProductPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const NotFound = lazy(() => import('./pages/NotFound'))
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function App() {
  return (
    <ContentProvider>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<div className="min-h-screen bg-ink" />}>
              <AdminApp />
            </Suspense>
          }
        />
        <Route path="*" element={<Shell />} />
      </Routes>
    </ContentProvider>
  )
}

function Shell() {
  const location = useLocation()

  // New page → top; "/#section" links → scroll to that section once it's rendered.
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.slice(1)
      const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 80)
      return () => window.clearTimeout(t)
    }
    window.scrollTo(0, 0)
    if (location.pathname === '/') document.title = 'Nine to Five — Good style works overtime'
  }, [location.pathname, location.hash])

  return (
    <ToastProvider>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
          <Suspense fallback={<div className="min-h-screen" />}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:slug" element={<ProductPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </ToastProvider>
  )
}
