import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ShipmentsScreen } from './screens/ShipmentsScreen'
import { ShipmentDetailScreen } from './screens/ShipmentDetailScreen'
import { CalculatorScreen } from './screens/CalculatorScreen'
import { AddressScreen } from './screens/AddressScreen'
import { NewShipmentScreen } from './screens/NewShipmentScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { SupportScreen } from './screens/SupportScreen'
import { useTelegramTheme } from './hooks/useTelegramTheme'

const ONBOARDING_KEY = 'crispycargo:onboarded'

const TAB_ROOT_PATHS = new Set(['/', '/shipments', '/calculator', '/profile'])

function Shell() {
  const location = useLocation()
  const hideNav = !TAB_ROOT_PATHS.has(location.pathname)
  return (
    <>
      <Routes>
        <Route path="/onboarding" element={<OnboardingScreenRoute />} />
        <Route path="/" element={<HomeScreen />} />
        <Route path="/shipments" element={<ShipmentsScreen />} />
        <Route path="/shipments/:id" element={<ShipmentDetailScreen />} />
        <Route path="/calculator" element={<CalculatorScreen />} />
        <Route path="/address" element={<AddressScreen />} />
        <Route path="/new-shipment" element={<NewShipmentScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/support" element={<SupportScreen />} />
      </Routes>
      {!hideNav && <BottomNav />}
    </>
  )
}

function OnboardingScreenRoute() {
  return <OnboardingScreen onDone={() => localStorage.setItem(ONBOARDING_KEY, '1')} />
}

function Gate() {
  const [checked, setChecked] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    setNeedsOnboarding(!localStorage.getItem(ONBOARDING_KEY))
    setChecked(true)
  }, [])

  if (!checked) return null

  if (needsOnboarding && window.location.hash !== '#/onboarding') {
    window.location.hash = '#/onboarding'
  }

  return <Shell />
}

export default function App() {
  useTelegramTheme()
  return (
    <HashRouter>
      <Gate />
    </HashRouter>
  )
}
