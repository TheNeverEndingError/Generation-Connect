'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface UserAvailability {
  isAvailable: boolean;
  unavailableDays: string[];
  availableTime: [number, number];
}

interface User {
  uid: string;
  email: string;
  name: string;
  photoURL?: string;
  isStudent?: boolean;
  availability?: UserAvailability;
}

interface AuthContextType {
  user: User | null;
  allUsers: { [key: string]: User };
  login: (email: string, password?: string, name?: string) => void;
  logout: () => void;
  switchUser: () => void;
  updateUser: (updatedData: Partial<User>) => void;
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
    availability: {
      isAvailable: true,
      unavailableDays: ['saturday', 'sunday'],
      availableTime: [9, 17], // 9am to 5pm
    },
  },
  {
    uid: 'student2',
    name: 'Samantha Lee',
    email: 'samantha.lee@example.com',
    isStudent: true,
    availability: {
      isAvailable: false,
      unavailableDays: [],
      availableTime: [10, 16],
    },
  },
  {
    uid: 'student3',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    isStudent: true,
    availability: {
      isAvailable: true,
      unavailableDays: ['wednesday'],
      availableTime: [15, 20],
    },
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
    // This effect runs once on the client after initial render.
    // It's safe to use localStorage here.
    
    // Load all user data for simulation purposes
    let currentAllUsers: { [key: string]: User };
    const storedAllUsers = localStorage.getItem('allFakeUsers');
    if (storedAllUsers) {
      currentAllUsers = JSON.parse(storedAllUsers);
    } else {
      currentAllUsers = TEST_USERS_MAP;
      localStorage.setItem('allFakeUsers', JSON.stringify(currentAllUsers));
    }
    setAllUsers(currentAllUsers);
    
    // Set the current logged-in user
    const storedUser = localStorage.getItem('fakeUser');
    if (storedUser && storedUser !== 'null' && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // If parsing fails, fall back to a default user.
        const defaultUser = currentAllUsers['elder1'];
        setUser(defaultUser);
        localStorage.setItem('fakeUser', JSON.stringify(defaultUser));
      }
    } else {
      // If no user is stored, set the default user.
      const defaultUser = currentAllUsers['elder1'];
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
        ...(isStudent && { availability: allUsers.student1.availability })
      };
      const updatedAllUsers = { ...allUsers, [newUser.uid]: newUser };
      setAllUsers(updatedAllUsers);
      localStorage.setItem('allFakeUsers', JSON.stringify(updatedAllUsers));
    }
    
    setUser(newUser);
    localStorage.setItem('fakeUser', JSON.stringify(newUser));
  };
  
  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    setUser(currentUser => {
      if (!currentUser) return null;
      const updatedUser = { ...currentUser, ...updatedData };

      const updatedAllUsers = { ...allUsers, [updatedUser.uid]: updatedUser };
      setAllUsers(updatedAllUsers);
      localStorage.setItem('allFakeUsers', JSON.stringify(updatedAllUsers));
      
      localStorage.setItem('fakeUser', JSON.stringify(updatedUser));
      return updatedUser;
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

// Custom hook to use both user and allUsers
export function useAuth(): AuthContextType & { allUsers: { [key: string]: User } } {
  const context = useContext(AuthContext) as (AuthContextType & { allUsers: { [key: string]: User } });
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
