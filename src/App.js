import React, { useEffect } from 'react';
import NavBar           from './components/NavBar';
import Toast            from './components/Toast';
import InspoScreen      from './screens/InspoScreen';
import ShopScreen       from './screens/ShopScreen';
import DesignerScreen   from './screens/DesignerScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ProfileScreen    from './screens/ProfileScreen';
import useStore         from './store/useStore';
import { supabase }     from './services/supabase';

export default function App() {
  const activeTab  = useStore((s) => s.activeTab);
  const setUser    = useStore((s) => s.setUser);
  const setSession = useStore((s) => s.setSession);

  // Listen for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, [setUser, setSession]);

  const screens = {
    feed:      <InspoScreen      />,
    shop:      <ShopScreen       />,
    designer:  <DesignerScreen   />,
    style:     <OnboardingScreen />,
    profile:   <ProfileScreen    />,
  };

  return (
    <div style={{
      width: 390, height: 844, margin: '20px auto',
      background: '#faf8f6',
      borderRadius: 44, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 0 0 10px #d4c8ca, 0 30px 80px rgba(160,100,110,0.25)',
      position: 'relative',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }} key={activeTab}>
        {screens[activeTab]}
      </div>
      <NavBar />
      <Toast />
    </div>
  );
}
