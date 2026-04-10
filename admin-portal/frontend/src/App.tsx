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
import Conversions from './pages/Conversions';
import Status from './pages/Status';
import ErrorBoundary from './components/ErrorBoundary';

function EB({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

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
        <Route path="/" element={<EB><Dashboard /></EB>} />
        <Route path="/apps" element={<EB><Apps /></EB>} />
        <Route path="/apps/:id" element={<EB><AppDetail /></EB>} />
        <Route path="/revenue" element={<EB><Revenue /></EB>} />
        <Route path="/users" element={<EB><Users /></EB>} />
        <Route path="/customers" element={<EB><Customers /></EB>} />
        <Route path="/costs" element={<EB><Costs /></EB>} />
        <Route path="/visitors" element={<EB><Visitors /></EB>} />
        <Route path="/leads" element={<EB><Leads /></EB>} />
        <Route path="/bark" element={<EB><BarkLeads /></EB>} />
        <Route path="/projects" element={<EB><Projects /></EB>} />
        <Route path="/usage" element={<EB><Usage /></EB>} />
        <Route path="/infra" element={<EB><Infrastructure /></EB>} />
        <Route path="/matrices" element={<EB><Matrices /></EB>} />
        <Route path="/utm" element={<EB><UTMBuilder /></EB>} />
        <Route path="/conversions" element={<EB><Conversions /></EB>} />
        <Route path="/settings" element={<EB><Settings /></EB>} />
        <Route path="/status" element={<EB><Status /></EB>} />
      </Route>
    </Routes>
  );
}
