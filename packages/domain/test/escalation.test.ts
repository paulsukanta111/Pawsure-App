// PS-101 default timings, 10.4 overrides, 10.6 severity matrix, 17.1 scenarios.
import { describe, expect, it } from 'vitest';
import { ist, planIncidentNotifications, planLadder, SEVERITY_OF, shouldRun } from '../src';

const at = (h: number, m: number) => ist(2026, 11, 9, h, m);

describe('escalation ladder (PS-101)', () => {
  it('4:00 pm task: owner 4:30, backup look-in 5:00, cover suggestions 5:15', () => {
    const steps = planLadder('t1', 'feeding', at(16, 0));
    expect(steps.map((s) => [s.kind, s.at.toISOString()])).toEqual([
      ['owner_alert', at(16, 30).toISOString()],
      ['backup_look_in', at(17, 0).toISOString()],
      ['suggest_cover', at(17, 15).toISOString()],
    ]);
  });

  it('owner acknowledgement at 4:40 stops steps 2 and 3', () => {
    const [s1, s2, s3] = planLadder('t1', 'feeding', at(16, 0));
    const state = { taskResolved: false, ownerAcknowledgedAt: at(16, 40) };
    expect(shouldRun(s1!, state, at(16, 30))).toBe(true);
    expect(shouldRun(s2!, state, at(17, 0))).toBe(false);
    expect(shouldRun(s3!, state, at(17, 15))).toBe(false);
  });

  it('without acknowledgement every step runs at its time, not before', () => {
    const [, s2] = planLadder('t1', 'feeding', at(16, 0));
    expect(shouldRun(s2!, { taskResolved: false }, at(16, 59))).toBe(false);
    expect(shouldRun(s2!, { taskResolved: false }, at(17, 0))).toBe(true);
  });

  it('late evidence resolving the task stops the ladder', () => {
    const [, s2] = planLadder('t1', 'feeding', at(16, 0));
    expect(shouldRun(s2!, { taskResolved: true }, at(17, 0))).toBe(false);
  });

  it('per-task overrides: medicine alerts at due + 15, walks at due + 45', () => {
    expect(planLadder('m', 'medicine', at(16, 0))[0]!.at).toEqual(at(16, 15));
    expect(planLadder('w', 'walk', at(16, 0))[0]!.at).toEqual(at(16, 45));
  });

  it('a hurt/sick report bypasses the ladder (PS-039)', () => {
    const [s1] = planLadder('t1', 'feeding', at(16, 0));
    expect(shouldRun(s1!, { taskResolved: false, severityReported: true }, at(16, 30))).toBe(false);
  });

  it('job keys are stable for idempotent scheduling', () => {
    expect(planLadder('t1', 'feeding', at(16, 0)).map((s) => s.jobKey)).toEqual(['t1:ladder:1', 't1:ladder:2', 't1:ladder:3']);
  });
});

describe('severity matrix (10.6)', () => {
  it('maps categories', () => {
    expect(SEVERITY_OF.bite).toBe('S1');
    expect(SEVERITY_OF.vomiting).toBe('S2');
    expect(SEVERITY_OF.food_water_out).toBe('S3');
  });

  it('S1, nobody answers: calls repeat 3 times at 5-min intervals; at 15 min the whole care circle is called (17.1)', () => {
    const plan = planIncidentNotifications('i1', 'S1');
    expect(plan[0]).toMatchObject({ offsetMinutes: 0, recipients: ['owner', 'backup'] });
    expect(plan.filter((a) => a.note?.startsWith('repeat call')).map((a) => a.offsetMinutes)).toEqual([5, 10, 15]);
    expect(plan.find((a) => a.recipients === 'all_care_circle')?.offsetMinutes).toBe(15);
  });

  it('S2: owner first, backup after 15 min, phone call at 30 min', () => {
    expect(planIncidentNotifications('i', 'S2').map((a) => [a.offsetMinutes, a.recipients])).toEqual([
      [0, ['owner']], [15, ['backup']], [30, ['owner', 'backup']],
    ]);
  });

  it('S3: owner, backup after 30 min', () => {
    expect(planIncidentNotifications('i', 'S3').map((a) => a.offsetMinutes)).toEqual([0, 30]);
  });
});
