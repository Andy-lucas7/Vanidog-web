import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebaseConfig';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
import HomeScreen from './HomeScreen';
import './styles.css';

const App = () => {
  const [screen, setScreen] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Estado de autenticação:', user ? 'Autenticado' : 'Não autenticado');
      setIsAuthenticated(!!user);
      setScreen(user ? 'home' : 'login');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="app-container">
      {screen === 'login' && <LoginScreen setScreen={setScreen} />}
      {screen === 'register' && <RegisterScreen setScreen={setScreen} />}
      {screen === 'home' && isAuthenticated && <HomeScreen setScreen={setScreen} />}
    </div>
  );
};

export default App;