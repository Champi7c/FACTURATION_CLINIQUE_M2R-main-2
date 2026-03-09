import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.is_superuser === true || user?.is_superuser === 'true' || user?.is_superuser === 1;
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    totalIPM: 0,
    totalAssurances: 0,
    totalPatients: 0,
    totalDevis: 0,
    devisMois: 0,
    totalMontantMois: 0,
    devisAujourdhui: 0,
    montantAujourdhui: 0,
  });

  useEffect(() => {
    let cancelled = false;
    api.get('/dashboard-stats/')
      .then((res) => {
        if (!cancelled && res.data) {
          setStats({
            totalAnalyses: res.data.totalAnalyses ?? 0,
            totalIPM: res.data.totalIPM ?? 0,
            totalAssurances: res.data.totalAssurances ?? 0,
            totalPatients: res.data.totalPatients ?? 0,
            totalDevis: res.data.totalDevis ?? 0,
            devisMois: res.data.devisMois ?? 0,
            totalMontantMois: res.data.totalMontantMois ?? 0,
            devisAujourdhui: res.data.devisAujourdhui ?? 0,
            montantAujourdhui: res.data.montantAujourdhui ?? 0,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStats((s) => s);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1><i className="bi bi-speedometer2"></i> Dashboard</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-content">
            <div>
              <h6>Analyses</h6>
              <h2>{stats.totalAnalyses.toLocaleString('fr-FR')}</h2>
            </div>
            <i className="bi bi-clipboard-pulse stat-icon"></i>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-content">
            <div>
              <h6>IPM</h6>
              <h2>{stats.totalIPM.toLocaleString('fr-FR')}</h2>
            </div>
            <i className="bi bi-building stat-icon"></i>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-content">
            <div>
              <h6>Assurances</h6>
              <h2>{stats.totalAssurances.toLocaleString('fr-FR')}</h2>
            </div>
            <i className="bi bi-shield-check stat-icon"></i>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-content">
            <div>
              <h6>Patients</h6>
              <h2>{stats.totalPatients.toLocaleString('fr-FR')}</h2>
            </div>
            <i className="bi bi-people stat-icon"></i>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h5><i className="bi bi-file-earmark-text"></i> Devis</h5>
          </div>
          <div className="card-body">
            <h3 className="text-primary">{stats.totalDevis.toLocaleString('fr-FR')}</h3>
            <p className="text-muted">Total des devis</p>
            <hr />
            <h5 className="text-success">{stats.devisMois.toLocaleString('fr-FR')}</h5>
            <p className="text-muted">Devis ce mois</p>
            {isAdmin && (
              <>
                <hr />
                <h5 className="text-info">{typeof stats.totalMontantMois === 'number' ? stats.totalMontantMois.toLocaleString('fr-FR') : '0'} FCFA</h5>
                <p className="text-muted">Montant total du mois</p>
              </>
            )}
            <hr />
            <h5 className="text-success">{stats.devisAujourdhui.toLocaleString('fr-FR')}</h5>
            <p className="text-muted">Devis aujourd'hui</p>
            <hr />
            <h5 className="text-info">{(stats.montantAujourdhui ?? 0).toLocaleString('fr-FR')} FCFA</h5>
            <p className="text-muted">Montant du jour</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h5><i className="bi bi-lightning-charge"></i> Actions rapides</h5>
          </div>
          <div className="card-body">
            <Link to="/devis/creer" className="btn btn-primary w-100 mb-2">
              <i className="bi bi-plus-circle"></i> Créer un devis
            </Link>
            <Link to="/devis/mensuel" className="btn btn-success w-100 mb-2">
              <i className="bi bi-calendar-month"></i> Facture mensuelle
            </Link>
            <Link to="/patients/ajouter" className="btn btn-info w-100">
              <i className="bi bi-person-plus"></i> Ajouter un patient
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
