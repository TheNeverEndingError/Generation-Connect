
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserAvailability {
  isAvailable: boolean;
  unavailableDays: string[];
}

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  isStudent?: boolean;
  availability?: UserAvailability;
  description?: string;
  rating?: number;
  ratingCount?: number;
}

interface AuthContextType {
  user: User | null;
  allUsers: { [key: string]: User };
  login: (email: string, password?: string, name?: string) => void;
  logout: () => void;
  switchUser: () => void;
  updateUser: (userId: string, updatedData: Partial<User>) => void;
}

const TEST_USERS_LIST: User[] = [
  {
    uid: 'elder1',
    email: 'test.elder@example.com',
    name: 'Test Elder',
    isStudent: false,
  },
  {
    uid: 'student1',
    email: 'test.student@example.com',
    name: 'Test Student',
    isStudent: true,
    description: 'I am a reliable and hardworking high school student with experience in yard work and technology. I am passionate about helping my community and look forward to assisting you with your tasks!',
    availability: {
      isAvailable: true,
      unavailableDays: ['saturday', 'sunday'],
    },
    rating: 4.8,
    ratingCount: 12,
  },
  {
    uid: 'student2',
    name: 'Samantha Lee',
    email: 'samantha.lee@example.com',
    isStudent: true,
    description: 'Friendly and patient student available for companionship, pet care, and light housekeeping. I love animals and enjoy spending time with elders.',
    availability: {
      isAvailable: false,
      unavailableDays: [],
    },
    rating: 4.9,
    ratingCount: 25,
  },
  {
    uid: 'student3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    isStudent: true,
    description: 'Tech-savvy student who can help you with any computer or smartphone issues. I am also available for running errands.',
    availability: {
      isAvailable: true,
      unavailableDays: ['wednesday'],
    },
    rating: 4.7,
    ratingCount: 18,
  },
  {
    uid: 'student4',
    name: 'David Rodriguez',
    email: 'david.rodriguez@example.com',
    isStudent: true,
    description: 'Eager to help with any outdoor tasks or heavy lifting. I am strong, responsible, and work well with my hands.',
    availability: {
      isAvailable: true,
      unavailableDays: ['tuesday', 'thursday'],
    },
    rating: 4.6,
    ratingCount: 15,
  },
  {
    uid: 'student5',
    name: 'Emily White',
    email: 'emily.white@example.com',
    isStudent: true,
    description: 'I love organizing and cleaning! Let me help you tidy up your space. I am meticulous and efficient.',
    availability: {
      isAvailable: true,
      unavailableDays: ['monday', 'friday'],
    },
    rating: 4.9,
    ratingCount: 22,
  },
  {
    uid: 'student6',
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    isStudent: true,
    description: 'Creative and artistic student. I can help with decorating, crafts, or wrapping presents. I have a good eye for detail.',
    availability: {
      isAvailable: true,
      unavailableDays: ['saturday'],
    },
    rating: 4.8,
    ratingCount: 19,
  },
  {
    uid: 'student7',
    name: 'Chris Green',
    email: 'chris.green@example.com',
    isStudent: true,
    description: 'I am a musician and can offer music lessons (guitar/piano) or just play some music for entertainment.',
    availability: {
      isAvailable: true,
      unavailableDays: [],
    },
    rating: 4.9,
    ratingCount: 30,
  },
];

const TEST_USERS_MAP = TEST_USERS_LIST.reduce((acc, user) => {
    acc[user.uid] = user;
    return acc;
}, {} as {[key: string]: User});


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<{[key: string]: User}>(TEST_USERS_MAP);

  useEffect(() => {
    const storedAllUsers = localStorage.getItem('allFakeUsers');
    let currentUsers: { [key: string]: User };
    if (storedAllUsers) {
      try {
        currentUsers = JSON.parse(storedAllUsers);
      } catch (e) {
        currentUsers = TEST_USERS_MAP;
      }
    } else {
      currentUsers = TEST_USERS_MAP;
    }
    setAllUsers(currentUsers);
    localStorage.setItem('allFakeUsers', JSON.stringify(currentUsers));


    const storedUser = localStorage.getItem('fakeUser');
    if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Make sure the current user is in sync with the "DB"
        setUser(currentUsers[parsedUser.uid] || currentUsers.elder1);
      } catch(e) {
        const defaultUser = currentUsers.elder1;
        setUser(defaultUser);
        localStorage.setItem('fakeUser', JSON.stringify(defaultUser));
      }
    } else {
      const defaultUser = currentUsers.elder1;
      setUser(defaultUser);
      localStorage.setItem('fakeUser', JSON.stringify(defaultUser));
    }
  }, []);

  const login = (email: string, password?: string, name?: string) => {
    const existingUser = Object.values(allUsers).find(u => u.email === email);

    let newUser: User;
    if (existingUser) {
        newUser = existingUser;
    } else {
      // Fake signup
      const isStudent = email.includes('student');
      newUser = { 
        uid: `user-${Date.now()}`, 
        name: name || 'New User', 
        email: email, 
        isStudent: isStudent,
        ...(isStudent && { 
            description: 'New student ready to help!',
            availability: allUsers.student1.availability,
            rating: 0,
            ratingCount: 0,
        })
      };
      const updatedAllUsers = { ...allUsers, [newUser.uid]: newUser };
      setAllUsers(updatedAllUsers);
      localStorage.setItem('allFakeUsers', JSON.stringify(updatedAllUsers));
    }
    
    setUser(newUser);
    localStorage.setItem('fakeUser', JSON.stringify(newUser));
  };
  
  const updateUser = (userId: string, updatedData: Partial<User>) => {
    setAllUsers(prevAllUsers => {
      const targetUser = prevAllUsers[userId];
      if (!targetUser) return prevAllUsers;

      const updatedUser = { ...targetUser, ...updatedData };
      const newAllUsers = { ...prevAllUsers, [userId]: updatedUser };
      
      localStorage.setItem('allFakeUsers', JSON.stringify(newAllUsers));

      // Also update the currently logged-in user if they are the one being changed
      if (user && user.uid === userId) {
        setUser(updatedUser);
        localStorage.setItem('fakeUser', JSON.stringify(updatedUser));
      }
      
      return newAllUsers;
    });
  };

  const logout = () => {
    const defaultUser = allUsers.elder1;
    setUser(defaultUser);
    localStorage.setItem('fakeUser', JSON.stringify(defaultUser));
  };
  
  const switchUser = () => {
    const elderUser = allUsers.elder1;
    const studentUser = allUsers.student1;

    if (!elderUser || !studentUser) return;

    const nextUser = user?.uid === elderUser.uid ? studentUser : elderUser;
    setUser(nextUser);
    localStorage.setItem('fakeUser', JSON.stringify(nextUser));
  };

  const contextValue = { user, login, logout, switchUser, updateUser, allUsers };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType & { allUsers: { [key: string]: User } } {
  const context = useContext(AuthContext) as (AuthContextType & { allUsers: { [key: string]: User } });
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
