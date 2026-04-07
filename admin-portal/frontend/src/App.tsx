import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { checkAuth, getToken } from './lib/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Apps from './pages/Apps';
import AppDetail from './pages/AppDetail';
import Revenue from './pages/Revenue';
import Customers from './pages/Customers';
import Users from './pages/Users';
import Costs from './pages/Costs';
import Visitors from './pages/Visitors';
import Leads from './pages/Leads';
import Projects from './pages/Projects';
import Infrastructure from './pages/Infrastructure';
import Matrices from './pages/Matrices';
import Settings from './pages/Settings';
import BarkLeads from './pages/BarkLeads';
import Usage from './pages/Usage';
import UTMBuilder from './pages/UTMBuilder';

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (!getToken()) {
      setAuthenticated(false);
      return;
    }
    checkAuth().then(setAuthenticated);
  }, []);

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={
        authenticated ? <Navigate to="/" /> : <Login onLogin={() => setAuthenticated(true)} />
      } />
      <Route element={
        authenticated ? <Layout /> : <Navigate to="/login" />
      }>
        <Route path="/" element={<Dashboard />} />
        <Route path="/apps" element={<Apps />} />
        <Route path="/apps/:id" element={<AppDetail />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/users" element={<Users />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/costs" element={<Costs />} />
        <Route path="/visitors" element={<Visitors />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/bark" element={<BarkLeads />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/usage" element={<Usage />} />
        <Route path="/infra" element={<Infrastructure />} />
        <Route path="/matrices" element={<Matrices />} />
        <Route path="/utm" element={<UTMBuilder />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
