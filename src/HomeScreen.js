import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth } from './firebaseConfig';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const HomeScreen = ({ setScreen }) => {
  const [activeTab, setActiveTab] = useState('inventory');
  const [inventario, setInventario] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [evidencias, setEvidencias] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: '', quantity: '', price: '' });
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const inventarioRef = collection(db, 'inventario');
  const vendasRef = collection(db, 'vendas');
  const evidenciasRef = collection(db, 'evidences');
  const feedbackRef = collection(db, 'feedback');

  // Buscar dados em tempo real
  useEffect(() => {
    if (!auth.currentUser) {
      setError('Faça login para acessar a aplicação.');
      setScreen('login');
      return;
    }

    const unsubscribeInventario = onSnapshot(inventarioRef, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInventario(data);
      } catch (err) {
        console.error('Erro ao buscar inventário:', err);
        setError(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao carregar inventário.');
      }
    });

    const unsubscribeVendas = onSnapshot(vendasRef, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || 'Sem nome',
          quantidade: doc.data().quantidade || 0,
          price: doc.data().price || 0,
          data: doc.data().data || new Date().toISOString(),
        }));
        setVendas(data);
      } catch (err) {
        console.error('Erro ao buscar vendas:', err);
        setError(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao carregar vendas.');
      }
    });

    const unsubscribeEvidencias = onSnapshot(evidenciasRef, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEvidencias(data);
      } catch (err) {
        console.error('Erro ao buscar evidências:', err);
        setError(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao carregar evidências.');
      }
    });

    const unsubscribeFeedback = onSnapshot(feedbackRef, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeedback(data);
      } catch (err) {
        console.error('Erro ao buscar feedback:', err);
        setError(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao carregar feedback.');
      }
    });

    setLoading(false);
    return () => {
      unsubscribeInventario();
      unsubscribeVendas();
      unsubscribeEvidencias();
      unsubscribeFeedback();
    };
  }, [setScreen]);

  // Adicionar produto
  const addProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.quantity || !newProduct.price) {
      alert('Preencha todos os campos.');
      return;
    }
    try {
      const querySnapshot = await getDocs(inventarioRef);
      const existingProduct = querySnapshot.docs.find(doc => doc.data().name.toLowerCase() === newProduct.name.toLowerCase());

      if (existingProduct) {
        const productRef = doc(db, 'inventario', existingProduct.id);
        const newQuantity = existingProduct.data().quantity + parseInt(newProduct.quantity);
        const newPrice = parseFloat(newProduct.price);
        await updateDoc(productRef, { quantity: newQuantity, price: newPrice });
        alert(`Quantidade de ${newProduct.name} atualizada para ${newQuantity}.`);
      } else {
        await addDoc(inventarioRef, {
          name: newProduct.name,
          quantity: parseInt(newProduct.quantity),
          price: parseFloat(newProduct.price),
        });
        alert(`${newProduct.name} adicionado ao inventário.`);
      }
      setNewProduct({ name: '', quantity: '', price: '' });
    } catch (err) {
      console.error('Erro ao adicionar produto:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao adicionar produto.');
    }
  };

  // Vender produto
  const sellProduct = async (item) => {
    if (item.quantity <= 0) {
      alert('Estoque insuficiente.');
      return;
    }
    try {
      const productRef = doc(db, 'inventario', item.id);
      await updateDoc(productRef, { quantity: item.quantity - 1 });
      await addDoc(vendasRef, {
        name: item.name,
        quantidade: 1,
        price: item.price || 0,
        data: new Date().toISOString(),
      });
      alert(`Venda de 1 ${item.name} registrada.`);
    } catch (err) {
      console.error('Erro ao registrar venda:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao registrar venda.');
    }
  };

  // Excluir item
  const deleteItem = async (id, type) => {
    try {
      if (type === 'product') {
        await deleteDoc(doc(db, 'inventario', id));
        alert('Produto excluído.');
      } else if (type === 'sale') {
        await deleteDoc(doc(db, 'vendas', id));
        alert('Venda excluída.');
      } else if (type === 'evidence') {
        await deleteDoc(doc(db, 'evidences', id));
        alert('Evidência excluída.');
      }
    } catch (err) {
      console.error('Erro ao excluir item:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao excluir item.');
    }
  };

  // Adicionar evidência
  const handleEvidenceSubmit = async (e) => {
    e.preventDefault();
    if (!evidenceUrl || !evidenceDescription) {
      alert('Insira uma URL e uma descrição.');
      return;
    }
    try {
      await addDoc(evidenciasRef, {
        url: evidenceUrl,
        description: evidenceDescription,
        date: new Date().toISOString(),
        type: 'url',
      });
      alert('Evidência adicionada com sucesso!');
      setEvidenceUrl('');
      setEvidenceDescription('');
    } catch (err) {
      console.error('Erro ao adicionar evidência:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao adicionar evidência.');
    }
  };

  // Enviar feedback
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText) {
      alert('Preencha o feedback.');
      return;
    }
    try {
      await addDoc(feedbackRef, {
        feedback: feedbackText,
        date: new Date().toISOString(),
      });
      alert('Feedback enviado com sucesso!');
      setFeedbackText('');
    } catch (err) {
      console.error('Erro ao enviar feedback:', err);
      alert(err.code === 'permission-denied' ? 'Permissões insuficientes.' : 'Erro ao enviar feedback.');
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setScreen('login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
      alert('Erro ao fazer logout.');
    }
  };

  // Dados dos gráficos
  const vendasChartData = {
    labels: vendas.length > 0 ? vendas.map(venda => new Date(venda.data).toLocaleDateString()) : ['Jan', 'Feb', 'Mar'],
    datasets: [
      {
        label: 'Vendas',
        data: vendas.length > 0 ? vendas.map(venda => venda.quantidade) : [0, 0, 0],
        borderColor: '#D32F2F',
        backgroundColor: 'rgba(211, 47, 47, 0.2)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const estoqueChartData = {
    labels: inventario.map(item => item.name || 'Sem nome'),
    datasets: [
      {
        label: 'Estoque',
        data: inventario.map(item => item.quantity || 0),
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
    ],
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="screen-container">
      <header className="header">
        <img src="/icon.png" alt="Vani Dog" className="header-icon" />
        <h1 className="header-title">Vani Dog</h1>
        <button className="logout-button" onClick={handleLogout}>Sair</button>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'inventory' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventário
        </button>
        <button
          className={`tab ${activeTab === 'sales' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Vendas ({vendas.length})
        </button>
        <button
          className={`tab ${activeTab === 'dashboard' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab ${activeTab === 'project' ? 'active-tab' : ''}`}
          onClick={() => setActiveTab('project')}
        >
          Projeto
        </button>
      </div>

      {activeTab === 'inventory' && (
        <div className="tab-content">
          <h3>Inventário</h3>
          <form className="form" onSubmit={addProduct}>
            <input
              type="text"
              placeholder="Nome do Produto"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="input"
            />
            <div className="input-row">
              <input
                type="number"
                placeholder="Quantidade"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                className="input half-input"
              />
              <input
                type="number"
                placeholder="Preço"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="input half-input"
              />
            </div>
            <button type="submit" className="add-button">Adicionar Produto</button>
          </form>

          <div className="list">
            {inventario.length === 0 ? (
              <p className="empty-text">Nenhum produto no inventário.</p>
            ) : (
              inventario.map(item => (
                <div key={item.id} className="card">
                  <div className="card-content">
                    <h4>{item.name || 'Sem nome'}</h4>
                    <div className="card-details">
                      <span>Quantidade: {item.quantity || 0}</span>
                      <span>Preço: R${(item.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-button sell-button"
                      onClick={() => sellProduct(item)}
                      disabled={item.quantity <= 0}
                    >
                      Vender
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => deleteItem(item.id, 'product')}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="tab-content">
          <h3>Vendas</h3>
          <div className="list">
            {vendas.length === 0 ? (
              <p className="empty-text">Nenhuma venda registrada.</p>
            ) : (
              vendas.map(venda => (
                <div key={venda.id} className="card sale-card">
                  <div className="card-content">
                    <h4>{venda.name || 'Sem nome'}</h4>
                    <div className="card-details">
                      <span>Data: {venda.data ? new Date(venda.data).toLocaleDateString() : 'Sem data'}</span>
                      <span>Quantidade: {venda.quantidade || 0}</span>
                      <span>Preço: R${(venda.price || 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="action-button delete-button"
                      onClick={() => deleteItem(venda.id, 'sale')}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="tab-content">
          <h3>Dashboard - Análise de Resultados</h3>

          {/* Indicadores */}
          <div className="indicators">
            <div className="indicator-card">
              <h4>Total de Vendas</h4>
              <p>{vendas.reduce((sum, venda) => sum + (venda.quantidade || 0), 0)}</p>
            </div>
            <div className="indicator-card">
              <h4>Estoque Total</h4>
              <p>{inventario.reduce((sum, item) => sum + (item.quantity || 0), 0)}</p>
            </div>
            <div className="indicator-card">
              <h4>Feedback Recebido</h4>
              <p>{feedback.length}</p>
            </div>
          </div>

          {/* Gráficos */}
          <div className="charts">
            <div className="chart-card">
              <h4>Vendas por Período</h4>
              <Line data={vendasChartData} options={{ responsive: true }} />
            </div>
            <div className="chart-card">
              <h4>Estoque Atual</h4>
              <Bar data={estoqueChartData} options={{ responsive: true }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'project' && (
        <div className="tab-content">
          <h3>Projeto de Extensão</h3>

          {/* 2.1 Cronograma */}
          <section className="section">
            <h4>2.1. Cronograma de Atividades</h4>
            <table className="table">
              <thead>
                <tr>
                  <th>Ação</th>
                  <th>Prazo</th>
                  <th>Recursos</th>
                  <th>Público-Alvo</th>
                  <th>Local</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Preparar material de treinamento</td>
                  <td>7 dias antes</td>
                  <td>Computador, software</td>
                  <td>Facilitadores</td>
                  <td>Escritório</td>
                </tr>
                <tr>
                  <td>Realizar workshops</td>
                  <td>Meio do semestre</td>
                  <td>Sala, projetor</td>
                  <td>Empresários</td>
                  <td>Centro comunitário</td>
                </tr>
                <tr>
                  <td>Coletar feedback</td>
                  <td>Final de cada sessão</td>
                  <td>Questionários</td>
                  <td>Participantes</td>
                  <td>Local das sessões</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* 2.2 Metodologia */}
          <section className="section">
            <h4>2.2. Metodologia</h4>
            <p>Os métodos utilizados incluem:</p>
            <ul>
              <li><strong>Entrevistas:</strong> Realizadas com empresários locais.</li>
              <li><strong>Rodas de Conversa:</strong> Sessões para engajar participantes.</li>
              <li><strong>Dinâmicas de Grupo:</strong> Atividades práticas.</li>
              <li><strong>Questionários:</strong> Para coletar feedback.</li>
              <li><strong>Análise de Dados:</strong> Relatórios para orientar o treinamento.</li>
            </ul>
          </section>

          {/* 3.1 Evidências */}
          <section className="section">
            <h4>3.1. Evidências</h4>
            <form className="form" onSubmit={handleEvidenceSubmit}>
              <input
                type="url"
                placeholder="URL da evidência (ex.: Google Drive)"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                className="input"
              />
              <textarea
                placeholder="Descrição da evidência (data, local, contexto)"
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                className="textarea"
              />
              <button type="submit" className="add-button">Adicionar Evidência</button>
            </form>
            <div className="list">
              {evidencias.length === 0 ? (
                <p className="empty-text">Nenhuma evidência enviada.</p>
              ) : (
                evidencias.map(evidencia => (
                  <div key={evidencia.id} className="card">
                    <div className="card-content">
                      <a href={evidencia.url} target="_blank" rel="noopener noreferrer">Acessar Evidência</a>
                      <p>{evidencia.description}</p>
                      <p>Data: {new Date(evidencia.date).toLocaleDateString()}</p>
                    </div>
                    <div className="card-actions">
                      <button
                        className="action-button delete-button"
                        onClick={() => deleteItem(evidencia.id, 'evidence')}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 2.3 Feedback */}
          <section className="section">
            <h4>2.3. Coleta de Feedback</h4>
            <form className="form" onSubmit={handleFeedbackSubmit}>
              <textarea
                placeholder="Digite seu feedback"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="textarea"
              />
              <button type="submit" className="add-button">Enviar Feedback</button>
            </form>
            <div className="list">
              {feedback.length === 0 ? (
                <p className="empty-text">Nenhum feedback recebido.</p>
              ) : (
                feedback.map(item => (
                  <div key={item.id} className="card">
                    <div className="card-content">
                      <p>{item.feedback}</p>
                      <p>Data: {new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default HomeScreen;