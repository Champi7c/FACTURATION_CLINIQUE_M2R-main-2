# Prompt complet : Module d’impression des devis

Ce document décrit la fonctionnalité d’**impression des devis** (impression écran + export PDF) telle qu’implémentée dans le projet de facturation clinique, afin de la reproduire ou l’adapter dans un autre projet.

---

## 1. Objectif général

Mettre en place un module qui permet :
- **Imprimer** un devis (ou une facture mensuelle) via la fenêtre d’impression du navigateur (`window.print()`).
- **Exporter en PDF** un devis individuel ou une facture mensuelle (plusieurs devis agrégés), avec une mise en page professionnelle et un rendu identique à l’écran.

Les deux modes doivent coexister sur les mêmes écrans (boutons « Imprimer » et « PDF »).

---

## 2. Périmètre fonctionnel

### 2.1 Impression / PDF d’un devis individuel

- **Page** : détail d’un devis (vue lecture seule après création ou consultation).
- **Contenu à imprimer / exporter** :
  - **En-tête** : logo de l’établissement, nom de la structure, téléphone, email.
  - **Bloc facture** : numéro de facture (ex. `FACTURE N° 2025-00001`), date de création.
  - **Bloc patient** : nom complet, souscripteur (si présent), matricule, type de prise en charge (IPM ou Assurance avec nom de l’entité), date.
  - **Tableau des prestations** :
    - Colonnes : # (numéro de ligne), Catégorie, Prix (FCFA).
    - Lignes groupées par **catégorie** (Analyses, Radiographie, Hospitalisation, Maternité, Consultations, Médicament, etc.) avec séparateurs visuels.
    - Pour chaque ligne : nom de la prestation (avec quantité si > 1, ex. `Nom x2`), prix ligne = prix unitaire × quantité.
  - **Total** en bas du tableau.
  - **Si taux de couverture** (part patient) : afficher Part patients (%), Montant à payer, Montant couvert.
  - **Signature** : ligne de signature + libellé « La comptabilité ».

- **Boutons (masqués à l’impression)** : Imprimer, PDF, Modifier, Retour.

### 2.2 Impression / PDF de la facture mensuelle

- **Page** : résultat de la génération d’une facture mensuelle (filtre : mois + type IPM/Assurance + entité).
- **Contenu** :
  - Même en-tête (logo, nom structure, coordonnées).
  - Titre : « FACTURE MENSUELLE - [Nom IPM ou Assurance] », numéro de facture (si disponible), période (date début – date fin), type (IPM/ASSURANCE), nombre de devis.
  - **Tableau récapitulatif** : PARTICIPANT (souscripteur), MATRICULE, PATIENTS (nom complet), MONTANT (montant couvert par entité, en CFA).
  - **Total général** (somme des montants couverts).
  - **Signature** : idem devis individuel.

- **Boutons (masqués à l’impression)** : Imprimer, PDF, Nouvelle recherche.

---

## 3. Comportement technique

### 3.1 Impression navigateur (window.print)

- Au clic sur « Imprimer », appeler `window.print()`.
- La zone imprimable = le contenu de la carte du devis (ou de la facture mensuelle), **sans** les en-têtes de page, barre de navigation, sidebar, boutons d’action.
- Réalisation : ajouter la classe CSS **`no-print`** sur tout élément à masquer à l’impression (barre d’outils, boutons, navigation).

**Règles CSS à prévoir :**

```css
@media print {
  .no-print {
    display: none !important;
  }
  /* Optionnel : sidebar, boutons globaux */
  .sidebar, .btn, .no-print {
    display: none !important;
  }
  .main-content {
    margin-left: 0;
  }
  /* Forcer les montants en noir pour une bonne lisibilité imprimée */
  .devis-table .text-end,
  .table-total th {
    color: #000 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
```

- Les tableaux et totaux doivent rester lisibles (noir, pas de couleurs qui disparaissent à l’impression).

### 3.2 Export PDF (côté front)

- **Bibliothèque recommandée** : **jsPDF** (génération PDF en JavaScript côté client).
- **Optionnel** : `html2canvas` si l’on souhaite capturer du HTML (non utilisé dans la référence actuelle pour les devis ; le PDF est construit manuellement avec jsPDF pour un contrôle précis).

**Fichier dédié** (ex. `pdfUtils.js`) avec au moins deux fonctions :

1. **`generatePDFDevis(devis, patient, analyses, lignes, ipms, assurances)`**
   - Génère un PDF A4 portrait pour **un** devis.
   - Paramètres : objet devis, objet patient, liste des analyses (pour noms/catégories), lignes du devis, listes IPM et assurances (pour afficher le nom de l’entité).
   - Mise en page : marges (ex. 15 mm), logo en haut à gauche, infos structure à droite du logo, numéro et date en haut à droite.
   - Ensuite : bloc patient, tableau des lignes groupées par catégorie, total, éventuellement part patient / montant à payer / montant couvert, signature en bas.
   - Gestion des **sauts de page** : si le contenu dépasse la hauteur utile, ajouter une nouvelle page et reprendre (fonction du type `checkPageBreak(requiredSpace)`).
   - Montants : formatés sans séparateur de milliers dans le PDF (pour éviter des caractères indésirables) ; libellé « FCFA » ou « CFA » à côté du total.
   - Nom du fichier : `devis-{numero}.pdf` (ex. `devis-2025-00001.pdf`).
   - À la fin : `doc.save(nomFichier)` pour déclencher le téléchargement.

2. **`generatePDFDevisMensuel(devisList, entite, mois, typePriseEnCharge, patients, analyses, ipms, assurances, numeroFacture)`**
   - Génère un PDF A4 pour la **facture mensuelle** : en-tête commun puis pour chaque devis un bloc (titre devis + patient + tableau des lignes par catégorie + sous-total), puis une seule fois en fin de document : total général et signature.
   - Sauts de page entre devis si nécessaire ; total général et signature reportés sur la **dernière page** si besoin.
   - Nom du fichier : `devis-mensuel-{MM-YYYY}.pdf`.

**Détails de mise en page PDF (recommandations)** :

- Police : Helvetica (intégrée à jsPDF).
- Tailles : titre structure 14, sous-titres 11, tableau 9–10.
- Couleurs : bleu nuit pour titres (#1e3a5f), en-tête de tableau en bleu (#667eea), fond gris clair pour les lignes de catégorie (#f8f9fa), vert pour « Montant à payer » (#d4edda / #155724).
- Logo : chargé via `new Image()` avec `logoPath` (ex. `/logo.jpg`) ; en cas d’erreur de chargement, continuer sans logo.
- Catégories : ordre fixe (analyses, radiographie, hospitalisation, maternite, consultations, medicament, non-categorise) ; libellés affichés (Analyses, Radiographie, etc.).

### 3.3 Données nécessaires

- **Devis** : `id`, `numero`, `patientId`, `dateCreation`, `lignes` (tableau de { `analyseId`, `nom`, `categorie`, `prix`, `quantite` }), `total`, `souscripteur`, `tauxCouverture`.
- **Patient** : `nomComplet`, `matricule`, `typePriseEnCharge`, `ipmId`, `assuranceId`.
- **Lignes** : préférer `ligne.nom` et `ligne.categorie` quand présents (snapshot au moment de la création du devis), sinon dériver depuis l’analyse.
- **IPM / Assurances** : listes pour afficher le nom de l’entité (IPM ou Assurance) à côté du type de prise en charge.

### 3.4 Numéro de devis

- Utiliser une fonction utilitaire du type **`getDevisNumero(devis)`** :
  - Si `devis.numero` existe et contient déjà `-` → format `YYYY-NNNNN` → retourner tel quel.
  - Sinon, si `devis.numero` est un nombre, formater en `{année}-{num sur 5 chiffres}`.
  - Sinon, fallback à partir de `devis.id` et année (ex. `{année}-{6 derniers caractères de l’id}`).
- Ce numéro est utilisé dans l’en-tête (« FACTURE N° … ») et dans le nom du fichier PDF.

---

## 4. Structure des composants (React)

- **Page détail devis** (ex. `DevisDetail.js`) :
  - Récupère le devis et le patient (contexte ou API).
  - Affiche la carte du devis (en-tête, patient, tableau, total, part patient si présent, signature).
  - Barre d’actions avec `className="no-print"` : boutons Imprimer (`onClick={() => window.print()}`), PDF (`onClick` appelant `generatePDFDevis(...)`), Modifier, Retour.

- **Page facture mensuelle** (ex. `DevisMensuel.js`) :
  - Formulaire de critères (mois, type, IPM/Assurance) puis affichage du résultat (tableau PARTICIPANT / MATRICULE / PATIENTS / MONTANT + total général + signature).
  - Barre d’actions en `no-print` : Imprimer (`window.print()`), PDF (`generatePDFDevisMensuel(...)`), Nouvelle recherche.

- **Fichier partagé** : `utils/pdfUtils.js` (ou équivalent) exporte `generatePDFDevis` et `generatePDFDevisMensuel`.

- **Styles** : feuilles dédiées (ex. `DevisDetail.css`, `DevisMensuel.css`) avec les règles `@media print` et `.no-print` ; éventuellement règles globales d’impression dans le layout (sidebar/boutons masqués).

---

## 5. Points d’attention pour un autre projet

- **Logo** : chemin configurable (ex. constante `logoPath` ou variable d’environnement) ; gérer le cas file vs http pour l’affichage (ex. `window.location.protocol === 'file:' ? './logo.jpg' : '/logo.jpg'`).
- **Nom de la structure, téléphone, email** : à externaliser (config, constantes ou base) pour ne pas les garder en dur.
- **Devise** : ici FCFA/CFA ; adapter le libellé si autre devise.
- **Catégories** : la liste et l’ordre sont métier ; les garder dans un objet (ex. `categoryNames`) partagé entre l’affichage et le PDF.
- **Facture mensuelle** : si un numéro de facture est fourni par le backend (ex. API `genererNumero`), l’afficher dans l’en-tête et le passer à `generatePDFDevisMensuel`.
- **Montant facture mensuelle** : dans la référence, la colonne MONTANT = montant couvert par l’entité (total × (1 - tauxCouverture/100)) ; le total général est la somme de ces montants. À adapter si la règle métier change.

---

## 6. Résumé des livrables attendus

Pour reproduire le module d’impression des devis dans un autre projet :

1. **UI**  
   - Page détail devis et page facture mensuelle avec boutons « Imprimer » et « PDF », et zone imprimable claire (carte contenu sans boutons).

2. **CSS**  
   - Classe `no-print` sur les éléments à masquer à l’impression.  
   - `@media print` pour masquer sidebar/boutons et forcer les couleurs des montants (noir).

3. **PDF**  
   - Module `pdfUtils` avec `generatePDFDevis` et `generatePDFDevisMensuel` (jsPDF), mise en page A4, logo, tableaux par catégorie, totaux, part patient si présent, signature, noms de fichiers cohérents.

4. **Données**  
   - Utiliser `getDevisNumero(devis)` pour l’affichage et le nom du fichier PDF.  
   - Passer devis, patient, lignes, analyses, ipms, assurances (et pour le mensuel : liste devis, entité, mois, type, numéro facture) aux fonctions PDF.

5. **Config**  
   - Logo, nom de la structure, coordonnées, devise et éventuellement liste de catégories externalisables.

En suivant ce prompt, un développeur ou une IA peut réimplémenter la partie impression des devis (écran + PDF) dans un autre projet en restant aligné avec le comportement et la structure du projet de facturation clinique.
