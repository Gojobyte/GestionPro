# Architecture - Dev Organizer

## Vue d'ensemble

Dev Organizer est une Progressive Web App (PWA) **offline-first** construite avec React + TypeScript + Vite. L'application fonctionne entièrement côté client sans backend.

## Principes de Conception

### 1. Offline-First
- **Toutes les données** sont stockées dans IndexedDB (via Dexie)
- **Service Worker** cache les assets de l'application
- **Pas de dépendance réseau** pour les fonctionnalités principales
- **PWA installable** sur desktop et mobile (Chrome)

### 2. Séparation des Responsabilités

```
┌─────────────────────────────────────────────┐
│           UI Layer (React)                  │
│     Pages → Components → Hooks              │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│        Business Logic Layer                 │
│   Domain (types.ts + progress.ts)           │
│   Services (FileStore, DocGen, Reports)     │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│         Data Access Layer                   │
│     Repositories (CRUD operations)          │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│       Storage Layer (Dexie)                 │
│         IndexedDB Tables                    │
└─────────────────────────────────────────────┘
```

### 3. Type Safety
- **TypeScript strict mode** activé
- **Pas de `any`** dans le code
- **Typage complet** des entités du domaine

## Structure des Dossiers

```
src/
├── components/        # Composants React réutilisables
│   ├── layout/       # Header, Footer, Layout
│   ├── projects/     # Composants spécifiques projets
│   ├── tasks/        # Composants tâches/jalons
│   └── common/       # Boutons, modals, forms...
│
├── pages/            # Pages complètes (routes)
│   ├── DashboardPage.tsx
│   ├── ProjectsListPage.tsx
│   ├── ProjectWizardPage.tsx
│   └── ProjectDetailPage.tsx
│
├── domain/           # Logique métier pure (pas de React)
│   ├── types.ts      # Types TypeScript (13 entités)
│   └── progress.ts   # Calculs de progression
│
├── storage/          # Couche d'accès aux données
│   ├── db.ts         # Config Dexie (13 tables)
│   └── repos/        # Repositories CRUD
│       ├── projectRepo.ts
│       ├── milestoneRepo.ts
│       └── taskRepo.ts
│
├── services/         # Services métier
│   ├── fileStore/    # Gestion fichiers (Embedded + Workspace)
│   ├── docgen/       # Génération documentation
│   ├── reports/      # Rapports hebdomadaires
│   ├── search/       # Recherche offline
│   └── backup/       # Export/Import ZIP
│
├── routes/           # Configuration React Router
├── hooks/            # Custom React hooks
├── utils/            # Utilitaires (generateId, dates...)
└── __tests__/        # Tests unitaires (Vitest)
```

## Couches Détaillées

### 1. UI Layer (React)

**Responsabilité** : Affichage et interactions utilisateur.

**Pages principales** :
- `DashboardPage` : Vue globale tous projets
- `ProjectsListPage` : Liste + filtres
- `ProjectWizardPage` : Wizard création (2 étapes)
- `ProjectDetailPage` : Dashboard projet (indicateurs, blocages)
- `MilestonesTasksPage` : Vue jalons/tâches + Kanban
- `CalendarPage` : Timeline + calendrier mensuel
- `DocsReportsPage` : Génération docs + rapports

**Composants réutilisables** :
- Buttons, Cards, Modals
- ProgressBar, Badge, StatusTag
- Form inputs avec validation
- DatePicker, SearchBar

### 2. Business Logic Layer

#### Domain (src/domain/)

**types.ts** : Définit les 13 entités du domaine
- Project, Milestone, Task
- Note, Snippet, DocumentMeta
- ActivityEvent, WeeklyReport, ProgressSnapshot
- Settings (singleton)

**progress.ts** : Logique de calcul de progression
- `calculateMilestoneProgress()` : Progression d'un jalon
- `calculateProjectProgress()` : Progression globale projet (pondérée)
- `calculateProjectHealth()` : Santé projet (ON_TRACK / AT_RISK / LATE)
- `calculateProjectProgressStats()` : Stats complètes
- `calculateMilestonesProgress()` : Liste des progressions jalons

#### Services (src/services/)

**FileStore** :
- Interface unifiée pour stockage fichiers
- 2 implémentations :
  - `EmbeddedFileStore` : Blob dans IndexedDB (< 20MB)
  - `WorkspaceFileStore` : File System Access API (Chrome)

**DocGen** :
- Templates Mustache
- Génération README, SPEC, ARCHITECTURE, RUNBOOK, CHANGELOG
- ADR (Architecture Decision Records)

**Reports** :
- `generateWeeklyReport()` : Rapport hebdo Markdown
- Utilise ActivityEvent + ProgressSnapshot
- Delta de progression calculé

**Search** :
- Recherche offline full-text
- Filtres : type, projet, tags, dates
- Option MiniSearch pour performances

**Backup** :
- `exportZip()` : Crée ZIP avec index.json + docs + embedded files
- `importZip()` : Restaure DB depuis ZIP + validation schéma

### 3. Data Access Layer (Repositories)

**Pattern Repository** : Encapsule l'accès aux données.

Exemple : `projectRepo.ts`
```typescript
export const projectRepo = {
  async getAll(): Promise<Project[]>
  async getById(id: string): Promise<Project | undefined>
  async getActive(): Promise<Project[]>
  async create(project: Project): Promise<string>
  async update(id: string, updates: Partial<Project>): Promise<void>
  async delete(id: string): Promise<void>
  async archive(id: string): Promise<void>
}
```

**Avantages** :
- Abstraction de la DB (facile de changer Dexie plus tard)
- Tests unitaires simples (mock le repo)
- API claire et cohérente

### 4. Storage Layer (Dexie)

**13 Tables IndexedDB** :
1. `projects` : Projets
2. `milestones` : Jalons
3. `tasks` : Tâches
4. `projectUpdates` : Journal de projet
5. `decisions` : ADR light
6. `notes` : Notes Markdown
7. `snippets` : Code snippets
8. `documentMetas` : Métadonnées fichiers
9. `embeddedFiles` : Fichiers embarqués (Blob)
10. `settings` : Paramètres (singleton)
11. `activityEvents` : Événements d'activité
12. `weeklyReports` : Rapports hebdo
13. `progressSnapshots` : Snapshots de progression

**Index** :
- `projectId` sur toutes les tables liées
- `status`, `dueDate`, `createdAt` pour filtres/tri
- Compound indexes : `[projectId, status]`

## Flux de Données

### Création d'un Projet

```
1. User → ProjectWizardPage (Step 1)
   ├─ Remplit name, description, objectives, priority
   └─ Click "Next"

2. User → ProjectWizardPage (Step 2)
   ├─ Crée 3-6 milestones (titre, poids, dueDate)
   ├─ Crée 5+ tasks (titre, milestoneId, points)
   └─ Click "Create Project"

3. ProjectWizardPage → projectRepo.create()
   └─ Dexie.projects.add()

4. ProjectWizardPage → milestoneRepo.create() (x N)
   └─ Dexie.milestones.add() (x N)

5. ProjectWizardPage → taskRepo.create() (x M)
   └─ Dexie.tasks.add() (x M)

6. Navigate → /projects/{projectId}
   └─ ProjectDetailPage loads
```

### Affichage Dashboard Projet

```
1. ProjectDetailPage → useEffect()
   └─ loadProject()

2. loadProject()
   ├─ projectRepo.getById(projectId)
   ├─ milestoneRepo.getByProject(projectId)
   ├─ taskRepo.getByProject(projectId)
   └─ activityEventRepo.getByProject(projectId, 10)

3. Calculate Progress
   ├─ calculateProjectProgressStats(project, milestones, tasks)
   │   ├─ calculateMilestoneProgress() pour chaque jalon
   │   ├─ calculateProjectProgress() (pondéré)
   │   └─ calculateProjectHealth()
   └─ calculateMilestonesProgress()

4. Render UI
   ├─ Progress cards (%, tasks done, next milestone)
   ├─ Blockers alert (BLOCKED tasks/milestones)
   ├─ Milestones list (avec barres progression)
   ├─ Top 5 tasks to do (par dueDate)
   └─ Recent activity
```

## Gestion de l'État

### Local State (useState)

Utilisé pour :
- État UI éphémère (modals ouverts, inputs formulaires)
- Données chargées depuis DB (projets, tasks)

Exemple :
```typescript
const [project, setProject] = useState<Project | null>(null);
const [loading, setLoading] = useState(true);
```

### Pas de State Management Global (pour MVP)

**Zustand** est installé mais pas encore utilisé.

Raisons :
- Les pages sont indépendantes
- Chaque page charge ses propres données
- IndexedDB est notre "single source of truth"

**Quand utiliser Zustand plus tard** :
- User settings (theme, langue)
- App-wide notifications
- Selected project ID (pour navigation rapide)

## Progressive Web App (PWA)

### Service Worker

**vite-plugin-pwa** configure automatiquement :
- **Precaching** : index.html, JS, CSS, assets
- **Runtime Caching** : fonts Google (CacheFirst strategy)
- **Offline fallback** : Page visible même sans réseau

### Manifest

```json
{
  "name": "Dev Organizer",
  "short_name": "DevOrg",
  "display": "standalone",
  "theme_color": "#2563eb",
  "icons": [...]
}
```

### Installation

Chrome Desktop/Mobile :
1. Ouvrir l'app
2. Icône "Installer" dans la barre d'adresse
3. L'app s'ouvre comme une app native

## Stratégie Offline

### Données

- **Toutes les données** : IndexedDB (Dexie)
- **Capacité** : Plusieurs GB (quota navigateur)
- **Synchronisation** : Aucune (MVP = local only)

### Fichiers

**Mode Embedded** (< 20MB) :
- Stockés en Blob dans `embeddedFiles` table
- Inclus dans export ZIP

**Mode Workspace** (> 20MB ou choix utilisateur) :
- Stockés dans dossier local (File System Access API)
- Métadonnées dans `documentMetas`
- Gestion permissions (request/query)

### Cache des Assets

- Service Worker cache automatiquement :
  - HTML, JS, CSS
  - Images, SVG, fonts
- Stratégie : NetworkFirst avec fallback Cache

## Extensibilité Future

### Backend Sync (Phase 2)

L'architecture est préparée pour ajouter un backend :

1. **Ajouter un SyncService**
   ```typescript
   interface SyncService {
     push(): Promise<void>;
     pull(): Promise<void>;
     resolve(conflicts): Promise<void>;
   }
   ```

2. **Ajouter champs sync aux entités**
   ```typescript
   interface Project {
     // ...existing fields
     syncedAt?: string;
     syncStatus: 'PENDING' | 'SYNCED' | 'CONFLICT';
   }
   ```

3. **Garder Repositories inchangés**
   - Le SyncService lit/écrit via repos
   - UI ne change pas

### Mobile Native (Phase 3)

Avec Capacitor :
1. Remplacer Dexie → SQLite
2. Remplacer File System Access API → Filesystem plugin
3. Garder toute la logique métier (domain/)
4. Adapter les repos (mêmes interfaces)

## Performance

### Optimisations Actuelles

- **Lazy Loading** : Routes React Router (code splitting)
- **Indexes Dexie** : Requêtes rapides (projectId, status)
- **Memoization** : `useMemo` pour calculs lourds (progress)

### À Optimiser Plus Tard

- **Pagination** : Liste projets/tâches (si > 1000)
- **Virtual Scrolling** : Longues listes
- **Web Workers** : Calculs lourds (export ZIP, recherche)
- **Service Worker** : Cache stratégies avancées

## Sécurité

### MVP (Local Only)

- **Pas de chiffrement** des données IndexedDB
- **Pas d'authentification** (app locale)
- **Sanitization** : Markdown (XSS prevention) via lib DOMPurify (à ajouter)

### Phase 2 (Backend)

- **Chiffrement E2E** : Données sensibles
- **Auth** : OAuth2 / JWT
- **HTTPS** obligatoire
- **CORS** configuré

## Tests

### Stratégie Actuelle

- **Unit tests** : Vitest pour logique métier (domain/progress.ts)
- **12 tests** : Calculs de progression validés

### À Ajouter

- **Component tests** : React Testing Library
- **Integration tests** : User flows (créer projet → ajouter tâche)
- **E2E tests** : Playwright (workflow complet)

## Déploiement

### Développement

```bash
pnpm dev  # http://localhost:5173
```

### Production

```bash
pnpm build     # Build dans dist/
pnpm preview   # Preview du build
```

### Hébergement

Options statiques (pas de serveur) :
- **Vercel** (recommandé) : `vercel deploy`
- **Netlify** : `netlify deploy`
- **GitHub Pages** : `npm run build && gh-pages -d dist`
- **Cloudflare Pages**
- **Self-hosted** : Nginx/Apache servant dist/

## Conclusion

Architecture **offline-first, type-safe, testable et extensible**.

Prochaines étapes :
- ÉTAPE 2 : Finir UI tâches/jalons
- ÉTAPE 3 : FileStore (Embedded + Workspace)
- ÉTAPE 4 : Notes + Snippets
- ÉTAPE 5 : Calendrier + Rapports
- ÉTAPE 6 : DocGen + Backup

Voir [PROGRESS.md](../PROGRESS.md) pour l'avancement détaillé.
