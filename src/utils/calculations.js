/**
 * Academic calculation utilities for GPA, CGPA, and Attendance compliance
 */

export const calculateAttendanceRate = (present, total) => {
  if (!total || total === 0) return 0;
  return Number(((present / total) * 100).toFixed(1));
};

export const isExamEligible = (attendanceRate, minRequired = 75.0) => {
  return attendanceRate >= minRequired;
};

export const calculateCgpa = (semesters = []) => {
  let totalQualityPoints = 0;
  let totalCredits = 0;

  semesters.forEach((sem) => {
    if (sem.gpa && sem.credits) {
      totalQualityPoints += sem.gpa * sem.credits;
      totalCredits += sem.credits;
    }
  });

  if (totalCredits === 0) return 0;
  return Number((totalQualityPoints / totalCredits).toFixed(2));
};

const GPA_SCALE = 4;
const GRADE_POINTS = {
  'A+': 4.0,
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3
};

export const normalizeGrades = (grades) => {
  const semesters = Array.isArray(grades?.semesters) ? grades.semesters : [];
  const isLegacyScale =
    Number(grades?.summary?.maxCgpa) > GPA_SCALE ||
    Number(grades?.summary?.cgpa) > GPA_SCALE ||
    semesters.some(
      (semester) =>
        Number(semester.gpa) > GPA_SCALE ||
        semester.courses?.some((course) => Number(course.points) > GPA_SCALE)
    );

  if (!isLegacyScale) return grades;

  const normalizedSemesters = semesters.map((semester) => {
    const courses = (semester.courses || []).map((course) => ({
      ...course,
      points: GRADE_POINTS[course.grade] ?? Math.min(Number(course.points || 0) * 0.4, GPA_SCALE)
    }));
    const credits = courses.reduce((total, course) => total + Number(course.credits || 0), 0);
    const qualityPoints = courses.reduce((total, course) => total + course.points * course.credits, 0);
    const gpa = credits
      ? calculateCgpa([{ gpa: qualityPoints / credits, credits }])
      : Number((Number(semester.gpa || 0) * 0.4).toFixed(2));

    return { ...semester, gpa, courses };
  });

  let totalCredits = 0;
  let totalQualityPoints = 0;
  const progression = [...(grades.progression || [])]
    .sort((a, b) => Number(a.semester.match(/\d+/)?.[0] || 0) - Number(b.semester.match(/\d+/)?.[0] || 0))
    .map((item) => {
      const semesterNumber = Number(item.semester.match(/\d+/)?.[0] || 0);
      const semester = normalizedSemesters.find(
        (entry) => Number(entry.name.match(/Semester\s+(\d+)/)?.[1] || 0) === semesterNumber
      );
      const termGpa = semester?.gpa ?? Number((Number(item.termGpa || 0) * 0.4).toFixed(2));
      const credits = Number(semester?.credits || item.credits || 0);

      totalCredits += credits;
      totalQualityPoints += semester?.courses?.length
        ? semester.courses.reduce((total, course) => total + course.points * course.credits, 0)
        : termGpa * credits;
      const cgpa = totalCredits
        ? Number((totalQualityPoints / totalCredits).toFixed(2))
        : termGpa;

      return { ...item, termGpa, cgpa, credits };
    });

  const cgpa = progression.at(-1)?.cgpa ?? Number((Number(grades.summary?.cgpa || 0) * 0.4).toFixed(2));

  return {
    ...grades,
    summary: { ...grades.summary, cgpa, maxCgpa: GPA_SCALE },
    progression,
    semesters: normalizedSemesters
  };
};

export const getDaysRemaining = (targetDateString) => {
  const diff = new Date(targetDateString).getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDeadline = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};
