// ============================================================================
// PROGRESS CALCULATION TESTS
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateMilestoneProgress,
  calculateProjectProgress,
  calculateProjectHealth,
  calculateProjectProgressStats,
} from '../domain/progress';
import type { Milestone, Task, Project } from '../domain/types';

describe('Progress Calculations', () => {
  describe('calculateMilestoneProgress', () => {
    it('should return 1 if milestone status is DONE', () => {
      const milestone: Milestone = {
        id: 'm1',
        projectId: 'p1',
        title: 'Test',
        status: 'DONE',
        weight: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const tasks: Task[] = [];

      expect(calculateMilestoneProgress(milestone, tasks)).toBe(1);
    });

    it('should return 0 if no tasks in milestone', () => {
      const milestone: Milestone = {
        id: 'm1',
        projectId: 'p1',
        title: 'Test',
        status: 'TODO',
        weight: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const tasks: Task[] = [];

      expect(calculateMilestoneProgress(milestone, tasks)).toBe(0);
    });

    it('should calculate progress based on task points', () => {
      const milestone: Milestone = {
        id: 'm1',
        projectId: 'p1',
        title: 'Test',
        status: 'IN_PROGRESS',
        weight: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tasks: Task[] = [
        {
          id: 't1',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 1',
          status: 'DONE',
          points: 5,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 2',
          status: 'TODO',
          points: 5,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(calculateMilestoneProgress(milestone, tasks)).toBe(0.5);
    });

    it('should handle zero total points', () => {
      const milestone: Milestone = {
        id: 'm1',
        projectId: 'p1',
        title: 'Test',
        status: 'TODO',
        weight: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tasks: Task[] = [
        {
          id: 't1',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 1',
          status: 'TODO',
          points: 0,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(calculateMilestoneProgress(milestone, tasks)).toBe(0);
    });
  });

  describe('calculateProjectProgress', () => {
    it('should return 0 if no milestones', () => {
      const project: Project = {
        id: 'p1',
        name: 'Test Project',
        description: 'Test',
        status: 'ACTIVE',
        type: 'CODE',
        priority: 'MED',
        tags: [],
        objectives: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(calculateProjectProgress(project, [], [])).toBe(0);
    });

    it('should return 0 if total weight is 0', () => {
      const project: Project = {
        id: 'p1',
        name: 'Test Project',
        description: 'Test',
        status: 'ACTIVE',
        type: 'CODE',
        priority: 'MED',
        tags: [],
        objectives: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const milestones: Milestone[] = [
        {
          id: 'm1',
          projectId: 'p1',
          title: 'Test',
          status: 'TODO',
          weight: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(calculateProjectProgress(project, milestones, [])).toBe(0);
    });

    it('should calculate weighted progress correctly', () => {
      const project: Project = {
        id: 'p1',
        name: 'Test Project',
        description: 'Test',
        status: 'ACTIVE',
        type: 'CODE',
        priority: 'MED',
        tags: [],
        objectives: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const milestones: Milestone[] = [
        {
          id: 'm1',
          projectId: 'p1',
          title: 'Milestone 1',
          status: 'DONE', // 100%
          weight: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'm2',
          projectId: 'p1',
          title: 'Milestone 2',
          status: 'IN_PROGRESS',
          weight: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          projectId: 'p1',
          milestoneId: 'm2',
          title: 'Task 1',
          status: 'DONE',
          points: 5,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          projectId: 'p1',
          milestoneId: 'm2',
          title: 'Task 2',
          status: 'TODO',
          points: 5,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      // m1: 100% * 10 = 10
      // m2: 50% * 30 = 15
      // total: (10 + 15) / 40 = 62.5% => 63% (rounded)

      expect(calculateProjectProgress(project, milestones, tasks)).toBe(63);
    });
  });

  describe('calculateProjectHealth', () => {
    const project: Project = {
      id: 'p1',
      name: 'Test Project',
      description: 'Test',
      status: 'ACTIVE',
      type: 'CODE',
      priority: 'MED',
      tags: [],
      objectives: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it('should return AT_RISK if blocked count > 0', () => {
      expect(calculateProjectHealth(project, 50, 1)).toBe('AT_RISK');
    });

    it('should return LATE if past target date and progress < 100', () => {
      const pastProject = {
        ...project,
        targetDate: '2020-01-01',
      };

      expect(calculateProjectHealth(pastProject, 50, 0)).toBe('LATE');
    });

    it('should return ON_TRACK if past target date but progress = 100', () => {
      const pastProject = {
        ...project,
        targetDate: '2020-01-01',
      };

      expect(calculateProjectHealth(pastProject, 100, 0)).toBe('ON_TRACK');
    });

    it('should return ON_TRACK if no blockers and not late', () => {
      expect(calculateProjectHealth(project, 50, 0)).toBe('ON_TRACK');
    });
  });

  describe('calculateProjectProgressStats', () => {
    it('should return complete stats', () => {
      const project: Project = {
        id: 'p1',
        name: 'Test Project',
        description: 'Test',
        status: 'ACTIVE',
        type: 'CODE',
        priority: 'MED',
        tags: [],
        objectives: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const milestones: Milestone[] = [
        {
          id: 'm1',
          projectId: 'p1',
          title: 'Milestone 1',
          status: 'IN_PROGRESS',
          weight: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const tasks: Task[] = [
        {
          id: 't1',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 1',
          status: 'DONE',
          points: 3,
          order: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't2',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 2',
          status: 'TODO',
          points: 2,
          order: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 't3',
          projectId: 'p1',
          milestoneId: 'm1',
          title: 'Task 3',
          status: 'BLOCKED',
          points: 5,
          order: 3,
          blockedReason: 'Waiting',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const stats = calculateProjectProgressStats(project, milestones, tasks);

      expect(stats.tasksDone).toBe(1);
      expect(stats.tasksTotal).toBe(3);
      expect(stats.pointsDone).toBe(3);
      expect(stats.pointsTotal).toBe(10);
      expect(stats.progressPercent).toBe(30); // 3/10 = 30%
      expect(stats.health).toBe('AT_RISK'); // 1 blocked task
    });
  });
});
