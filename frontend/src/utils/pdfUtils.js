import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CLINIQUE } from '../config/clinique';

// Chemin du logo (simplifié pour web uniquement)
const logoPath = '/NABY.jpg';

/**
 * Génère un PDF pour un devis individuel - Format identique à la plateforme
 */
export const generatePDFDevis = async (devis, patient, analyses, lignes, ipms = [], assurances = []) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    // Noms des catégories
    const categoryNames = {
      'analyses': 'Analyses',
      'radiographie': 'Radiographie',
      'hospitalisation': 'Hospitalisation',
      'maternite': 'Maternité',
      'consultations': 'Consultations',
      'medicament': 'Médicament'
    };

    // Fonction pour formater les montants (sans séparateurs de milliers pour éviter les "/")
    const formatMontant = (montant) => {
      // Convertir en nombre et arrondir
      const nombre = Math.round(parseFloat(montant) || 0);
      // Retourner sans séparateurs de milliers
      return nombre.toString();
    };

    // Fonction pour ajouter une nouvelle page si nécessaire
    const checkPageBreak = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    // En-tête avec logo et informations clinique
    const headerY = yPos;
    try {
      const img = new Image();
      img.src = logoPath;
      await new Promise((resolve) => {
        img.onload = () => {
          const imgWidth = 20;
          const imgHeight = (img.height * imgWidth) / img.width;
          doc.addImage(img, 'JPEG', margin, headerY, imgWidth, imgHeight);
          resolve();
        };
        img.onerror = () => resolve();
      });
    } catch (error) {
      // Continuer sans logo
    }

    // Informations clinique à côté du logo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text(CLINIQUE.nom, margin + 25, headerY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(CLINIQUE.adresse, margin + 25, headerY + 10);
    CLINIQUE.telephone.forEach((tel, i) => {
      doc.text(`Tél: ${tel}`, margin + 25, headerY + 15 + i * 4);
    });
    if (CLINIQUE.email) {
      doc.text(`Email: ${CLINIQUE.email}`, margin + 25, headerY + 15 + CLINIQUE.telephone.length * 4);
    }

    // Numéro de facture et date à droite
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`FACTURE N° ${devis.numero}`, pageWidth - margin, headerY + 5, { align: 'right' });

    const dateCreation = new Date(devis.dateCreation);
    const dateStr = dateCreation.toLocaleDateString('fr-FR');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${dateStr}`, pageWidth - margin, headerY + 10, { align: 'right' });

    yPos = headerY + 26 + CLINIQUE.telephone.length * 4 + (CLINIQUE.email ? 5 : 0);

    // Ligne de séparation sous l'en-tête
    doc.setDrawColor(30, 58, 95); // #1e3a5f (bleu-nuit)
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Informations patient (fond gris)
    checkPageBreak(25);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 126, 234);
    doc.text('Informations du patient', margin, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    // Nom et souscripteur sur la même ligne
    const nomText = `Nom: ${patient.nomComplet}`;
    doc.text(nomText, margin, yPos);
    if (devis.souscripteur) {
      doc.text(`Souscripteur: ${devis.souscripteur}`, pageWidth - margin, yPos, { align: 'right' });
    }
    yPos += 6;

    doc.text(`Matricule: ${patient.matricule}`, margin, yPos);
    yPos += 6;

    // Type de prise en charge avec nom IPM/Assurance
    const ipm = patient.ipmId ? ipms.find(i => i.id === patient.ipmId) : null;
    const assurance = patient.assuranceId ? assurances.find(a => a.id === patient.assuranceId) : null;
    const typeText = patient.typePriseEnCharge === 'IPM' 
      ? `Type: IPM - ${ipm?.nom || ''}` 
      : `Type: Assurance - ${assurance?.nom || ''}`;
    doc.text(typeText, margin, yPos);
    yPos += 6;

    doc.text(`Date: ${dateStr}`, margin, yPos);
    yPos += 12;

    // Tableau des prestations
    checkPageBreak(30);
    
    // En-tête du tableau
    doc.setFillColor(102, 126, 234);
    doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('#', margin + 3, yPos + 5.5);
    doc.text('Catégorie', margin + 15, yPos + 5.5);
    doc.text('Prix (FCFA)', pageWidth - margin - 3, yPos + 5.5, { align: 'right' });
    yPos += 8;

    // Grouper les lignes par catégorie
    const lignesParCategorie = {};
    let globalIndex = 0;
    
    lignes.forEach((ligne) => {
      const analyse = analyses.find(a => a.id === ligne.analyseId);
      const categorie = analyse?.categorie || 'non-categorise';
      if (!lignesParCategorie[categorie]) {
        lignesParCategorie[categorie] = [];
      }
      lignesParCategorie[categorie].push({ ligne, analyse, index: globalIndex++ });
    });

    // Trier les catégories
    const ordreCategories = ['analyses', 'radiographie', 'hospitalisation', 'maternite', 'consultations', 'medicament', 'non-categorise'];
    const categoriesTriees = Object.keys(lignesParCategorie).sort((a, b) => {
      const indexA = ordreCategories.indexOf(a);
      const indexB = ordreCategories.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    let ligneIndex = 0;
    let total = 0;

    categoriesTriees.forEach((categorie, catIndex) => {
      const lignesCategorie = lignesParCategorie[categorie];
      const categorieName = categoryNames[categorie] || categorie;

      // UNE SEULE ligne de séparation entre catégories (sauf la première)
      if (catIndex > 0) {
        checkPageBreak(10);
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 3;
      }

      // Nom de la catégorie (fond gris)
      checkPageBreak(10);
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(categorieName, margin + 2, yPos + 4);
      yPos += 6;

      // Lignes de la catégorie
      lignesCategorie.forEach(({ ligne, analyse }) => {
        checkPageBreak(8);
        ligneIndex++;
        const prix = ligne.prix || 0;
        const quantite = ligne.quantite || 1;
        const sousTotal = prix * quantite;
        total += sousTotal;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(ligneIndex.toString(), margin + 3, yPos + 4);
        
        // Utiliser le nom stocké dans la ligne en priorité (afficher le vrai nom des médicaments)
        const nomBase = ligne.nom || analyse?.nom || 'Analyse inconnue';
        // Ajouter la quantité au nom si > 1
        const nomAnalyse = quantite > 1 ? `${nomBase} x${quantite}` : nomBase;
        const maxWidth = pageWidth - margin * 2 - 40;
        const lines = doc.splitTextToSize(nomAnalyse, maxWidth);
        doc.text(lines[0], margin + 15, yPos + 4);
        if (lines.length > 1) {
          yPos += 4;
          doc.text(lines.slice(1).join(' '), margin + 18, yPos + 4);
        }
        
        // Formatage sans séparateurs pour éviter les "/"
        const prixFormate = formatMontant(sousTotal);
        doc.text(prixFormate, pageWidth - margin - 3, yPos + 4, { align: 'right' });
        yPos += 6;
      });
    });

    // Total
    checkPageBreak(20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', margin + 15, yPos + 4);
    const totalFormate = formatMontant(total);
    doc.text(`${totalFormate} FCFA`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
    yPos += 10;

    // Taux de couverture si présent
    if (devis.tauxCouverture) {
      const taux = parseFloat(devis.tauxCouverture) || 0;
      const montantAPayer = total * (taux / 100);
      const montantCouvert = total - montantAPayer;

      checkPageBreak(25);
      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');
      doc.setFontSize(9);
      doc.text('Part patients', margin + 2, yPos + 4);
      doc.text(`${taux}%`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
      yPos += 6;

      doc.setFillColor(212, 237, 218);
      doc.rect(margin, yPos, pageWidth - margin * 2, 7, 'F');
      doc.setFontSize(10);
      doc.setTextColor(21, 87, 36);
      doc.setFont('helvetica', 'bold');
      doc.text('Montant à payer', margin + 2, yPos + 5);
      const montantAPayerFormate = formatMontant(montantAPayer);
      doc.text(`${montantAPayerFormate} FCFA`, pageWidth - margin - 3, yPos + 5, { align: 'right' });
      yPos += 7;

      doc.setFillColor(248, 249, 250);
      doc.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');
      doc.setTextColor(0, 0, 0);
      doc.text('Montant couvert', margin + 2, yPos + 4);
      const montantCouvertFormate = formatMontant(montantCouvert);
      doc.text(`${montantCouvertFormate} FCFA`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
      yPos += 10;
    }

    // Signature
    checkPageBreak(25);
    const signatureY = pageHeight - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature', pageWidth / 2, signatureY, { align: 'center' });
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, signatureY + 5, pageWidth / 2 + 40, signatureY + 5);
    
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('La comptabilité', pageWidth / 2, signatureY + 12, { align: 'center' });

    // Sauvegarder le PDF
    doc.save(`devis-${devis.numero}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

/**
 * Génère un PDF pour un devis mensuel - Format identique à la plateforme
 */
export const generatePDFDevisMensuel = async (
  devisList,
  entite,
  mois,
  typePriseEnCharge,
  patients,
  analyses,
  ipms,
  assurances,
  numeroFacture = null
) => {
  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;

    const categoryNames = {
      'analyses': 'Analyses',
      'radiographie': 'Radiographie',
      'hospitalisation': 'Hospitalisation',
      'maternite': 'Maternité',
      'consultations': 'Consultations',
      'medicament': 'Médicament'
    };

    const formatMontant = (montant) => {
      const nombre = Math.round(parseFloat(montant) || 0);
      return nombre.toString();
    };

    let currentPageNumber = 1;
    const checkPageBreak = (requiredSpace) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        currentPageNumber++;
        yPos = margin;
        return true;
      }
      return false;
    };

    const headerY = yPos;
    try {
      const img = new Image();
      img.src = logoPath;
      await new Promise((resolve) => {
        img.onload = () => {
          const imgWidth = 20;
          const imgHeight = (img.height * imgWidth) / img.width;
          doc.addImage(img, 'JPEG', margin, headerY, imgWidth, imgHeight);
          resolve();
        };
        img.onerror = () => resolve();
      });
    } catch (error) {}

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 95);
    doc.text(CLINIQUE.nom, margin + 25, headerY + 5);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(CLINIQUE.adresse, margin + 25, headerY + 10);
    CLINIQUE.telephone.forEach((tel, i) => {
      doc.text(`Tél: ${tel}`, margin + 25, headerY + 15 + i * 4);
    });
    if (CLINIQUE.email) {
      doc.text(`Email: ${CLINIQUE.email}`, margin + 25, headerY + 15 + CLINIQUE.telephone.length * 4);
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const entiteNom = entite ? entite.nom : 'Non spécifié';
    doc.text(`FACTURE MENSUELLE - ${entiteNom}`, pageWidth - margin, headerY + 5, { align: 'right' });
    let yOffset = 0;
    if (numeroFacture) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`N° Facture: ${numeroFacture}`, pageWidth - margin, headerY + 10, { align: 'right' });
      yOffset = 5;
    }
    const dateDebut = new Date(mois.getFullYear(), mois.getMonth(), 1);
    const dateFin = new Date(mois.getFullYear(), mois.getMonth() + 1, 0);
    const periodeStr = `${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Période: ${periodeStr}`, pageWidth - margin, headerY + 10 + yOffset, { align: 'right' });
    doc.text(`Type: ${typePriseEnCharge}`, pageWidth - margin, headerY + 15 + yOffset, { align: 'right' });
    doc.text(`Nombre de devis: ${devisList.length}`, pageWidth - margin, headerY + 20 + yOffset, { align: 'right' });

    yPos = headerY + 30;

    doc.setDrawColor(30, 58, 95);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    let totalGeneral = 0;

    devisList.forEach((devis, devisIndex) => {
      const patient = patients.find(p => p.id === devis.patientId);

      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(102, 126, 234);
      const devisTitle = `Devis #${devis.numero} - ${patient?.nomComplet || 'Patient supprimé'} (${patient?.matricule || 'N/A'}) - ${new Date(devis.dateCreation).toLocaleDateString('fr-FR')}`;
      const titleLines = doc.splitTextToSize(devisTitle, pageWidth - margin * 2);
      doc.text(titleLines[0], margin, yPos);
      if (titleLines.length > 1) {
        yPos += 5;
        doc.text(titleLines.slice(1).join(' '), margin, yPos);
      }
      yPos += 5;

      if (devis.souscripteur) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Souscripteur: ${devis.souscripteur}`, margin, yPos);
        yPos += 5;
      }

      checkPageBreak(25);
      doc.setFillColor(102, 126, 234);
      doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('#', margin + 3, yPos + 5.5);
      doc.text('Catégorie', margin + 15, yPos + 5.5);
      doc.text('Prix (FCFA)', pageWidth - margin - 3, yPos + 5.5, { align: 'right' });
      yPos += 8;

      const lignesParCategorie = {};
      let globalIndex = 0;
      devis.lignes.forEach((ligne) => {
        const analyse = analyses.find(a => a.id === ligne.analyseId);
        const categorie = analyse?.categorie || 'non-categorise';
        if (!lignesParCategorie[categorie]) lignesParCategorie[categorie] = [];
        lignesParCategorie[categorie].push({ ligne, analyse, index: globalIndex++ });
      });

      const ordreCategories = ['analyses', 'radiographie', 'hospitalisation', 'maternite', 'consultations', 'medicament', 'non-categorise'];
      const categoriesTriees = Object.keys(lignesParCategorie).sort((a, b) => {
        const indexA = ordreCategories.indexOf(a);
        const indexB = ordreCategories.indexOf(b);
        return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
      });

      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      let ligneIndex = 0;

      categoriesTriees.forEach((categorie, catIndex) => {
        const lignesCategorie = lignesParCategorie[categorie];
        const categorieName = categoryNames[categorie] || categorie;

        if (catIndex > 0) {
          checkPageBreak(10);
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.3);
          doc.line(margin, yPos, pageWidth - margin, yPos);
          yPos += 3;
        }

        checkPageBreak(10);
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, yPos, pageWidth - margin * 2, 6, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(categorieName, margin + 2, yPos + 4);
        yPos += 6;

        lignesCategorie.forEach(({ ligne, analyse }) => {
          checkPageBreak(8);
          ligneIndex++;
          const prix = ligne.prix || 0;
          const quantite = ligne.quantite || 1;
          const sousTotal = prix * quantite;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.text(ligneIndex.toString(), margin + 3, yPos + 4);
          const nomBase = ligne.nom || analyse?.nom || 'Analyse inconnue';
          const nomAnalyse = quantite > 1 ? `${nomBase} x${quantite}` : nomBase;
          const maxWidth = pageWidth - margin * 2 - 40;
          const lines = doc.splitTextToSize(nomAnalyse, maxWidth);
          doc.text(lines[0], margin + 15, yPos + 4);
          if (lines.length > 1) {
            yPos += 4;
            doc.text(lines.slice(1).join(' '), margin + 18, yPos + 4);
          }
          doc.text(formatMontant(sousTotal), pageWidth - margin - 3, yPos + 4, { align: 'right' });
          yPos += 6;
        });
      });

      checkPageBreak(15);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Sous-total', margin + 15, yPos + 4);
      doc.text(`${formatMontant(devis.total)} FCFA`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
      totalGeneral += devis.total || 0;
      yPos += 10;

      if (devisIndex < devisList.length - 1) {
        checkPageBreak(10);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 10;
      }
    });

    if (yPos + 45 > pageHeight - margin) {
      doc.addPage();
      currentPageNumber++;
      yPos = margin;
    }
    const totalPages = doc.internal.pages.length;
    if (currentPageNumber < totalPages) {
      doc.setPage(totalPages);
      currentPageNumber = totalPages;
      yPos = margin;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GÉNÉRAL', margin + 15, yPos + 4);
    doc.text(`${formatMontant(totalGeneral)} FCFA`, pageWidth - margin - 3, yPos + 4, { align: 'right' });
    yPos += 15;

    const signatureY = pageHeight - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature', pageWidth / 2, signatureY, { align: 'center' });
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 40, signatureY + 5, pageWidth / 2 + 40, signatureY + 5);
    doc.setFontSize(9);
    doc.setTextColor(102, 102, 102);
    doc.text('La comptabilité', pageWidth / 2, signatureY + 12, { align: 'center' });

    const moisFileName = mois.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });
    doc.save(`devis-mensuel-${moisFileName}.pdf`);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF mensuel:', error);
    alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};
