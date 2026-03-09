import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AnalysesList from './pages/AnalysesList';
import AnalysesForm from './pages/AnalysesForm';
import IPMList from './pages/IPMList';
import IPMForm from './pages/IPMForm';
import IPMTarifs from './pages/IPMTarifs';
import AssurancesList from './pages/AssurancesList';
import AssurancesForm from './pages/AssurancesForm';
import AssurancesTarifs from './pages/AssurancesTarifs';
import PatientsList from './pages/PatientsList';
import PatientsForm from './pages/PatientsForm';
import DevisList from './pages/DevisList';
import DevisForm from './pages/DevisForm';
import DevisDetail from './pages/DevisDetail';
import DevisMensuel from './pages/DevisMensuel';
import Statistiques from './pages/Statistiques';
import CategoriesManagement from './pages/CategoriesManagement';
import DetailPrestation from './pages/DetailPrestation';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <Routes>
            {/* Route publique - Login */}
            <Route path="/login" element={<Login />} />
            
            {/* Route par défaut - Redirige toujours vers login au démarrage */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Route dashboard - Protégée */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            
            {/* Routes protégées */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
            
            {/* Routes dynamiques pour toutes les catégories (y compris les nouvelles) */}
            <Route path="/base-de-donnees/:category" element={<AnalysesList />} />
            <Route path="/base-de-donnees/:category/ajouter" element={<AnalysesForm />} />
            <Route path="/base-de-donnees/:category/:id/modifier" element={<AnalysesForm />} />
            
            {/* Routes spécifiques pour compatibilité (optionnel, peuvent être supprimées) */}
            <Route path="/base-de-donnees/analyses" element={<AnalysesList category="analyses" />} />
            <Route path="/base-de-donnees/analyses/ajouter" element={<AnalysesForm category="analyses" />} />
            <Route path="/base-de-donnees/analyses/:id/modifier" element={<AnalysesForm category="analyses" />} />
            
            <Route path="/base-de-donnees/radiographie" element={<AnalysesList category="radiographie" />} />
            <Route path="/base-de-donnees/radiographie/ajouter" element={<AnalysesForm category="radiographie" />} />
            <Route path="/base-de-donnees/radiographie/:id/modifier" element={<AnalysesForm category="radiographie" />} />
            
            <Route path="/base-de-donnees/hospitalisation" element={<AnalysesList category="hospitalisation" />} />
            <Route path="/base-de-donnees/hospitalisation/ajouter" element={<AnalysesForm category="hospitalisation" />} />
            <Route path="/base-de-donnees/hospitalisation/:id/modifier" element={<AnalysesForm category="hospitalisation" />} />
            
            <Route path="/base-de-donnees/maternite" element={<AnalysesList category="maternite" />} />
            <Route path="/base-de-donnees/maternite/ajouter" element={<AnalysesForm category="maternite" />} />
            <Route path="/base-de-donnees/maternite/:id/modifier" element={<AnalysesForm category="maternite" />} />
            
            <Route path="/base-de-donnees/consultations" element={<AnalysesList category="consultations" />} />
            <Route path="/base-de-donnees/consultations/ajouter" element={<AnalysesForm category="consultations" />} />
            <Route path="/base-de-donnees/consultations/:id/modifier" element={<AnalysesForm category="consultations" />} />
            
            <Route path="/base-de-donnees/medicament" element={<AnalysesList category="medicament" />} />
            <Route path="/base-de-donnees/medicament/ajouter" element={<AnalysesForm category="medicament" />} />
            <Route path="/base-de-donnees/medicament/:id/modifier" element={<AnalysesForm category="medicament" />} />
            
            {/* Routes de compatibilité (redirection vers base-de-donnees) */}
            <Route path="/analyses" element={<AnalysesList category="analyses" />} />
            <Route path="/analyses/ajouter" element={<AnalysesForm category="analyses" />} />
            <Route path="/analyses/:id/modifier" element={<AnalysesForm category="analyses" />} />
            
            {/* IPM */}
            <Route path="/ipm" element={<IPMList />} />
            <Route path="/ipm/ajouter" element={<IPMForm />} />
            <Route path="/ipm/:id/modifier" element={<IPMForm />} />
            <Route path="/ipm/:id/tarifs" element={<IPMTarifs />} />
            
            {/* Assurances */}
            <Route path="/assurances" element={<AssurancesList />} />
            <Route path="/assurances/ajouter" element={<AssurancesForm />} />
            <Route path="/assurances/:id/modifier" element={<AssurancesForm />} />
            <Route path="/assurances/:id/tarifs" element={<AssurancesTarifs />} />
            
            {/* Patients */}
            <Route path="/patients" element={<PatientsList />} />
            <Route path="/patients/ajouter" element={<PatientsForm />} />
            <Route path="/patients/:id/modifier" element={<PatientsForm />} />
            
            {/* Devis */}
            <Route path="/devis" element={<DevisList />} />
            <Route path="/devis/creer" element={<DevisForm />} />
            <Route path="/devis/:id" element={<DevisDetail />} />
            <Route path="/devis/:id/modifier" element={<DevisForm />} />
            <Route path="/devis/mensuel" element={<DevisMensuel />} />
            
            {/* Gestion des catégories (admin seulement) */}
            <Route path="/categories" element={<CategoriesManagement />} />
            
            {/* Statistiques (admin seulement - vérifié dans le composant) */}
            <Route path="/statistiques" element={<Statistiques />} />
            
            {/* Détail de prestation (admin seulement) */}
            <Route path="/detail-prestation" element={<ProtectedRoute adminOnly><DetailPrestation /></ProtectedRoute>} />
                      
                      {/* Redirection par défaut */}
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
