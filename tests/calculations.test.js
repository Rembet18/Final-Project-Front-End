import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAttendanceRate,
  calculateCgpa,
  isExamEligible,
  normalizeGrades
} from '../src/utils/calculations.js';
import { getEmailApiBaseUrl } from '../src/services/email.js';

test('calculateAttendanceRate handles valid totals and an empty semester', () => {
  assert.equal(calculateAttendanceRate(19, 20), 95);
  assert.equal(calculateAttendanceRate(0, 0), 0);
});

test('isExamEligible includes the minimum attendance threshold', () => {
  assert.equal(isExamEligible(75), true);
  assert.equal(isExamEligible(74.9), false);
  assert.equal(isExamEligible(80, 85), false);
});

test('calculateCgpa weights each semester by its credits', () => {
  assert.equal(calculateCgpa([{ gpa: 4, credits: 3 }, { gpa: 3, credits: 1 }]), 3.75);
  assert.equal(calculateCgpa([]), 0);
});

test('normalizeGrades converts legacy ten-point grades to a four-point scale', () => {
  const result = normalizeGrades({
    summary: { cgpa: 8, maxCgpa: 10 },
    progression: [{ semester: 'Semester 1', termGpa: 8, cgpa: 8, credits: 3 }],
    semesters: [{
      name: 'Semester 1',
      gpa: 8,
      credits: 3,
      courses: [{ grade: 'A', points: 10, credits: 3 }]
    }]
  });

  assert.equal(result.summary.cgpa, 4);
  assert.equal(result.summary.maxCgpa, 4);
  assert.equal(result.semesters[0].courses[0].points, 4);
  assert.equal(result.progression[0].termGpa, 4);
});

test('normalizeGrades leaves current four-point data unchanged', () => {
  const grades = { summary: { cgpa: 3.8, maxCgpa: 4 }, semesters: [] };
  assert.equal(normalizeGrades(grades), grades);
});

test('getEmailApiBaseUrl trims whitespace and trailing slashes', () => {
  assert.equal(getEmailApiBaseUrl(' https://api.example.com/api/// '), 'https://api.example.com/api');
  assert.equal(getEmailApiBaseUrl(''), '');
});
