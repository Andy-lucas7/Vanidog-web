import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebaseConfig';
import './dashboardStyles.css';

const SaleScreen = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const vendasRef = collection(db, 'vendas');

  useEffect(() => {
    if (!auth.currentUser) {
      setError('Faça login para acessar as vendas.');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(vendasRef, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVendas(data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar vendas:', err);
        setError(err.code === 'permission-denied' ? 'Permissões insuficientes. Faça login.' : 'Erro ao carregar vendas.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteSale = async (id) => {
    if (!auth.currentUser) {
      alert('Faça login para excluir vendas.');
      return;
    }

    try {
      await deleteDoc(doc(db, 'vendas', id));
      alert('Venda excluída.');
    } catch (err) {
      console.error('Erro ao excluir venda:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes. Faça login.' : 'Erro ao excluir venda.');
    }
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard-container">
      <header className="header">
        <img src="/icon.png" alt="Vani Dog" className="header-icon" />
        <h1 className="header-title">Vendas</h1>
      </header>
      <div className="tab-content">
        <h3>Registro de Vendas</h3>
        <div className="list">
          {vendas.length === 0 ? (
            <p className="empty-text">Nenhuma venda registrada.</p>
          ) : (
            vendas.map(venda => (
              <div key={venda.id} className="card sale-card">
                <div className="card-content">
                  <h4>{venda.name}</h4>
                  <div className="card-details">
                    <span>Data: {new Date(venda.data).toLocaleDateString()}</span>
                    <span>Quantidade: {venda.quantidade}</span>
                    <span>Preço: R${venda.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="card-actions">
                  <button
                    className="action-button delete-button"
                    onClick={() => deleteSale(venda.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SaleScreen;