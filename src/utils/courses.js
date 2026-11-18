import initialCourses from '../data/courses.json';

export const getCourses = () => initialCourses;

export const getTotalCredits = (courses = getCourses()) =>
  courses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
