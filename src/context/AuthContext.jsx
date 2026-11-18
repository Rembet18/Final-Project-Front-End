import { createContext, useContext, useState, useEffect } from 'react';
import initialStudents from '../data/students.json';
import initialLecturers from '../data/lecturers.json';
import { getStoredItem, setStoredItem, removeStoredItem } from '../utils/storage';

const AuthContext = createContext(null);

const STORAGE_KEY_USER = 'unisphere_current_user';
const STORAGE_KEY_STUDENTS = 'unisphere_students_db';
const STORAGE_KEY_LECTURERS = 'unisphere_lecturers_db';
const STORAGE_KEY_AUTH_VERSION = 'unisphere_auth_version';
const PRIMARY_LECTURER_ID = 'lec-001';
const PRIMARY_LECTURER_NAME = 'Sir Enrico Djimesha';

const normalizePrimaryLecturer = (user) =>
  user?.id === PRIMARY_LECTURER_ID && user.name !== PRIMARY_LECTURER_NAME
    ? { ...user, name: PRIMARY_LECTURER_NAME }
    : user;

const getInitialUser = () => {
  const authVersion = getStoredItem(STORAGE_KEY_AUTH_VERSION, 0);
  if (authVersion !== 1) {
    removeStoredItem(STORAGE_KEY_USER);
    setStoredItem(STORAGE_KEY_AUTH_VERSION, 1);
    return null;
  }
  return normalizePrimaryLecturer(getStoredItem(STORAGE_KEY_USER, null));
};

export const AuthProvider = ({ children }) => {
    // Load registered students list from localStorage or initial dataset
    const [students, setStudents] = useState(() => {
    const storedStudents = getStoredItem(STORAGE_KEY_STUDENTS, initialStudents);
    if (!Array.isArray(storedStudents)) return initialStudents;

    const mergedStudents = new Map(initialStudents.map((student) => [student.id, student]));
    storedStudents.forEach((student) => {
      if (student?.id) mergedStudents.set(student.id, student);
    });
    return [...mergedStudents.values()];
    });

    // Load registered lecturers list from localStorage or initial dataset
    const [lecturers, setLecturers] = useState(() => {
      const storedLecturers = getStoredItem(STORAGE_KEY_LECTURERS, initialLecturers);
      if (!Array.isArray(storedLecturers)) return initialLecturers;

      return storedLecturers.map((lecturer) => normalizePrimaryLecturer(lecturer));
    });

    const [currentUser, setCurrentUser] = useState(getInitialUser);

    const [loading, setLoading] = useState(false);

    // Sync students database to localStorage
    useEffect(() => {
      setStoredItem(STORAGE_KEY_STUDENTS, students);
    }, [students]);

          // Sync lecturers database to localStorage
          useEffect(() => {
            setStoredItem(STORAGE_KEY_LECTURERS, lecturers);
          }, [lecturers]);

    // Sync current user session to localStorage
    useEffect(() => {
      if (currentUser) {
        setStoredItem(STORAGE_KEY_USER, currentUser);
      } else {
        removeStoredItem(STORAGE_KEY_USER);
      }
    }, [currentUser]);

    // Login handler: supports students (NIM/email) and lecturers (NIP/email)
    const login = (identifier, password) => {
      setLoading(true);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const trimmed = (identifier || '').trim().toLowerCase();
          const matchingUsers = [
            ...lecturers.map((user) => ({ ...user, role: 'lecturer' })),
            ...students.map((user) => ({ ...user, role: 'student' }))
          ].filter((user) =>
            [user.nim, user.nip, user.email, user.name].some(
              (value) => typeof value === 'string' && value.trim().toLowerCase() === trimmed
            )
          );

          setLoading(false);
          if (matchingUsers.length !== 1 || matchingUsers[0].password !== password) {
            reject(new Error('NIM/NIP/email/nama lengkap atau password tidak sesuai.'));
            return;
          }

          const userObj = matchingUsers[0];
          setCurrentUser(userObj);
          resolve(userObj);
          }, 300);
      });
    };

      // Register a new student account
      const register = (studentData) => {
        const name = String(studentData.name || '').trim();
        const nim = String(studentData.nim || '').trim();
        const email = String(studentData.email || '').trim();
        const password = String(studentData.password || '');

        if (!name || !nim || !email || !password) {
          return Promise.reject(new Error('Nama, NIM, email, dan password wajib diisi.'));
        }
        if (password.length < 8) {
          return Promise.reject(new Error('Password harus terdiri dari minimal 8 karakter.'));
        }

        const duplicateUser = [...students, ...lecturers].find(
          (user) =>
            user.nim?.trim().toLowerCase() === nim.toLowerCase() ||
            user.nip?.trim().toLowerCase() === nim.toLowerCase() ||
            user.email?.trim().toLowerCase() === email.toLowerCase()
        );
        if (duplicateUser) {
          return Promise.reject(new Error('NIM/NIP atau email tersebut sudah terdaftar.'));
        }

        setLoading(true);
        return new Promise((resolve) => {
          setTimeout(() => {
            setLoading(false);
            const newStudent = {
              id: `std-${Date.now()}`,
              nim,
              name,
              role: 'student',
              email,
              password,
              major: studentData.major || 'Computer Science',
              faculty: studentData.faculty || 'Faculty of Engineering & Technology',
              academicAdvisor: PRIMARY_LECTURER_NAME,
              semester: 1,
              enrollmentYear: 2024,
              cgpa: 0,
              completedCredits: 22,
              totalRequiredCredits: 144,
              phone: studentData.phone || '+62 812-0000-0000',
              address: studentData.address || 'Campus Dormitory',
              bio: studentData.bio || 'Newly enrolled undergraduate student.',
              avatar: studentData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256'
            };

            setStudents((prev) => [...prev, newStudent]);
            setCurrentUser(newStudent);
            resolve(newStudent);
          }, 400);
        });
      };

      // Update profile details
      const updateProfile = (updatedFields) => {
        if (!currentUser) return;
        const updated = { ...currentUser, ...updatedFields };
        setCurrentUser(updated);

        if (currentUser.role === 'lecturer') {
          setLecturers((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        } else {
          setStudents((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }
      };

      const updatePassword = (currentPassword, newPassword) => {
        if (!currentUser || currentUser.password !== currentPassword) {
          throw new Error('Password saat ini tidak sesuai.');
        }
        if (typeof newPassword !== 'string' || newPassword.length < 8) {
          throw new Error('Password baru harus terdiri dari minimal 8 karakter.');
        }

        const updated = { ...currentUser, password: newPassword };
        setCurrentUser(updated);
        if (currentUser.role === 'lecturer') {
          setLecturers((prev) => prev.map((lecturer) => (lecturer.id === updated.id ? updated : lecturer)));
        } else {
          setStudents((prev) => prev.map((student) => (student.id === updated.id ? updated : student)));
        }
      };

      // Logout
      const logout = () => {
        setCurrentUser(null);
        removeStoredItem(STORAGE_KEY_USER);
      };

      const isLecturer = currentUser?.role === 'lecturer';
      const isStudent = !currentUser || currentUser?.role !== 'lecturer';

      const value = {
        currentUser,
        role: currentUser?.role || 'student',
        isLecturer,
        isStudent,
        isAuthenticated: !!currentUser,
        loading,
        students,
        lecturers,
        login,
        register,
        updateProfile,
        updatePassword,
        logout
    };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
