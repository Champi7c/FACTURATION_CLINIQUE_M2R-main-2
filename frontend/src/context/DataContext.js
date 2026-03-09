import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, analysesAPI, ipmsAPI, assurancesAPI, tarifsAPI, patientsAPI, devisAPI, categoriesAPI, handleAPIError } from '../services/api';
import { convertPatientFromAPI, convertPatientToAPI, convertDevisFromAPI, convertDevisToAPI, convertTarifFromAPI, convertTarifToAPI } from '../utils/apiConverters';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {

  // Liste standard des analyses à initialiser (pour IPM et Assurance)
  const analysesStandard = [
    'Numération formule (NFS)',
    'Vitesse de sédimentation (VS)',
    'Test d\'Emmel (TE)',
    'Groupage sanguin (GSRH)',
    'Temps de segment (TS)',
    'Temps de Coagulation ou Temps de Cephalines Koaline ou Active (TC ou TCK ou TCA)',
    'Fibrinémie',
    'Taux de Prothrombine (TP)',
    'Combis direct ou indirect',
    'Recherche Agglutinines Irrégulière (RAI)',
    'Amylasémie',
    'Amylasurie',
    'Alpha-amylase',
    'Fer sérique',
    'Hémoglobine glycosylée ou glyquée',
    'Glycémie a jeun',
    'Azotémie ou urée',
    'Créatinémie ou créatinine',
    'Clairance créatinine',
    'Urines (alb-sucre-cc)',
    'Protéines de 24 heures',
    'Microalbiminurie',
    'Glycosurie des 24 heures',
    'Albuminémie',
    'Protidémie',
    'Magnésium',
    'Ionogramme urinaire',
    'Ionogramme sanguin',
    'Transminases (TGO/TGP ou ASAT/ALAT)',
    'Bilirubine (directe et indirecte ou conjuguée et totale)',
    'Acide urique ou uricémie',
    'Calcium',
    'Phosphore',
    'Cholestérol total',
    'HDL cholestérol',
    'LDL cholestérol',
    'Triglycérides',
    'Lipides totaux',
    'Bilan lipidique (chol. Total, HDL, LDL, TG, Lipides totaux)',
    'Hyperglycémie provoquée par voie orale (HPVO)',
    'Acide vanilmandélique (VMA)',
    'Electrophorèse de l\'hémoglobine',
    'Electrophorèse des protéines',
    'Phospholipase alcaline (PAL)',
    'Phospholipase acide (PAC)',
    'Lactate déshydrogènase (LDH)',
    'Créatinine kinase (CK)',
    'Gammaglutamyltranférase (Gamma GT)',
    'BW ou RPR',
    'TPHA',
    'Sérologie syphilitique (BW + TPHA)',
    'Antistreptolysine O (ASLO)',
    'Protéine C réactive (CRP)',
    'Latex Waler Rose (LWR ou WR)',
    'Sérodiagnostic de Widal et Félix (SWF ou WF)',
    'Test de Wide ou Béta HCG',
    'Mononucléose infectieuse (MNI)',
    'Antistreptodornase B (ASDOR B)',
    'Sérologie amibienne',
    'Alpha-Foeto-Protéine (AFP)',
    'Ferritine',
    'Toxoplasmose (Ig M et Ig G)',
    'Rubéole (Ig M et Ig G)',
    'Chlamydiae',
    'Antigène HBS',
    'Sérologie rétrovirale (HIV ou TME)',
    'Antigène HBE',
    'Anticorps anti-HBC (Ac anti-HBC)',
    'Anticorps anti-HVC (Ac anti-HVC)',
    'Anticorps anti-HBE (Ac anti-HBE)',
    'Anticorps anti-HBS (Ac anti-HBS)',
    'PSA',
    'Progestérone',
    'Prolactine',
    'Œstradiol',
    'FSH',
    'LH',
    'T3 libre',
    'T4 libre',
    'TSH ultra-sensible',
    'T3l-T4l-TSHu',
    'testostérone',
    'Prélèvement Vaginal (P.V.)',
    'ECBU ou Uroculture',
    'Coproculture',
    'Recherche Chlamydia',
    'ECB-LCR',
    'ECB-PUS',
    'ECB-Prélèvement de gorge',
    'ECB-Prélèvement auriculaire',
    'ECB-Prélèvement oculaire',
    'ECB-Prélèvement de sonde',
    'ECB-Prélèvement urétral',
    'ECB-Liquide d\'ascite',
    'ECB-Liquide pleural',
    'ECB-Liquide de ponction',
    'Mycoplasmes',
    'Recherche de BK',
    'Hémoculture',
    'KAOP ou Selles KAOP',
    'GOUTTE EPAISSE (GE)',
    'CULOT URINAIRE',
    'Recherche de Microfilaires',
    'Compte d\'ADDIS ou HLM',
    'ECC Liquide d\'ascite',
    'ECC-LCR',
    'Spermogramme',
    'TROPONINE',
    'DDIMERE',
    'CHARGE VIRALE',
    'ECHOGRAPHIE MAMAIRE',
    'ECHOGRAPHIE THYROIDIENNE',
    'ECHOGRAPHIE DES TISSUS MOUS',
    'ECHOGRAPHIE ABDOMINAL',
    'ECHOGRAPHIE ABDOMINO-PELVIENNE',
    'ECHOGRAPHIE DOPPLER VASCULAIRE',
    'ECHOGRAPHIE CARDIAQUE',
    'ECHOGRAPHIE TESTICULAIRE',
    'ELECTROCARDIOGRAMME',
    'FIBROSCOPIE O.G.D',
    'CHAMBRE à 2 LITS',
    'CHAMBRE INDIVIDUELLE',
    'ACCOUCHEMENT',
    'ACCOUCHEMENT GEMELLAIRE',
    'PERINEORRAPHIE',
    'CONSULTATION SIMPLE',
    'CONSULTATION NUIT',
    'CONSULTATION SPECIALISTE',
    'CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE',
    'CONSULTATION SAMEDI APRES MIDI ET FERIE'
  ];

  // Liste standard des assurances à initialiser
  const assurancesStandard = [
    'ASCOMA ASSURANCE',
    'SANLAM ASSURANCE',
    'SONAM ASSURANCE',
    'PA ASSURANCE',
    'SUNU ASSURANCE',
    'AMSA ASSURANCE',
    'NSIA ASSURANCE',
    'WAFA ASSURANCE',
    'OLEA ASSURANCE',
    'WILLIS TOWERS WATSON'
  ];

  // Liste standard des IPM à initialiser
  const ipmsStandard = [
    'IPM C2K STAFFING',
    'IPM CREDIT MUTUEL',
    'IPM GROUPE EXPRESS SANTE',
    'IPM GROUPE FUTUR MEDIA',
    'IPM HYDROCARBURE',
    'IPM LABOREX',
    'IPM MIMRAN',
    'IPM TRANSVIE',
    'IPM MBARUM KOOLUTE',
    'IPM MUTUEL HOTELIERE DU CAP VERT',
    'IPM ODEC DE DAKAR',
    'IPM POSTE',
    'IPM PROFESSIONS LIBERALES',
    'IPM SAGAM',
    'IPM FILFILI',
    'IPM EIFFAGE',
    'IPM SANTE PLUS',
    'IPM SEN EAU',
    'IPM SENELEC',
    'IPM SFD',
    'IPM SOCOCIM',
    'IPM RIDWAN',
    'IPM SOMICOA',
    'IPM SONATEL',
    'IPM SORES',
    'IPM SYPOA',
    'IPM TOP INTER',
    'IPM TRANSIT',
    'IPM TRANSPORT AERIEN',
    'IPM WER GI YARAM',
    'IPM DIPROM',
    'IPM ZI SENTENAC'
  ];

  // Liste des prix standard pour les analyses IPM
  const ipmTarifsStandard = [
    { nom: 'Numération formule (NFS)', prix: 8800 },
    { nom: 'Vitesse de sédimentation (VS)', prix: 2200 },
    { nom: 'Test d\'Emmel (TE)', prix: 4400 },
    { nom: 'Groupage sanguin (GSRH)', prix: 6600 },
    { nom: 'Temps de segment (TS)', prix: 2200 },
    { nom: 'Temps de Coagulation ou Temps de Cephalines Koaline ou Active (TC ou TCK ou TCA)', prix: 5500 },
    { nom: 'Fibrinémie', prix: 4400 },
    { nom: 'Taux de Prothrombine (TP)', prix: 5500 },
    { nom: 'Combis direct ou indirect', prix: 8800 },
    { nom: 'Recherche Agglutinines Irrégulière (RAI)', prix: 8800 },
    { nom: 'Amylasémie', prix: 11000 },
    { nom: 'Amylasurie', prix: 0 },
    { nom: 'Alpha-amylase', prix: 0 },
    { nom: 'Fer sérique', prix: 11000 },
    { nom: 'Hémoglobine glycosylée ou glyquée', prix: 13200 },
    { nom: 'Glycémie a jeun', prix: 2200 },
    { nom: 'Azotémie ou urée', prix: 3300 },
    { nom: 'Créatinémie ou créatinine', prix: 3300 },
    { nom: 'Clairance créatinine', prix: 6600 },
    { nom: 'Urines (alb-sucre-cc)', prix: 2200 },
    { nom: 'Protéines de 24 heures', prix: 3300 },
    { nom: 'Microalbiminurie', prix: 0 },
    { nom: 'Glycosurie des 24 heures', prix: 3300 },
    { nom: 'Albuminémie', prix: 3300 },
    { nom: 'Protidémie', prix: 3300 },
    { nom: 'Magnésium', prix: 3300 },
    { nom: 'Ionogramme urinaire', prix: 9900 },
    { nom: 'Ionogramme sanguin', prix: 9900 },
    { nom: 'Transminases (TGO/TGP ou ASAT/ALAT)', prix: 11000 },
    { nom: 'Bilirubine (directe et indirecte ou conjuguée et totale)', prix: 5500 },
    { nom: 'Acide urique ou uricémie', prix: 3300 },
    { nom: 'Calcium', prix: 3300 },
    { nom: 'Phosphore', prix: 3300 },
    { nom: 'Cholestérol total', prix: 3300 },
    { nom: 'HDL cholestérol', prix: 6600 },
    { nom: 'LDL cholestérol', prix: 6600 },
    { nom: 'Triglycérides', prix: 4400 },
    { nom: 'Lipides totaux', prix: 0 },
    { nom: 'Bilan lipidique (chol. Total, HDL, LDL, TG, Lipides totaux)', prix: 17600 },
    { nom: 'Hyperglycémie provoquée par voie orale (HPVO)', prix: 22000 },
    { nom: 'Acide vanilmandélique (VMA)', prix: 0 },
    { nom: 'Electrophorèse de l\'hémoglobine', prix: 13200 },
    { nom: 'Electrophorèse des protéines', prix: 20900 },
    { nom: 'Phospholipase alcaline (PAL)', prix: 8800 },
    { nom: 'Phospholipase acide (PAC)', prix: 0 },
    { nom: 'Lactate déshydrogènase (LDH)', prix: 11000 },
    { nom: 'Créatinine kinase (CK)', prix: 11000 },
    { nom: 'Gammaglutamyltranférase (Gamma GT)', prix: 11000 },
    { nom: 'BW ou RPR', prix: 3300 },
    { nom: 'TPHA', prix: 3300 },
    { nom: 'Sérologie syphilitique (BW + TPHA)', prix: 6600 },
    { nom: 'Antistreptolysine O (ASLO)', prix: 7700 },
    { nom: 'Protéine C réactive (CRP)', prix: 3300 },
    { nom: 'Latex Waler Rose (LWR ou WR)', prix: 13200 },
    { nom: 'Sérodiagnostic de Widal et Félix (SWF ou WF)', prix: 8800 },
    { nom: 'Test de Wide ou Béta HCG', prix: 17600 },
    { nom: 'Mononucléose infectieuse (MNI)', prix: 0 },
    { nom: 'Antistreptodornase B (ASDOR B)', prix: 0 },
    { nom: 'Sérologie amibienne', prix: 17600 },
    { nom: 'Alpha-Foeto-Protéine (AFP)', prix: 22000 },
    { nom: 'Ferritine', prix: 22000 },
    { nom: 'Toxoplasmose (Ig M et Ig G)', prix: 26400 },
    { nom: 'Rubéole (Ig M et Ig G)', prix: 26400 },
    { nom: 'Chlamydiae', prix: 17600 },
    { nom: 'Antigène HBS', prix: 15400 },
    { nom: 'Sérologie rétrovirale (HIV ou TME)', prix: 15400 },
    { nom: 'Antigène HBE', prix: 15400 },
    { nom: 'Anticorps anti-HBC (Ac anti-HBC)', prix: 15400 },
    { nom: 'Anticorps anti-HVC (Ac anti-HVC)', prix: 15400 },
    { nom: 'Anticorps anti-HBE (Ac anti-HBE)', prix: 22000 },
    { nom: 'Anticorps anti-HBS (Ac anti-HBS)', prix: 22000 },
    { nom: 'PSA', prix: 22000 },
    { nom: 'Progestérone', prix: 22000 },
    { nom: 'Prolactine', prix: 22000 },
    { nom: 'Œstradiol', prix: 22000 },
    { nom: 'FSH', prix: 17600 },
    { nom: 'LH', prix: 17600 },
    { nom: 'T3 libre', prix: 17600 },
    { nom: 'T4 libre', prix: 17600 },
    { nom: 'TSH ultra-sensible', prix: 17600 },
    { nom: 'T3l-T4l-TSHu', prix: 17600 },
    { nom: 'testostérone', prix: 30800 },
    { nom: 'Prélèvement Vaginal (P.V.)', prix: 11000 },
    { nom: 'ECBU ou Uroculture', prix: 11000 },
    { nom: 'Coproculture', prix: 11000 },
    { nom: 'Recherche Chlamydia', prix: 11000 },
    { nom: 'ECB-LCR', prix: 11000 },
    { nom: 'ECB-PUS', prix: 11000 },
    { nom: 'ECB-Prélèvement de gorge', prix: 11000 },
    { nom: 'ECB-Prélèvement auriculaire', prix: 11000 },
    { nom: 'ECB-Prélèvement oculaire', prix: 11000 },
    { nom: 'Spermogramme', prix: 17600 },
    { nom: 'ECB-Prélèvement de sonde', prix: 11000 },
    { nom: 'ECB-Prélèvement urétral', prix: 11000 },
    { nom: 'ECB-Liquide d\'ascite', prix: 11000 },
    { nom: 'ECB-Liquide pleural', prix: 11000 },
    { nom: 'ECB-Liquide de ponction', prix: 11000 },
    { nom: 'Mycoplasmes', prix: 11000 },
    { nom: 'Recherche de BK', prix: 26400 },
    { nom: 'Hémoculture', prix: 11000 },
    { nom: 'KAOP ou Selles KAOP', prix: 6600 },
    { nom: 'GOUTTE EPAISSE (GE)', prix: 4400 },
    { nom: 'CULOT URINAIRE', prix: 3300 },
    { nom: 'Recherche de Microfilaires', prix: 6600 },
    { nom: 'Compte d\'ADDIS ou HLM', prix: 5500 },
    { nom: 'ECC Liquide d\'ascite', prix: 11000 },
    { nom: 'ECC-LCR', prix: 11000 },
    { nom: 'TROPONINE', prix: 17600 },
    { nom: 'DDIMERE', prix: 17600 },
    { nom: 'CHARGE VIRALE', prix: 77000 },
    { nom: 'ECHOGRAPHIE MAMAIRE', prix: 28600 },
    { nom: 'ECHOGRAPHIE THYROIDIENNE', prix: 28600 },
    { nom: 'ECHOGRAPHIE DES TISSUS MOUS', prix: 28600 },
    { nom: 'ECHOGRAPHIE ABDOMINAL', prix: 28600 },
    { nom: 'ECHOGRAPHIE ABDOMINO-PELVIENNE', prix: 42900 },
    { nom: 'ECHOGRAPHIE DOPPLER VASCULAIRE', prix: 44000 },
    { nom: 'ECHOGRAPHIE CARDIAQUE', prix: 72600 },
    { nom: 'ECHOGRAPHIE TESTICULAIRE', prix: 28600 },
    { nom: 'ELECTROCARDIOGRAMME', prix: 17000 },
    { nom: 'FIBROSCOPIE O.G.D', prix: 44000 },
    { nom: 'CHAMBRE à 2 LITS', prix: 15000 },
    { nom: 'CHAMBRE INDIVIDUELLE', prix: 20000 },
    { nom: 'ACCOUCHEMENT', prix: 102000 },
    { nom: 'ACCOUCHEMENT GEMELLAIRE', prix: 153000 },
    { nom: 'PERINEORRAPHIE', prix: 17000 },
    { nom: 'CONSULTATION SIMPLE', prix: 4800, categorie: 'consultations' },
    { nom: 'CONSULTATION NUIT', prix: 11500, categorie: 'consultations' },
    { nom: 'CONSULTATION SPECIALISTE', prix: 9400, categorie: 'consultations' },
    { nom: 'CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE', prix: 11500, categorie: 'consultations' },
    { nom: 'CONSULTATION SAMEDI APRES MIDI ET FERIE', prix: 9800, categorie: 'consultations' }
  ];

  // Liste des prix standard pour les analyses Assurance
  const assuranceTarifsStandard = [
    { nom: 'Numération formule (NFS)', prix: 10400, categorie: 'analyses' },
    { nom: 'Vitesse de sédimentation (VS)', prix: 2600, categorie: 'analyses' },
    { nom: 'Test d\'Emmel (TE)', prix: 5200, categorie: 'analyses' },
    { nom: 'Groupage sanguin (GSRH)', prix: 7800, categorie: 'analyses' },
    { nom: 'Temps de segment (TS)', prix: 2600, categorie: 'analyses' },
    { nom: 'Temps de Coagulation ou Temps de Cephalines Koaline ou Active (TC ou TCK ou TCA)', prix: 6500, categorie: 'analyses' },
    { nom: 'Fibrinémie', prix: 5200, categorie: 'analyses' },
    { nom: 'Taux de Prothrombine (TP)', prix: 6500, categorie: 'analyses' },
    { nom: 'Combis direct ou indirect', prix: 10400, categorie: 'analyses' },
    { nom: 'Recherche Agglutinines Irrégulière (RAI)', prix: 10400, categorie: 'analyses' },
    { nom: 'Amylasémie', prix: 13000, categorie: 'analyses' },
    { nom: 'Amylasurie', prix: 0, categorie: 'analyses' },
    { nom: 'Alpha-amylase', prix: 0, categorie: 'analyses' },
    { nom: 'Fer sérique', prix: 13000, categorie: 'analyses' },
    { nom: 'Hémoglobine glycosylée ou glyquée', prix: 15600, categorie: 'analyses' },
    { nom: 'Glycémie a jeun', prix: 2600, categorie: 'analyses' },
    { nom: 'Azotémie ou urée', prix: 3900, categorie: 'analyses' },
    { nom: 'Créatinémie ou créatinine', prix: 3900, categorie: 'analyses' },
    { nom: 'Clairance créatinine', prix: 7800, categorie: 'analyses' },
    { nom: 'Urines (alb-sucre-cc)', prix: 2600, categorie: 'analyses' },
    { nom: 'Protéines de 24 heures', prix: 3900, categorie: 'analyses' },
    { nom: 'Microalbiminurie', prix: 0, categorie: 'analyses' },
    { nom: 'Glycosurie des 24 heures', prix: 3900, categorie: 'analyses' },
    { nom: 'Albuminémie', prix: 3900, categorie: 'analyses' },
    { nom: 'Protidémie', prix: 3900, categorie: 'analyses' },
    { nom: 'Magnésium', prix: 3900, categorie: 'analyses' },
    { nom: 'Ionogramme urinaire', prix: 11700, categorie: 'analyses' },
    { nom: 'Ionogramme sanguin', prix: 11700, categorie: 'analyses' },
    { nom: 'Transminases (TGO/TGP ou ASAT/ALAT)', prix: 13000, categorie: 'analyses' },
    { nom: 'Bilirubine (directe et indirecte ou conjuguée et totale)', prix: 6500, categorie: 'analyses' },
    { nom: 'Acide urique ou uricémie', prix: 3900, categorie: 'analyses' },
    { nom: 'Calcium', prix: 3900, categorie: 'analyses' },
    { nom: 'Phosphore', prix: 3900, categorie: 'analyses' },
    { nom: 'Cholestérol total', prix: 3900, categorie: 'analyses' },
    { nom: 'HDL cholestérol', prix: 7800, categorie: 'analyses' },
    { nom: 'LDL cholestérol', prix: 7800, categorie: 'analyses' },
    { nom: 'Triglycérides', prix: 5200, categorie: 'analyses' },
    { nom: 'Lipides totaux', prix: 0, categorie: 'analyses' },
    { nom: 'Bilan lipidique (chol. Total, HDL, LDL, TG, Lipides totaux)', prix: 20800, categorie: 'analyses' },
    { nom: 'Hyperglycémie provoquée par voie orale (HPVO)', prix: 26000, categorie: 'analyses' },
    { nom: 'Acide vanilmandélique (VMA)', prix: 0, categorie: 'analyses' },
    { nom: 'Electrophorèse de l\'hémoglobine', prix: 15600, categorie: 'analyses' },
    { nom: 'Electrophorèse des protéines', prix: 24700, categorie: 'analyses' },
    { nom: 'Phospholipase alcaline (PAL)', prix: 10400, categorie: 'analyses' },
    { nom: 'Phospholipase acide (PAC)', prix: 0, categorie: 'analyses' },
    { nom: 'Lactate déshydrogènase (LDH)', prix: 13000, categorie: 'analyses' },
    { nom: 'Créatinine kinase (CK)', prix: 13000, categorie: 'analyses' },
    { nom: 'Gammaglutamyltranférase (Gamma GT)', prix: 13000, categorie: 'analyses' },
    { nom: 'BW ou RPR', prix: 3900, categorie: 'analyses' },
    { nom: 'TPHA', prix: 3900, categorie: 'analyses' },
    { nom: 'Sérologie syphilitique (BW + TPHA)', prix: 7800, categorie: 'analyses' },
    { nom: 'Antistreptolysine O (ASLO)', prix: 9100, categorie: 'analyses' },
    { nom: 'Protéine C réactive (CRP)', prix: 3900, categorie: 'analyses' },
    { nom: 'Latex Waler Rose (LWR ou WR)', prix: 15600, categorie: 'analyses' },
    { nom: 'Sérodiagnostic de Widal et Félix (SWF ou WF)', prix: 10400, categorie: 'analyses' },
    { nom: 'Test de Wide ou Béta HCG', prix: 20800, categorie: 'analyses' },
    { nom: 'Mononucléose infectieuse (MNI)', prix: 0, categorie: 'analyses' },
    { nom: 'Antistreptodornase B (ASDOR B)', prix: 0, categorie: 'analyses' },
    { nom: 'Sérologie amibienne', prix: 20800, categorie: 'analyses' },
    { nom: 'Alpha-Foeto-Protéine (AFP)', prix: 26000, categorie: 'analyses' },
    { nom: 'Ferritine', prix: 26000, categorie: 'analyses' },
    { nom: 'Toxoplasmose (Ig M et Ig G)', prix: 31200, categorie: 'analyses' },
    { nom: 'Rubéole (Ig M et Ig G)', prix: 31200, categorie: 'analyses' },
    { nom: 'Chlamydiae', prix: 20800, categorie: 'analyses' },
    { nom: 'Antigène HBS', prix: 18200, categorie: 'analyses' },
    { nom: 'Sérologie rétrovirale (HIV ou TME)', prix: 18200, categorie: 'analyses' },
    { nom: 'Antigène HBE', prix: 18200, categorie: 'analyses' },
    { nom: 'Anticorps anti-HBC (Ac anti-HBC)', prix: 18200, categorie: 'analyses' },
    { nom: 'Anticorps anti-HVC (Ac anti-HVC)', prix: 18200, categorie: 'analyses' },
    { nom: 'Anticorps anti-HBE (Ac anti-HBE)', prix: 26000, categorie: 'analyses' },
    { nom: 'Anticorps anti-HBS (Ac anti-HBS)', prix: 26000, categorie: 'analyses' },
    { nom: 'PSA', prix: 26000, categorie: 'analyses' },
    { nom: 'Progestérone', prix: 26000, categorie: 'analyses' },
    { nom: 'Prolactine', prix: 26000, categorie: 'analyses' },
    { nom: 'Œstradiol', prix: 26000, categorie: 'analyses' },
    { nom: 'FSH', prix: 20800, categorie: 'analyses' },
    { nom: 'LH', prix: 20800, categorie: 'analyses' },
    { nom: 'T3 libre', prix: 20800, categorie: 'analyses' },
    { nom: 'T4 libre', prix: 20800, categorie: 'analyses' },
    { nom: 'TSH ultra-sensible', prix: 20800, categorie: 'analyses' },
    { nom: 'T3l-T4l-TSHu', prix: 20800, categorie: 'analyses' },
    { nom: 'testostérone', prix: 36400, categorie: 'analyses' },
    { nom: 'Prélèvement Vaginal (P.V.)', prix: 13000, categorie: 'analyses' },
    { nom: 'ECBU ou Uroculture', prix: 13000, categorie: 'analyses' },
    { nom: 'Coproculture', prix: 13000, categorie: 'analyses' },
    { nom: 'Recherche Chlamydia', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-LCR', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-PUS', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Prélèvement de gorge', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Prélèvement auriculaire', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Prélèvement oculaire', prix: 13000, categorie: 'analyses' },
    { nom: 'Spermogramme', prix: 20800, categorie: 'analyses' },
    { nom: 'ECB-Prélèvement de sonde', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Prélèvement urétral', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Liquide d\'ascite', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Liquide pleural', prix: 13000, categorie: 'analyses' },
    { nom: 'ECB-Liquide de ponction', prix: 13000, categorie: 'analyses' },
    { nom: 'Mycoplasmes', prix: 13000, categorie: 'analyses' },
    { nom: 'Recherche de BK', prix: 10400, categorie: 'analyses' },
    { nom: 'Hémoculture', prix: 13000, categorie: 'analyses' },
    { nom: 'KAOP ou Selles KAOP', prix: 7800, categorie: 'analyses' },
    { nom: 'GOUTTE EPAISSE (GE)', prix: 5200, categorie: 'analyses' },
    { nom: 'CULOT URINAIRE', prix: 3900, categorie: 'analyses' },
    { nom: 'Recherche de Microfilaires', prix: 7800, categorie: 'analyses' },
    { nom: 'Compte d\'ADDIS ou HLM', prix: 6500, categorie: 'analyses' },
    { nom: 'ECC Liquide d\'ascite', prix: 13000, categorie: 'analyses' },
    { nom: 'ECC-LCR', prix: 13000, categorie: 'analyses' },
    { nom: 'TROPONINE', prix: 20800, categorie: 'analyses' },
    { nom: 'DDIMERE', prix: 20800, categorie: 'analyses' },
    { nom: 'CHARGE VIRALE', prix: 91000, categorie: 'analyses' },
    { nom: 'ECHOGRAPHIE MAMAIRE', prix: 0, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE THYROIDIENNE', prix: 0, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE DES TISSUS MOUS', prix: 39000, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE ABDOMINAL', prix: 39000, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE ABDOMINO-PELVIENNE', prix: 58500, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE DOPPLER VASCULAIRE', prix: 60000, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE CARDIAQUE', prix: 99000, categorie: 'radiographie' },
    { nom: 'ECHOGRAPHIE TESTICULAIRE', prix: 39000, categorie: 'radiographie' },
    { nom: 'ELECTROCARDIOGRAMME', prix: 20000, categorie: 'radiographie' },
    { nom: 'FIBROSCOPIE O.G.D', prix: 60000, categorie: 'radiographie' },
    { nom: 'CHAMBRE à 2 LITS', prix: 20000, categorie: 'hospitalisation' },
    { nom: 'CHAMBRE INDIVIDUELLE', prix: 25000, categorie: 'hospitalisation' },
    { nom: 'ACCOUCHEMENT', prix: 120000, categorie: 'maternite' },
    { nom: 'ACCOUCHEMENT GEMELLAIRE', prix: 180000, categorie: 'maternite' },
    { nom: 'PERINEORRAPHIE', prix: 20000, categorie: 'maternite' },
    { nom: 'CONSULTATION SIMPLE', prix: 0, categorie: 'consultations' },
    { nom: 'CONSULTATION NUIT', prix: 0, categorie: 'consultations' },
    { nom: 'CONSULTATION SPECIALISTE', prix: 0, categorie: 'consultations' },
    { nom: 'CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE', prix: 0, categorie: 'consultations' },
    { nom: 'CONSULTATION SAMEDI APRES MIDI ET FERIE', prix: 0, categorie: 'consultations' }
  ];

  // CHARGEMENT DEPUIS LOCALSTORAGE DÉSACTIVÉ - Retourne toujours un tableau vide
  const loadFromStorage = (key, defaultValue = []) => {
    // Ne plus charger depuis localStorage, retourner toujours vide
    return [];
  };

  // LISTES D'ANALYSES PAR CATÉGORIE (conservées pour référence, non utilisées)
  const analysesRadiographie = [
    'ECHOGRAPHIE MAMAIRE',
    'ECHOGRAPHIE THYROIDIENNE',
    'ECHOGRAPHIE DES TISSUS MOUS',
    'ECHOGRAPHIE ABDOMINAL',
    'ECHOGRAPHIE ABDOMINO-PELVIENNE',
    'ECHOGRAPHIE DOPPLER VASCULAIRE',
    'ECHOGRAPHIE CARDIAQUE',
    'ECHOGRAPHIE TESTICULAIRE',
    'ELECTROCARDIOGRAMME',
    'FIBROSCOPIE O.G.D'
  ];

  // Liste des analyses d'hospitalisation
  const analysesHospitalisation = [
    'CHAMBRE à 2 LITS',
    'CHAMBRE INDIVIDUELLE'
  ];

  // Liste des analyses de maternité
  const analysesMaternite = [
    'ACCOUCHEMENT',
    'ACCOUCHEMENT GEMELLAIRE',
    'PERINEORRAPHIE'
  ];

  // Liste des consultations
  const analysesConsultations = [
    'CONSULTATION SIMPLE',
    'CONSULTATION NUIT',
    'CONSULTATION SPECIALISTE',
    'CONSULTATION SPECIALISTE SAMEDI APRES MIDI ET FERIE',
    'CONSULTATION SAMEDI APRES MIDI ET FERIE'
  ];

  // Liste des médicaments (sera remplie par l'utilisateur)
  const analysesMedicament = [];

  // INITIALISATION DES ANALYSES DÉSACTIVÉE - Retourne toujours un tableau vide
  const initializeAnalyses = () => {
    // Ne plus initialiser d'analyses, retourner toujours vide
    return [];
    /*
    const existingAnalyses = loadFromStorage('analyses', []);
    if (existingAnalyses.length === 0) {
      const newAnalyses = analysesStandard.map((nom, index) => ({
        id: `analyse_${Date.now()}_${index}`,
        nom: nom,
        categorie: analysesRadiographie.includes(nom) ? 'radiographie' : 
                   analysesHospitalisation.includes(nom) ? 'hospitalisation' : 
                   analysesMaternite.includes(nom) ? 'maternite' : 
                   analysesConsultations.includes(nom) ? 'consultations' : 
                   analysesMedicament.includes(nom) ? 'medicament' : 'analyses',
        createdAt: new Date().toISOString()
      }));
      saveToStorage('analyses', newAnalyses);
      return newAnalyses;
    }
    // Mettre à jour : supprimer les analyses qui ne sont plus dans la liste standard
    // et ajouter celles qui manquent
    const nomsStandards = new Set(analysesStandard);
    // Mettre à jour les catégories des analyses existantes
    const analysesMisesAJour = existingAnalyses
      .filter(a => nomsStandards.has(a.nom))
      .map(a => ({
        ...a,
        // Mettre à jour la catégorie si elle n'est pas définie ou si elle doit être changée
        categorie: a.categorie || (analysesRadiographie.includes(a.nom) ? 'radiographie' : 
                   analysesHospitalisation.includes(a.nom) ? 'hospitalisation' : 
                   analysesMaternite.includes(a.nom) ? 'maternite' : 
                   analysesConsultations.includes(a.nom) ? 'consultations' : 
                   analysesMedicament.includes(a.nom) ? 'medicament' : 'analyses')
      }));
    
      // Mettre à jour les catégories pour les analyses de radiographie et hospitalisation
      const analysesAvecCategories = analysesMisesAJour.map(a => {
        if (analysesRadiographie.includes(a.nom) && a.categorie !== 'radiographie') {
          return { ...a, categorie: 'radiographie' };
        }
        if (analysesHospitalisation.includes(a.nom) && a.categorie !== 'hospitalisation') {
          return { ...a, categorie: 'hospitalisation' };
        }
        if (analysesMaternite.includes(a.nom) && a.categorie !== 'maternite') {
          return { ...a, categorie: 'maternite' };
        }
        if (analysesConsultations.includes(a.nom) && a.categorie !== 'consultations') {
          return { ...a, categorie: 'consultations' };
        }
        if (analysesMedicament.includes(a.nom) && a.categorie !== 'medicament') {
          return { ...a, categorie: 'medicament' };
        }
        return a;
      });
    
    const nomsExistants = new Set(analysesAvecCategories.map(a => a.nom));
    const analysesManquantes = analysesStandard.filter(nom => !nomsExistants.has(nom));
    
    if (analysesManquantes.length > 0) {
      const nouvellesAnalyses = analysesManquantes.map((nom, index) => ({
        id: `analyse_${Date.now()}_${index}`,
        nom: nom,
        categorie: analysesRadiographie.includes(nom) ? 'radiographie' : 
                   analysesHospitalisation.includes(nom) ? 'hospitalisation' : 
                   analysesMaternite.includes(nom) ? 'maternite' : 
                   analysesConsultations.includes(nom) ? 'consultations' : 
                   analysesMedicament.includes(nom) ? 'medicament' : 'analyses',
        createdAt: new Date().toISOString()
      }));
      const toutesAnalyses = [...analysesAvecCategories, ...nouvellesAnalyses];
      saveToStorage('analyses', toutesAnalyses);
      return toutesAnalyses;
    }
    
    // Sauvegarder si les catégories ont été mises à jour
    const categoriesModifiees = analysesAvecCategories.some((a, index) => 
      a.categorie !== existingAnalyses[index]?.categorie
    );
    if (categoriesModifiees || analysesAvecCategories.length !== existingAnalyses.length) {
      saveToStorage('analyses', analysesAvecCategories);
      return analysesAvecCategories;
    }
    
    return analysesAvecCategories;
    */
  };

  // INITIALISATION DES ASSURANCES DÉSACTIVÉE - Retourne toujours un tableau vide
  const initializeAssurances = () => {
    // Ne plus initialiser d'assurances, retourner toujours vide
    return [];
    /*
    const existingAssurances = loadFromStorage('assurances', []);
    if (existingAssurances.length === 0) {
      const newAssurances = assurancesStandard.map((nom, index) => ({
        id: `assurance_${Date.now()}_${index}`,
        nom: nom,
        createdAt: new Date().toISOString()
      }));
      saveToStorage('assurances', newAssurances);
      return newAssurances;
    }
    // Vérifier si toutes les assurances standard existent, sinon les ajouter
    const nomsExistants = existingAssurances.map(a => a.nom);
    const assurancesManquantes = assurancesStandard.filter(nom => !nomsExistants.includes(nom));
    
    if (assurancesManquantes.length > 0) {
      const nouvellesAssurances = assurancesManquantes.map((nom, index) => ({
        id: `assurance_${Date.now()}_${index}`,
        nom: nom,
        createdAt: new Date().toISOString()
      }));
      const toutesAssurances = [...existingAssurances, ...nouvellesAssurances];
      saveToStorage('assurances', toutesAssurances);
      return toutesAssurances;
    }
    
    return existingAssurances;
    */
  };

  // INITIALISATION DES IPM DÉSACTIVÉE - Retourne toujours un tableau vide
  const initializeIPMs = () => {
    // Ne plus initialiser d'IPM, retourner toujours vide
    return [];
    /*
    const existingIPMs = loadFromStorage('ipms', []);
    if (existingIPMs.length === 0) {
      const newIPMs = ipmsStandard.map((nom, index) => ({
        id: `ipm_${Date.now()}_${index}`,
        nom: nom,
        createdAt: new Date().toISOString()
      }));
      saveToStorage('ipms', newIPMs);
      return newIPMs;
    }
    // Vérifier si toutes les IPM standard existent, sinon les ajouter
    const nomsExistants = existingIPMs.map(i => i.nom);
    const ipmsManquantes = ipmsStandard.filter(nom => !nomsExistants.includes(nom));
    
    if (ipmsManquantes.length > 0) {
      const nouvellesIPMs = ipmsManquantes.map((nom, index) => ({
        id: `ipm_${Date.now()}_${index}`,
        nom: nom,
        createdAt: new Date().toISOString()
      }));
      const toutesIPMs = [...existingIPMs, ...nouvellesIPMs];
      saveToStorage('ipms', toutesIPMs);
      return toutesIPMs;
    }
    
    return existingIPMs;
    */
  };

  // SAUVEGARDE DANS LOCALSTORAGE DÉSACTIVÉE - Ne fait plus rien
  const saveToStorage = (key, value) => {
    // Ne plus sauvegarder dans localStorage
    return;
    /*
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
    }
    */
  };

  // FONCTIONS D'INITIALISATION DES TARIFS DÉSACTIVÉES - Plus d'initialisation automatique
  // Ces fonctions ne sont plus utilisées
  const initializeAssuranceTarifs = (analysesList, existingTarifs) => {
    return [];
  };

  const initializeIPMTarifs = (analysesList, existingTarifs) => {
    return [];
  };

  // TOUS LES ÉTATS INITIALISÉS À VIDE - Plus d'initialisation automatique
  // Plus de chargement depuis localStorage, plus de création de données
  const [analyses, setAnalyses] = useState([]);
  const [ipms, setIpms] = useState([]);
  const [assurances, setAssurances] = useState([]);
  const [tarifs, setTarifs] = useState([]);
  const [patients, setPatients] = useState([]);
  const [devis, setDevis] = useState([]);
  const [categories, setCategories] = useState([]);

  // CHARGEMENT DES DONNÉES DEPUIS L'API DJANGO AU DÉMARRAGE
  // Ne charger que si l'utilisateur est authentifié (token présent)
  useEffect(() => {
    const fetchAllData = async () => {
      // Vérifier si un token existe avant de charger les données
      const token = localStorage.getItem('access_token');
      if (!token) {
        // Pas de token, ne pas charger les données
        console.log('[DataContext] Pas de token, données non chargées');
        return;
      }

      try {
        // Fonction pour récupérer tous les devis en paginant automatiquement
        const fetchAllDevis = async () => {
          let allDevis = [];
          let nextUrl = null;
          let firstCall = true;
          const baseURL = process.env.REACT_APP_API_BASE_URL || '/api';
          
          do {
            try {
              let response;
              if (firstCall) {
                response = await devisAPI.getAll();
                firstCall = false;
              } else {
                // Utiliser l'instance api (token + intercepteur) pour éviter 401
                // nextUrl peut être /api/devis/?page=2 → passer à api.get('/devis/?page=2&...')
                const pathOnly = nextUrl.replace(/^\/api/, '') || '/devis/';
                response = await api.get(pathOnly);
              }
              
              const data = response.data;
              
              // Ajouter les résultats de cette page
              if (data.results && Array.isArray(data.results)) {
                allDevis = [...allDevis, ...data.results];
              } else if (Array.isArray(data)) {
                allDevis = [...allDevis, ...data];
                nextUrl = null;
                break;
              }
              
              // Vérifier s'il y a une page suivante
              nextUrl = data.next ? data.next : null;
              // Extraire le chemin si c'est une URL complète
              if (nextUrl && nextUrl.startsWith('http')) {
                try {
                  const url = new URL(nextUrl);
                  nextUrl = url.pathname + url.search;
                } catch (e) {
                  // Si ce n'est pas une URL valide, essayer d'extraire manuellement
                  const match = nextUrl.match(/\/api\/[^\s]+/);
                  nextUrl = match ? match[0] : null;
                }
              }
              // Éviter le double /api/api/ (au cas où le backend renvoie une mauvaise URL)
              if (nextUrl && nextUrl.includes('/api/api/')) {
                nextUrl = nextUrl.replace(/\/api\/api\//g, '/api/');
              }
            } catch (error) {
              console.error('Erreur lors de la récupération des devis:', error);
              nextUrl = null;
            }
          } while (nextUrl);
          
          return { data: { results: allDevis, count: allDevis.length } };
        };

        // Charger toutes les données depuis l'API
        const [analysesRes, ipmsRes, assurancesRes, tarifsRes, patientsRes, devisRes, categoriesRes] = await Promise.all([
          analysesAPI.getAll().catch(() => ({ data: { results: [] } })),
          ipmsAPI.getAll().catch(() => ({ data: { results: [] } })),
          assurancesAPI.getAll().catch(() => ({ data: { results: [] } })),
          tarifsAPI.getAll().catch(() => ({ data: { results: [] } })),
          patientsAPI.getAll().catch(() => ({ data: { results: [] } })),
          fetchAllDevis().catch(() => ({ data: { results: [] } })),
          categoriesAPI.getAll().catch((err) => {
            // 401 = non authentifié (redirection gérée par l'intercepteur), 403 = non admin
            if (err.response?.status === 401 || err.response?.status === 403) {
              if (err.response?.status === 403) {
                console.log('[DataContext] Accès aux catégories refusé (utilisateur non-admin)');
              }
              return { data: { categories: [] } };
            }
            return { data: { categories: [] } };
          }),
        ]);

        // Convertir les données de l'API au format frontend
        const analysesData = analysesRes.data.results || analysesRes.data || [];
        const ipmsData = (ipmsRes.data.results || ipmsRes.data || []).map(ipm => ({
          ...ipm,
          actif: ipm.actif !== undefined ? ipm.actif : true
        }));
        const assurancesData = (assurancesRes.data.results || assurancesRes.data || []).map(assurance => ({
          ...assurance,
          actif: assurance.actif !== undefined ? assurance.actif : true
        }));
        // Normaliser les catégories : toujours des strings (éviter objets { nom, actif } en state)
        const categoriesData = (categoriesRes.data.categories || [])
          .map(cat => {
            if (typeof cat === 'object' && cat != null && cat.nom != null) {
              return cat.actif !== false ? String(cat.nom) : null;
            }
            return typeof cat === 'string' ? cat : (cat != null ? String(cat) : null);
          })
          .filter(cat => cat !== null && cat !== '');
        const tarifsData = (tarifsRes.data.results || tarifsRes.data || []).map(convertTarifFromAPI);
        const patientsData = (patientsRes.data.results || patientsRes.data || []).map(convertPatientFromAPI);
        
        // Le backend retourne déjà en camelCase pour les devis
        const rawDevis = devisRes.data.results || devisRes.data || [];
        const devisData = rawDevis.map(d => {
          // Si déjà en camelCase (format du backend)
          if (d.patientId != null || d.patient != null) {
            // Convertir les lignes avec les informations complètes (nom, categorie, quantite)
            const lignes = (d.lignes || []).map(ligne => ({
              id: ligne.id,
              analyseId: ligne.analyseId || ligne.analyse,
              nom: ligne.nom || ligne.analyse_nom || 'Analyse inconnue',
              categorie: ligne.categorie || ligne.analyse_categorie,
              prix: parseFloat(ligne.prix || 0),
              quantite: ligne.quantite || 1
            }));
            
            return {
              id: d.id,
              numero: d.numero,
              patientId: d.patientId ?? d.patient,
              lignes: lignes,
              total: typeof d.total === 'number' ? d.total : parseFloat(d.total) || 0,
              souscripteur: d.souscripteur || '',
              tauxCouverture: d.tauxCouverture || '',
              dateCreation: d.dateCreation ?? d.date_creation ?? null,
              statutPaiement: d.statutPaiement || d.statut_paiement || 'NON_REGLÉ',
              datePaiement: d.datePaiement ?? d.date_paiement ?? null,
              commentairePaiement: d.commentairePaiement || d.commentaire_paiement || '',
            };
          }
          // Sinon convertir depuis snake_case
          return convertDevisFromAPI(d);
        });

        // Mettre à jour les états
        setAnalyses(analysesData);
        setIpms(ipmsData);
        setAssurances(assurancesData);
        setTarifs(tarifsData);
        setPatients(patientsData);
        setDevis(devisData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Erreur lors du chargement des données depuis l\'API:', error);
        // En cas d'erreur, garder les tableaux vides
      }
    };

    fetchAllData();
  }, []); // Charger une seule fois au montage du composant


  // SAUVEGARDE AUTOMATIQUE DANS LOCALSTORAGE DÉSACTIVÉE
  // Plus aucune sauvegarde dans localStorage
  /*
  useEffect(() => {
    saveToStorage('analyses', analyses);
  }, [analyses]);

  useEffect(() => {
    saveToStorage('ipms', ipms);
  }, [ipms]);

  useEffect(() => {
    saveToStorage('assurances', assurances);
  }, [assurances]);

  useEffect(() => {
    saveToStorage('tarifs', tarifs);
  }, [tarifs]);

  useEffect(() => {
    saveToStorage('patients', patients);
  }, [patients]);

  useEffect(() => {
    saveToStorage('devis', devis);
  }, [devis]);
  */

  // CRÉATION AUTOMATIQUE D'ANALYSES DÉSACTIVÉE - Plus de création automatique
  // Aucun useEffect ne crée plus de données automatiquement

  // Fonctions pour les analyses - Utilisent maintenant l'API Django
  const addAnalyse = async (analyse) => {
    try {
      const categorie = analyse.categorie || 'analyses';
      const data = {
        nom: analyse.nom,
        categorie: categorie,
      };
      const response = await analysesAPI.create(data);
      const newAnalyse = {
        id: response.data.id,
        nom: response.data.nom,
        categorie: response.data.categorie,
        createdAt: response.data.created_at,
      };
      if (!analyses.find(a => a.id === newAnalyse.id)) {
        setAnalyses([...analyses, newAnalyse]);
      }
      return newAnalyse;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout de l'analyse: ${errorMsg}`);
      throw error;
    }
  };

  const updateAnalyse = async (id, updatedAnalyse) => {
    try {
      const data = {
        nom: updatedAnalyse.nom,
        categorie: updatedAnalyse.categorie || 'analyses',
      };
      const response = await analysesAPI.update(id, data);
      const updated = {
        id: response.data.id,
        nom: response.data.nom,
        categorie: response.data.categorie,
        createdAt: response.data.created_at,
      };
      setAnalyses(analyses.map(a => a.id === id ? updated : a));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification de l'analyse: ${errorMsg}`);
      throw error;
    }
  };

  const deleteAnalyse = async (id) => {
    try {
      await analysesAPI.delete(id);
      setAnalyses(analyses.filter(a => a.id !== id));
      setTarifs(tarifs.filter(t => t.analyseId !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression de l'analyse: ${errorMsg}`);
      throw error;
    }
  };

  // Fonctions pour les IPM - Utilisent maintenant l'API Django
  const addIPM = async (ipm) => {
    try {
      const data = { nom: ipm.nom };
      const response = await ipmsAPI.create(data);
      const newIPM = {
        id: response.data.id,
        nom: response.data.nom,
        createdAt: response.data.created_at,
      };
      if (!ipms.find(i => i.id === newIPM.id)) {
        setIpms([...ipms, newIPM]);
      }
      return newIPM;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout de l'IPM: ${errorMsg}`);
      throw error;
    }
  };

  const updateIPM = async (id, updatedIPM) => {
    try {
      const data = { nom: updatedIPM.nom };
      const response = await ipmsAPI.update(id, data);
      const updated = {
        id: response.data.id,
        nom: response.data.nom,
        createdAt: response.data.created_at,
      };
      setIpms(ipms.map(i => i.id === id ? updated : i));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification de l'IPM: ${errorMsg}`);
      throw error;
    }
  };

  const deleteIPM = async (id) => {
    try {
      await ipmsAPI.delete(id);
      setIpms(ipms.filter(i => i.id !== id));
      setTarifs(tarifs.filter(t => t.ipmId !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression de l'IPM: ${errorMsg}`);
      throw error;
    }
  };

  const activateIPM = async (id) => {
    try {
      const response = await ipmsAPI.activate(id);
      const updated = {
        id: response.data.ipm.id,
        nom: response.data.ipm.nom,
        actif: response.data.ipm.actif,
        createdAt: response.data.ipm.created_at,
      };
      setIpms(ipms.map(i => i.id === id ? updated : i));
      return updated;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'activation de l'IPM: ${errorMsg}`);
      throw error;
    }
  };

  const deactivateIPM = async (id) => {
    try {
      const response = await ipmsAPI.deactivate(id);
      const updated = {
        id: response.data.ipm.id,
        nom: response.data.ipm.nom,
        actif: response.data.ipm.actif,
        createdAt: response.data.ipm.created_at,
      };
      setIpms(ipms.map(i => i.id === id ? updated : i));
      return updated;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la désactivation de l'IPM: ${errorMsg}`);
      throw error;
    }
  };

  // Fonctions pour les assurances - Utilisent maintenant l'API Django
  const addAssurance = async (assurance) => {
    try {
      const data = { nom: assurance.nom };
      const response = await assurancesAPI.create(data);
      const newAssurance = {
        id: response.data.id,
        nom: response.data.nom,
        createdAt: response.data.created_at,
      };
      if (!assurances.find(a => a.id === newAssurance.id)) {
        setAssurances([...assurances, newAssurance]);
      }
      return newAssurance;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout de l'assurance: ${errorMsg}`);
      throw error;
    }
  };

  const updateAssurance = async (id, updatedAssurance) => {
    try {
      const data = { nom: updatedAssurance.nom };
      const response = await assurancesAPI.update(id, data);
      const updated = {
        id: response.data.id,
        nom: response.data.nom,
        createdAt: response.data.created_at,
      };
      setAssurances(assurances.map(a => a.id === id ? updated : a));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification de l'assurance: ${errorMsg}`);
      throw error;
    }
  };

  const deleteAssurance = async (id) => {
    try {
      await assurancesAPI.delete(id);
      setAssurances(assurances.filter(a => a.id !== id));
      setTarifs(tarifs.filter(t => t.assuranceId !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression de l'assurance: ${errorMsg}`);
      throw error;
    }
  };

  const activateAssurance = async (id) => {
    try {
      const response = await assurancesAPI.activate(id);
      const updated = {
        id: response.data.assurance.id,
        nom: response.data.assurance.nom,
        actif: response.data.assurance.actif,
        createdAt: response.data.assurance.created_at,
      };
      setAssurances(assurances.map(a => a.id === id ? updated : a));
      return updated;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'activation de l'assurance: ${errorMsg}`);
      throw error;
    }
  };

  const deactivateAssurance = async (id) => {
    try {
      const response = await assurancesAPI.deactivate(id);
      const updated = {
        id: response.data.assurance.id,
        nom: response.data.assurance.nom,
        actif: response.data.assurance.actif,
        createdAt: response.data.assurance.created_at,
      };
      setAssurances(assurances.map(a => a.id === id ? updated : a));
      return updated;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la désactivation de l'assurance: ${errorMsg}`);
      throw error;
    }
  };

  // Fonctions pour les tarifs - Utilisent maintenant l'API Django
  const addTarif = async (tarif) => {
    try {
      const data = convertTarifToAPI(tarif);
      const response = await tarifsAPI.create(data);
      const newTarif = convertTarifFromAPI(response.data);
      if (!tarifs.find(t => t.id === newTarif.id)) {
        setTarifs([...tarifs, newTarif]);
      }
      return newTarif;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout du tarif: ${errorMsg}`);
      throw error;
    }
  };

  const updateTarif = async (id, updatedTarif) => {
    try {
      // Récupérer le tarif existant pour préserver les champs manquants
      const existingTarif = tarifs.find(t => t.id === id);
      if (!existingTarif) {
        throw new Error('Tarif non trouvé');
      }
      
      // Fusionner les données existantes avec les nouvelles données
      const mergedTarif = {
        ...existingTarif,
        ...updatedTarif,
        // S'assurer que analyseId est présent
        analyseId: updatedTarif.analyseId || existingTarif.analyseId,
        // S'assurer que typePriseEnCharge est présent
        typePriseEnCharge: updatedTarif.typePriseEnCharge || existingTarif.typePriseEnCharge,
        // S'assurer que ipmId et assuranceId sont présents
        ipmId: updatedTarif.ipmId !== undefined ? updatedTarif.ipmId : existingTarif.ipmId,
        assuranceId: updatedTarif.assuranceId !== undefined ? updatedTarif.assuranceId : existingTarif.assuranceId,
      };
      
      const data = convertTarifToAPI(mergedTarif);
      const response = await tarifsAPI.update(id, data);
      const updated = convertTarifFromAPI(response.data);
      setTarifs(tarifs.map(t => t.id === id ? updated : t));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification du tarif: ${errorMsg}`);
      throw error;
    }
  };

  const deleteTarif = async (id) => {
    try {
      await tarifsAPI.delete(id);
      setTarifs(tarifs.filter(t => t.id !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression du tarif: ${errorMsg}`);
      throw error;
    }
  };

  // Obtenir le prix d'une analyse selon IPM ou Assurance
  // Les tarifs sont maintenant génériques : tous les IPM ont les mêmes tarifs, toutes les assurances ont les mêmes tarifs
  const getPrixAnalyse = (analyseId, ipmId, assuranceId) => {
    // Chercher d'abord les tarifs génériques (avec typePriseEnCharge)
    let tarif = tarifs.find(t => 
      t.analyseId === analyseId && 
      ((ipmId && t.typePriseEnCharge === 'IPM') || (assuranceId && t.typePriseEnCharge === 'ASSURANCE'))
    );
    
    // Si pas trouvé, chercher dans l'ancien système (pour compatibilité)
    if (!tarif) {
      tarif = tarifs.find(t => 
        t.analyseId === analyseId && 
        ((ipmId && t.ipmId === ipmId) || (assuranceId && t.assuranceId === assuranceId))
      );
    }
    
    return tarif ? tarif.prix : 0;
  };

  // Fonctions pour les patients - Utilisent maintenant l'API Django
  const addPatient = async (patient) => {
    try {
      const data = convertPatientToAPI(patient);
      const response = await patientsAPI.create(data);
      const newPatient = convertPatientFromAPI(response.data);
      if (!patients.find(p => p.id === newPatient.id)) {
        setPatients([...patients, newPatient]);
      }
      return newPatient;
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout du patient: ${errorMsg}`);
      throw error;
    }
  };

  const updatePatient = async (id, updatedPatient) => {
    try {
      const data = convertPatientToAPI(updatedPatient);
      const response = await patientsAPI.update(id, data);
      const updated = convertPatientFromAPI(response.data);
      setPatients(patients.map(p => p.id === id ? updated : p));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification du patient: ${errorMsg}`);
      throw error;
    }
  };

  const deletePatient = async (id) => {
    try {
      await patientsAPI.delete(id);
      setPatients(patients.filter(p => p.id !== id));
      setDevis(devis.filter(d => d.patientId !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression du patient: ${errorMsg}`);
      throw error;
    }
  };

  // Fonctions pour les devis - Utilisent maintenant l'API Django
  const addDevis = async (devisData) => {
    let newDevis; // Déclarer newDevis ici pour qu'il soit accessible dans le bloc catch
    try {
      const data = convertDevisToAPI(devisData);
      const response = await devisAPI.create(data);
      
      // Le backend retourne déjà en camelCase dans la méthode create
      // Convertir les lignes avec toutes les informations (id, analyseId, nom, categorie, prix, quantite)
      if (response.data.patientId) {
        // Format camelCase du backend - convertir les lignes avec toutes les informations
        const lignes = (response.data.lignes || []).map(ligne => ({
          id: ligne.id,
          analyseId: ligne.analyseId || ligne.analyse,
          nom: ligne.nom || ligne.analyse_nom || 'Analyse inconnue',
          categorie: ligne.categorie || ligne.analyse_categorie,
          prix: parseFloat(ligne.prix || 0),
          quantite: ligne.quantite || 1
        }));
        
        newDevis = {
          id: response.data.id,
          numero: response.data.numero,
          patientId: response.data.patientId,
          lignes: lignes,
          total: typeof response.data.total === 'number' ? response.data.total : parseFloat(response.data.total),
          souscripteur: response.data.souscripteur || '',
          tauxCouverture: response.data.tauxCouverture || '',
          dateCreation: response.data.dateCreation,
          statutPaiement: response.data.statutPaiement || response.data.statut_paiement || 'NON_REGLÉ',
          datePaiement: response.data.datePaiement || response.data.date_paiement || null,
          commentairePaiement: response.data.commentairePaiement || response.data.commentaire_paiement || '',
        };
      } else {
        // Convertir depuis snake_case si nécessaire
        newDevis = convertDevisFromAPI(response.data);
      }
      
      // Recharger tous les devis depuis l'API pour être sûr d'avoir la liste à jour
      try {
        const devisRes = await devisAPI.getAll();
        const rawDevis = devisRes.data.results || devisRes.data || [];
        const devisData = rawDevis.map(d => {
          if (d.patientId != null || d.patient != null) {
            const lignes = (d.lignes || []).map(ligne => ({
              id: ligne.id,
              analyseId: ligne.analyseId || ligne.analyse,
              nom: ligne.analyse_nom || ligne.nom,
              categorie: ligne.analyse_categorie || ligne.categorie,
              prix: parseFloat(ligne.prix),
              quantite: ligne.quantite || 1
            }));
            return {
              id: d.id,
              numero: d.numero,
              patientId: d.patientId ?? d.patient,
              lignes,
              total: typeof d.total === 'number' ? d.total : parseFloat(d.total) || 0,
              souscripteur: d.souscripteur || '',
              tauxCouverture: d.tauxCouverture || '',
              dateCreation: d.dateCreation ?? d.date_creation ?? null,
              statutPaiement: d.statutPaiement || d.statut_paiement || 'NON_REGLÉ',
              datePaiement: d.datePaiement ?? d.date_paiement ?? null,
              commentairePaiement: d.commentairePaiement || d.commentaire_paiement || '',
            };
          }
          return convertDevisFromAPI(d);
        });
        setDevis(devisData);
      } catch (reloadError) {
        console.error('Erreur lors du rechargement des devis:', reloadError);
        // Si le rechargement échoue, ajouter quand même le nouveau devis sans afficher d'erreur
        // car le devis a été créé avec succès
        if (!devis.find(d => d.id === newDevis.id)) {
          setDevis([...devis, newDevis]);
        }
      }
      
      return newDevis;
    } catch (error) {
      // Si on arrive ici, c'est que la création a échoué (pas de newDevis défini)
      // OU que newDevis est défini mais il y a eu une erreur
      // Vérifier si le devis a été créé malgré l'erreur
      if (typeof newDevis !== 'undefined' && newDevis) {
        // Le devis a été créé avec succès (status 201), mais il y a eu une erreur lors du rechargement
        // Ne pas afficher d'erreur à l'utilisateur car le devis est bien créé
        console.warn('Devis créé avec succès mais erreur lors du rechargement:', error);
        // Ajouter le devis à la liste localement
        if (!devis.find(d => d.id === newDevis.id)) {
          setDevis([...devis, newDevis]);
        }
        return newDevis;
      }
      // Vraie erreur de création
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de l'ajout du devis: ${errorMsg}`);
      throw error;
    }
  };

  const updateDevis = async (id, updatedDevis) => {
    try {
      const data = convertDevisToAPI(updatedDevis);
      const response = await devisAPI.update(id, data);
      const updated = convertDevisFromAPI(response.data);
      setDevis(devis.map(d => d.id === id ? updated : d));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la modification du devis: ${errorMsg}`);
      throw error;
    }
  };

  const deleteDevis = async (id) => {
    try {
      await devisAPI.delete(id);
      setDevis(devis.filter(d => d.id !== id));
    } catch (error) {
      const errorMsg = handleAPIError(error);
      alert(`Erreur lors de la suppression du devis: ${errorMsg}`);
      throw error;
    }
  };

  // Obtenir les devis mensuels
  const getDevisMensuels = (mois, typePriseEnCharge, ipmId, assuranceId) => {
    const dateDebut = new Date(mois.getFullYear(), mois.getMonth(), 1);
    const dateFin = new Date(mois.getFullYear(), mois.getMonth() + 1, 0, 23, 59, 59);

    return devis.filter(d => {
      const dateDevis = new Date(d.dateCreation);
      if (dateDevis < dateDebut || dateDevis > dateFin) return false;

      const patient = patients.find(p => p.id === d.patientId);
      if (!patient) return false;

      if (typePriseEnCharge === 'IPM') {
        return patient.typePriseEnCharge === 'IPM' && patient.ipmId === ipmId;
      } else {
        return patient.typePriseEnCharge === 'ASSURANCE' && patient.assuranceId === assuranceId;
      }
    });
  };

  // Fonction pour recharger les catégories depuis l'API
  const reloadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      // Normaliser les catégories : extraire le nom si c'est un objet, garder la string sinon
      // Filtrer pour ne garder que les catégories actives
      const categoriesData = (response.data.categories || [])
        .map(cat => {
          if (typeof cat === 'object' && cat != null && cat.nom != null) {
            return cat.actif !== false ? String(cat.nom) : null;
          }
          return typeof cat === 'string' ? cat : (cat != null ? String(cat) : null);
        })
        .filter(cat => cat !== null && cat !== '');
      setCategories(categoriesData);
      return categoriesData;
    } catch (error) {
      console.error('Erreur lors du rechargement des catégories:', error);
      return [];
    }
  };

  const activateCategorie = async (categorie) => {
    try {
      await categoriesAPI.activate(categorie);
      await reloadCategories();
    } catch (error) {
      console.error('Erreur lors de l\'activation de la catégorie:', error);
      throw error;
    }
  };

  const deactivateCategorie = async (categorie) => {
    try {
      await categoriesAPI.deactivate(categorie);
      await reloadCategories();
    } catch (error) {
      console.error('Erreur lors de la désactivation de la catégorie:', error);
      throw error;
    }
  };

  const value = {
    // Données
    analyses,
    ipms,
    assurances,
    tarifs,
    patients,
    devis,
    categories,
    
    // Fonctions analyses
    addAnalyse,
    updateAnalyse,
    deleteAnalyse,
    
    // Fonctions IPM
    addIPM,
    updateIPM,
    deleteIPM,
    activateIPM,
    deactivateIPM,
    
    // Fonctions assurances
    addAssurance,
    updateAssurance,
    deleteAssurance,
    activateAssurance,
    deactivateAssurance,
    
    // Fonctions tarifs
    addTarif,
    updateTarif,
    deleteTarif,
    getPrixAnalyse,
    
    // Fonctions patients
    addPatient,
    updatePatient,
    deletePatient,
    
    // Fonctions devis
    addDevis,
    updateDevis,
    deleteDevis,
    getDevisMensuels,
    
    // Fonction pour recharger les catégories
    reloadCategories,
    activateCategorie,
    deactivateCategorie
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
