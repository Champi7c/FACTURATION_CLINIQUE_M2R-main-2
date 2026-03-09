import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import './Dashboard.css';

function Dashboard() {
  const { analyses, ipms, assurances, patients, devis } = useData();
  
  const devisMois = devis.filter(d => {
    const date = new Date(d.dateCreation);
    const maintenant = new Date();
    return date.getMonth() === maintenant.getMonth() && 
           date.getFullYear() === maintenant.getFullYear();
  }).length;

  const stats = [
    {
      title: 'Analyses',
      value: analyses.length,
      icon: 'bi-clipboard-pulse',
      color: 'primary',
      link: '/analyses'
    },
    {
      title: 'IPM',
      value: ipms.length,
      icon: 'bi-building',
      color: 'info',
      link: '/ipm'
    },
    {
      title: 'Assurances',
      value: assurances.length,
      icon: 'bi-shield-check',
      color: 'success',
      link: '/assurances'
    },
    {
      title: 'Patients',
      value: patients.length,
      icon: 'bi-people',
      color: 'warning',
      link: '/patients'
    },
    {
      title: 'Devis Total',
      value: devis.length,
      icon: 'bi-file-earmark-text',
      color: 'secondary',
      link: '/devis'
    },
    {
      title: 'Devis ce mois',
      value: devisMois,
      icon: 'bi-calendar-month',
      color: 'danger',
      link: '/devis-mensuels'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1><i className="bi bi-speedometer2"></i> Dashboard</h1>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <Link to={stat.link} key={index} className="stat-card">
            <div className={`stat-icon ${stat.color}`}>
              <i className={`bi ${stat.icon}`}></i>
            </div>
            <div className="stat-content">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="quick-actions">
        <h2>Actions rapides</h2>
        <div className="actions-grid">
          <Link to="/devis/nouveau" className="action-btn primary">
            <i className="bi bi-plus-circle"></i>
            <span>Créer un devis</span>
          </Link>
          <Link to="/devis-mensuels" className="action-btn success">
            <i className="bi bi-calendar-month"></i>
            <span>Devis mensuel</span>
          </Link>
          <Link to="/patients/nouveau" className="action-btn info">
            <i className="bi bi-person-plus"></i>
            <span>Ajouter un patient</span>
          </Link>
          <Link to="/analyses/nouveau" className="action-btn warning">
            <i className="bi bi-clipboard-plus"></i>
            <span>Ajouter une analyse</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

