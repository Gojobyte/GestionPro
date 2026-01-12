# Quick Start Guide - Dev Organizer

**Démarrage en 5 minutes** ⚡

---

## 1. Prérequis

- Node.js 18+ installé
- pnpm installé (`npm install -g pnpm`)

---

## 2. Installation

```bash
cd /home/adoum/dev-organizer

# Installer les dépendances (déjà fait)
pnpm install

# Lancer le serveur de dev
pnpm dev
```

**Serveur démarré sur** : http://localhost:5173

---

## 3. Premier Projet (2 minutes)

### A. Naviguer vers Projects

1. Ouvrir http://localhost:5173
2. Cliquer sur **"Projects"** dans la nav
3. Cliquer sur **"+ New Project"**

### B. Step 1 : Infos Projet

Remplir :
- **Project Name** : "Mon Premier Projet"
- **Description** : "Test de l'app Dev Organizer"
- **Objectives** :
  - "Comprendre l'interface"
  - "Créer des jalons"
  - "Ajouter des tâches"
- **Priority** : Medium
- **Start Date** : Aujourd'hui
- **Target Date** : Dans 1 mois

Cliquer **"Next: Milestones & Tasks"**

### C. Step 2 : Jalons & Tâches

**Jalons** (3-6 recommandés) :
1. GENERAL (pré-rempli) - Weight: 10
2. Setup - Weight: 20 - Due: dans 1 semaine
3. Development - Weight: 40 - Due: dans 3 semaines
4. Testing - Weight: 30 - Due: dans 4 semaines

**Tâches** (min 5) :
1. "Comprendre l'app" - Milestone: GENERAL - Points: 2
2. "Installer dépendances" - Milestone: Setup - Points: 3
3. "Configurer environnement" - Milestone: Setup - Points: 5
4. "Développer feature A" - Milestone: Development - Points: 8
5. "Développer feature B" - Milestone: Development - Points: 8
6. "Tests unitaires" - Milestone: Testing - Points: 5
7. "Tests intégration" - Milestone: Testing - Points: 5

Cliquer **"Create Project"**

### D. Voir le Dashboard

Vous êtes redirigé vers le **Project Dashboard** !

Vous voyez :
- ✅ Progression globale : 0%
- ✅ Tâches : 0/7
- ✅ Prochain jalon : Setup
- ✅ Liste des 4 jalons avec barres de progression
- ✅ Top 5 tâches à faire

---

## 4. Explorer l'Interface

### Navigation Principale

- **Dashboard** : Vue globale (bientôt implémenté)
- **Projects** : Liste de tous vos projets
- **Documents** : Bibliothèque de documents (ÉTAPE 3)

### Pages Projet

Dans un projet, vous avez accès à :
- **Project Dashboard** : Vue d'ensemble avec indicateurs
- **View Tasks** : Liste/Kanban des tâches (en cours)
- **Calendar** : Timeline + calendrier mensuel (ÉTAPE 5)
- **Docs & Reports** : Documentation + rapports (ÉTAPE 6)

---

## 5. Fonctionnalités Actuelles

### ✅ Ce qui Fonctionne

- **Créer un projet** (Wizard 2 étapes)
- **Voir liste projets** (avec filtres ALL/ACTIVE/ARCHIVED)
- **Archive/Unarchive** projets
- **Dashboard projet** avec :
  - Indicateurs visuels (%, tâches, jalons)
  - Alerte blocages
  - Liste jalons avec progression
  - Top 5 tâches à faire
- **Calculs automatiques** :
  - Progression pondérée par jalons
  - Santé projet (ON_TRACK/AT_RISK/LATE)

### 🚧 En Cours

- Vue Tâches : Kanban (TODO | DOING | DONE | BLOCKED)
- Dashboard Global : Vue tous projets actifs

### 📋 À Venir

- ÉTAPE 3 : Documents (import, stockage)
- ÉTAPE 4 : Notes + Snippets
- ÉTAPE 5 : Calendrier + Rapports hebdo
- ÉTAPE 6 : DocGen + Backup ZIP

---

## 6. Tests

### Lancer les Tests

```bash
# Mode watch
pnpm test

# Une fois
pnpm test -- --run

# Interface UI
pnpm test:ui
```

**Résultat** : 12/12 tests passent ✅

---

## 7. Build Production

```bash
# Build
pnpm build

# Preview du build
pnpm preview
```

Génère `dist/` avec assets optimisés.

---

## 8. Données de Test

### Créer Plusieurs Projets

Pour tester les filtres et la liste, créez 2-3 projets :

1. **Projet A** : Priority HIGH, quelques tâches
2. **Projet B** : Priority LOW, nombreux jalons
3. **Projet C** : ARCHIVED (créer puis archiver)

### Tester les Calculs

1. Créer un projet avec :
   - 2 jalons : weight 30 et weight 70
   - 4 tâches dans chaque jalon (points 1-5)
2. Observer : progression = 0% (aucune tâche DONE)
3. Marquer des tâches DONE (via DB console pour l'instant)
4. Recharger : progression augmente selon poids jalons

---

## 9. Déboguer

### Console Browser

Ouvrir DevTools (F12) :
- **Console** : Voir logs
- **Application > Storage > IndexedDB** : Voir données
  - 13 tables : projects, milestones, tasks, etc.
- **Application > Service Workers** : Voir PWA

### Effacer Données

Si besoin de reset complet :
```javascript
// Dans la console browser
indexedDB.deleteDatabase('DevOrganizerDB')
location.reload()
```

---

## 10. Commandes Utiles

```bash
# Développement
pnpm dev          # Serveur dev (HMR)
pnpm build        # Build production
pnpm preview      # Preview build

# Tests
pnpm test         # Tests (watch mode)
pnpm test:ui      # Tests avec UI
pnpm test:coverage # Tests + coverage

# Code Quality
pnpm lint         # Linter ESLint
```

---

## 11. Structure Fichiers Importants

```
dev-organizer/
├── src/
│   ├── pages/                    # Pages React
│   │   ├── ProjectWizardPage.tsx    # Wizard création ⭐
│   │   ├── ProjectsListPage.tsx     # Liste projets ⭐
│   │   └── ProjectDetailPage.tsx    # Dashboard projet ⭐
│   │
│   ├── domain/                   # Logique métier
│   │   ├── types.ts                 # 13 entités ⭐
│   │   └── progress.ts              # Calculs progression ⭐
│   │
│   ├── storage/                  # Persistance
│   │   ├── db.ts                    # Config Dexie
│   │   └── repos/                   # CRUD repos ⭐
│   │
│   └── __tests__/                # Tests
│       └── progress.test.ts         # 12 tests ⭐
│
├── README.md                     # Documentation ⭐
├── PROGRESS.md                   # Avancement détaillé
├── SUMMARY.md                    # Résumé implémentation
└── QUICKSTART.md                 # Ce fichier
```

---

## 12. Prochaines Étapes

Après avoir exploré l'app :

1. **Lire la doc** :
   - [README.md](README.md) : Vue d'ensemble
   - [PROGRESS.md](PROGRESS.md) : Avancement détaillé
   - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) : Architecture

2. **Contribuer** :
   - Finir ÉTAPE 2 : Kanban + Dashboard global
   - ÉTAPE 3 : FileStore (Documents)
   - Ajouter tests
   - Améliorer UI

3. **Déployer** :
   - Vercel : `vercel deploy`
   - Netlify : `netlify deploy --prod`
   - GitHub Pages : `gh-pages -d dist`

---

## 🎉 C'est Parti !

Vous êtes prêt à utiliser **Dev Organizer** !

**Support** :
- Issues : Voir repo GitHub
- Docs : Dossier `docs/`
- Questions : Voir [README.md](README.md)

---

**Bon développement !** 🚀
