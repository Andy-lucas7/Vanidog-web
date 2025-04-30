import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebaseConfig';
import './styles.css';

const RegisterScreen = ({ setScreen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setScreen('home');
    } catch (err) {
      setError('Erro ao registrar: ' + err.message);
    }
  };

  return (
    <div className="screen-container">
      <header className="header">
        <img src="/icon.png" alt="Vani Dog" className="header-icon" />
        <h1 className="header-title">Registro</h1>
      </header>
      <form className="form" onSubmit={handleRegister}>
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
        <button type="submit" className="add-button">Registrar</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>
        Já tem conta?{' '}
        <button className="link-button" onClick={() => setScreen('login')}>
          Faça login
        </button>
      </p>
    </div>
  );
};

export default RegisterScreen;