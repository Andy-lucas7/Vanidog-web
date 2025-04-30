import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './styles.css';

const LoginScreen = ({ setScreen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setScreen('home');
    } catch (err) {
      setError('Erro ao fazer login: ' + err.message);
    }
  };

  return (
    <div className="screen-container">
      <header className="header">
        <img src="/icon.png" alt="Vani Dog" className="header-icon" />
        <h1 className="header-title">Login</h1>
      </header>
      <form className="form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />
        <button type="submit" className="add-button">Entrar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Não tem conta?{' '}
        <button className="link-button" onClick={() => setScreen('register')}>
          Registre-se
        </button>
      </p>
    </div>
  );
};

export default LoginScreen;