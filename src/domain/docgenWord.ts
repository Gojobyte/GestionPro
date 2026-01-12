// ============================================================================
// WORD DOCUMENT GENERATION - Professional Word Documents with docx
// ============================================================================

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Project, Milestone, Task, ActivityEvent } from './types';
import { calculateProjectProgressStats, calculateMilestonesProgress } from './progress';

export type DocType = 'README' | 'SPEC' | 'ARCHITECTURE' | 'RUNBOOK' | 'CHANGELOG' | 'ADR';

/**
 * Generate README Document
 */
function generateREADME(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[]
): Document {
  const stats = calculateProjectProgressStats(project, milestones, tasks);
  const milestonesProgress = calculateMilestonesProgress(project.id, milestones, tasks);

  const children: Paragraph[] = [
    // Title
    new Paragraph({
      text: project.name,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Description
    new Paragraph({
      text: project.description,
      spacing: { after: 400 },
      alignment: AlignmentType.CENTER,
    }),

    // Project Info
    new Paragraph({
      text: 'Informations du Projet',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Statut: ', bold: true }),
        new TextRun({ text: project.status }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Priorité: ', bold: true }),
        new TextRun({ text: project.priority }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Date de début: ', bold: true }),
        new TextRun({
          text: project.startDate
            ? format(new Date(project.startDate), 'dd MMMM yyyy', { locale: fr })
            : 'Non définie',
        }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Date cible: ', bold: true }),
        new TextRun({
          text: project.targetDate
            ? format(new Date(project.targetDate), 'dd MMMM yyyy', { locale: fr })
            : 'Non définie',
        }),
      ],
      spacing: { after: 400 },
    }),

    // Progress Section
    new Paragraph({
      text: 'Progression',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Progression globale: ', bold: true }),
        new TextRun({
          text: `${stats.progressPercent}%`,
          color: '7c3aed',
          bold: true,
          size: 28,
        }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Tâches: ', bold: true }),
        new TextRun({ text: `${stats.tasksDone}/${stats.tasksTotal} complétées` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Points: ', bold: true }),
        new TextRun({ text: `${stats.pointsDone}/${stats.pointsTotal} complétés` }),
      ],
      spacing: { after: 400 },
    }),

    // Milestones Section
    new Paragraph({
      text: 'Jalons',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  ];

  // Add each milestone
  milestones.forEach((milestone, index) => {
    const progress = milestonesProgress.find((mp) => mp.milestoneId === milestone.id);
    const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id);

    children.push(
      new Paragraph({
        text: `${index + 1}. ${milestone.title}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Progression: ', bold: true }),
          new TextRun({ text: `${progress?.progressPercent || 0}%` }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Poids: ', bold: true }),
          new TextRun({ text: `${milestone.weight}` }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Tâches: ', bold: true }),
          new TextRun({
            text: `${milestoneTasks.filter((t) => t.status === 'DONE').length}/${milestoneTasks.length}`,
          }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Date d\'échéance: ', bold: true }),
          new TextRun({
            text: milestone.dueDate
              ? format(new Date(milestone.dueDate), 'dd MMMM yyyy', { locale: fr })
              : 'Non définie',
          }),
        ],
        spacing: { after: 200 },
      })
    );
  });

  // Tasks by status
  const completedTasks = tasks.filter((t) => t.status === 'DONE');
  const inProgressTasks = tasks.filter((t) => t.status === 'DOING');
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');

  children.push(
    new Paragraph({
      text: 'Résumé des Tâches',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: '✅ Complétées: ', bold: true }),
        new TextRun({ text: `${completedTasks.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: '🔄 En cours: ', bold: true }),
        new TextRun({ text: `${inProgressTasks.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: '📋 À faire: ', bold: true }),
        new TextRun({ text: `${todoTasks.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: '🚨 Bloquées: ', bold: true }),
        new TextRun({ text: `${blockedTasks.length}`, color: 'DC2626' }),
      ],
      spacing: { after: 400 },
    })
  );

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

/**
 * Generate Technical Specification Document
 */
function generateSPEC(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[]
): Document {
  const stats = calculateProjectProgressStats(project, milestones, tasks);

  const children: Paragraph[] = [
    new Paragraph({
      text: `Spécification Technique - ${project.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Vue d\'ensemble',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      text: project.description,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Objectifs',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  ];

  // Add objectives
  if (project.objectives && Array.isArray(project.objectives)) {
    project.objectives.forEach((obj) => {
      children.push(
        new Paragraph({
          text: `• ${obj}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      text: 'Portée du Projet',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Nombre de jalons: ', bold: true }),
        new TextRun({ text: `${milestones.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Nombre de tâches: ', bold: true }),
        new TextRun({ text: `${tasks.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Points totaux: ', bold: true }),
        new TextRun({ text: `${stats.pointsTotal}` }),
      ],
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Décomposition des Tâches',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  // Group tasks by milestone
  milestones.forEach((milestone) => {
    const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id);
    if (milestoneTasks.length === 0) return;

    children.push(
      new Paragraph({
        text: milestone.title,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      })
    );

    milestoneTasks.forEach((task) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `  • ${task.title}`, bold: task.status === 'DONE' }),
            new TextRun({ text: ` (${task.points} pts)` }),
          ],
          spacing: { after: 50 },
        })
      );
    });
  });

  return new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });
}

/**
 * Generate ARCHITECTURE Document
 */
function generateARCHITECTURE(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[]
): Document {
  const children: Paragraph[] = [
    new Paragraph({
      text: `Architecture - ${project.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Vue d\'ensemble du système',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      text: project.description,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Composants principaux',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  ];

  // Add each milestone as a component
  milestones.forEach((milestone, index) => {
    const milestoneTasks = tasks.filter((t) => t.milestoneId === milestone.id);

    children.push(
      new Paragraph({
        text: `${index + 1}. ${milestone.title}`,
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Poids: ', bold: true }),
          new TextRun({ text: `${milestone.weight}` }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Nombre de tâches: ', bold: true }),
          new TextRun({ text: `${milestoneTasks.length}` }),
        ],
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'Responsabilités:',
        spacing: { before: 100, after: 50 },
      })
    );

    // List first 5 tasks as responsibilities
    milestoneTasks.slice(0, 5).forEach((task) => {
      children.push(
        new Paragraph({
          text: `  • ${task.title}`,
          spacing: { after: 50 },
        })
      );
    });

    if (milestoneTasks.length > 5) {
      children.push(
        new Paragraph({
          text: `  ... et ${milestoneTasks.length - 5} autres tâches`,
          spacing: { after: 200 },
        })
      );
    }
  });

  return new Document({
    sections: [{ properties: {}, children }],
  });
}

/**
 * Generate RUNBOOK Document
 */
function generateRUNBOOK(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[]
): Document {
  const inProgressTasks = tasks.filter((t) => t.status === 'DOING');
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');

  const children: Paragraph[] = [
    new Paragraph({
      text: `Runbook - ${project.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Guide opérationnel quotidien',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      text: 'Tâches en cours',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  ];

  if (inProgressTasks.length === 0) {
    children.push(
      new Paragraph({
        text: 'Aucune tâche en cours actuellement.',
        spacing: { after: 400 },
      })
    );
  } else {
    inProgressTasks.forEach((task) => {
      const milestone = milestones.find((m) => m.id === task.milestoneId);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${task.title}`, bold: true }),
            new TextRun({ text: ` (${task.points} pts)` }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          text: `  Jalon: ${milestone?.title || 'GENERAL'}`,
          spacing: { after: 100 },
        })
      );
    });
  }

  children.push(
    new Paragraph({
      text: 'Prochaines tâches',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  todoTasks.slice(0, 10).forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `• ${task.title}` }),
          new TextRun({ text: ` (${task.points} pts)` }),
        ],
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `  Jalon: ${milestone?.title || 'GENERAL'}`,
        spacing: { after: 100 },
      })
    );
  });

  if (blockedTasks.length > 0) {
    children.push(
      new Paragraph({
        text: '🚨 Bloqueurs',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    blockedTasks.forEach((task) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `• ${task.title}`, bold: true, color: 'DC2626' }),
          ],
          spacing: { after: 50 },
        }),
        new Paragraph({
          text: task.blockedReason ? `  Raison: ${task.blockedReason}` : '  Raison non spécifiée',
          spacing: { after: 100 },
        })
      );
    });
  }

  return new Document({
    sections: [{ properties: {}, children }],
  });
}

/**
 * Generate CHANGELOG Document
 */
function generateCHANGELOG(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  activityEvents: ActivityEvent[]
): Document {
  const completedTasks = tasks.filter((t) => t.status === 'DONE');

  const children: Paragraph[] = [
    new Paragraph({
      text: `Changelog - ${project.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Historique des modifications',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Dernière mise à jour: ', bold: true }),
        new TextRun({
          text: format(new Date(project.updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr }),
        }),
      ],
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Tâches complétées',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),
  ];

  completedTasks.forEach((task) => {
    const milestone = milestones.find((m) => m.id === task.milestoneId);
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `✅ ${task.title}`, bold: true }),
        ],
        spacing: { after: 50 },
      }),
      new Paragraph({
        text: `   Jalon: ${milestone?.title || 'GENERAL'} • ${task.points} points • ${format(new Date(task.updatedAt), 'dd/MM/yyyy', { locale: fr })}`,
        spacing: { after: 100 },
      })
    );
  });

  children.push(
    new Paragraph({
      text: 'Activité récente',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    })
  );

  activityEvents.slice(0, 20).forEach((event) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: format(new Date(event.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr }), bold: true }),
          new TextRun({ text: ` - ${event.description || event.type}` }),
        ],
        spacing: { after: 100 },
      })
    );
  });

  return new Document({
    sections: [{ properties: {}, children }],
  });
}

/**
 * Generate ADR Document
 */
function generateADR(
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  _activityEvents: ActivityEvent[]
): Document {
  const stats = calculateProjectProgressStats(project, milestones, tasks);

  const children: Paragraph[] = [
    new Paragraph({
      text: `Architecture Decision Records - ${project.name}`,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'ADR-001: Structure par jalons pondérés',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Date: ', bold: true }),
        new TextRun({ text: format(new Date(project.createdAt), 'dd MMMM yyyy', { locale: fr }) }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Statut: ', bold: true }),
        new TextRun({ text: 'Accepté', color: '16A34A' }),
      ],
      spacing: { after: 200 },
    }),

    new Paragraph({
      text: 'Contexte:',
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: 'Besoin d\'une méthode robuste pour suivre la progression du projet à travers plusieurs flux de travail avec différents niveaux d\'importance.',
      spacing: { after: 200 },
    }),

    new Paragraph({
      text: 'Décision:',
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: 'Implémenter un système de jalons pondérés où chaque jalon a un poids (≥ 1) et la progression globale = somme pondérée de la progression des jalons.',
      spacing: { after: 200 },
    }),

    new Paragraph({
      text: 'Conséquences:',
      spacing: { after: 100 },
    }),

    new Paragraph({
      text: '✅ Visibilité claire de la progression',
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: '✅ Organisation flexible du travail',
      spacing: { after: 50 },
    }),

    new Paragraph({
      text: '⚠️ Nécessite une planification initiale des jalons',
      spacing: { after: 400 },
    }),

    new Paragraph({
      text: 'Métriques du projet',
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 400, after: 200 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Jalons totaux: ', bold: true }),
        new TextRun({ text: `${milestones.length}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Poids total: ', bold: true }),
        new TextRun({ text: `${milestones.reduce((sum, m) => sum + m.weight, 0)}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Tâches totales: ', bold: true }),
        new TextRun({ text: `${stats.tasksTotal}` }),
      ],
      spacing: { after: 100 },
    }),

    new Paragraph({
      children: [
        new TextRun({ text: 'Points totaux: ', bold: true }),
        new TextRun({ text: `${stats.pointsTotal}` }),
      ],
      spacing: { after: 100 },
    }),
  ];

  return new Document({
    sections: [{ properties: {}, children }],
  });
}

/**
 * Generate and download Word document
 */
export async function generateWordDocument(
  docType: DocType,
  project: Project,
  milestones: Milestone[],
  tasks: Task[],
  activityEvents: ActivityEvent[]
): Promise<void> {
  let doc: Document;

  switch (docType) {
    case 'README':
      doc = generateREADME(project, milestones, tasks, activityEvents);
      break;
    case 'SPEC':
      doc = generateSPEC(project, milestones, tasks, activityEvents);
      break;
    case 'ARCHITECTURE':
      doc = generateARCHITECTURE(project, milestones, tasks, activityEvents);
      break;
    case 'RUNBOOK':
      doc = generateRUNBOOK(project, milestones, tasks, activityEvents);
      break;
    case 'CHANGELOG':
      doc = generateCHANGELOG(project, milestones, tasks, activityEvents);
      break;
    case 'ADR':
      doc = generateADR(project, milestones, tasks, activityEvents);
      break;
    default:
      doc = generateREADME(project, milestones, tasks, activityEvents);
  }

  // Generate filename
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const timestamp = format(new Date(), 'yyyy-MM-dd');
  const filename = `${safeName}-${docType}-${timestamp}.docx`;

  // Convert to blob and download
  const { Packer } = await import('docx');
  const blob = await Packer.toBlob(doc);
  saveAs(blob, filename);
}

/**
 * Get document filename
 */
export function getWordDocumentFilename(docType: DocType, projectName: string): string {
  const safeName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const timestamp = format(new Date(), 'yyyy-MM-dd');
  return `${safeName}-${docType}-${timestamp}.docx`;
}
