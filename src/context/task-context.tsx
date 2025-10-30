
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

type Message = { id: string; text: string; senderId: string, timestamp: Date };

type Task = {
    id: string;
    title: string;
    description: string;
    serviceType: string;
    location: string;
    budget: number;
    status: 'open' | 'in progress' | 'completed';
    taskDate: Date; // Primary date for sorting/display
    taskDates?: Date[]; // For multiple day tasks
    creatorId: string;
    creatorName: string;
    applicantId?: string;
    paymentMethod: 'cash' | 'app';
    isPaid?: boolean;
    messages?: Message[];
};

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updatedTask: Partial<Task>) => void;
  getTask: (taskId: string) => Task | undefined;
  assignStudentToTask: (taskId: string, studentId: string) => void;
  addMessageToTask: (taskId: string, message: Message) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const FAKE_TASKS: Task[] = [
    {
        id: '1',
        title: 'Help planting my garden',
        description: 'I need some help digging and planting some new flowers in my garden bed. All tools will be provided. Just need an extra pair of hands for a couple of hours.',
        serviceType: 'Yard Work',
        location: 'Sunnyvale, CA',
        budget: 50,
        status: 'in progress' as const,
        taskDate: new Date(),
        creatorId: 'elder1',
        creatorName: 'Test Elder',
        applicantId: 'student2',
        paymentMethod: 'cash' as const,
        isPaid: false,
        messages: [
          { id: 'msg1', text: 'Hi! Thanks for picking me. When is a good time to come by?', senderId: 'student2', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
          { id: 'msg2', text: 'How about tomorrow at 3pm?', senderId: 'elder1', timestamp: new Date(Date.now() - 1000 * 60 * 10) },
        ]
    },
    {
        id: '2',
        title: 'Tech help with new Smart TV',
        description: 'I just bought a new television and I\'m having trouble setting up the streaming apps like Netflix and Hulu. Would appreciate someone tech-savvy to walk me through it.',
        serviceType: 'Technology Assistance',
        location: 'Mountain View, CA',
        budget: 40,
        status: 'in progress' as const,
        taskDate: new Date(),
        creatorId: 'elder1',
        creatorName: 'Test Elder',
        applicantId: 'student1',
        paymentMethod: 'app' as const,
        isPaid: true,
        messages: [
          { id: 'msg1', text: 'Hi Alex, thanks for your interest. When would be a good time to come over?', senderId: 'elder1', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
          { id: 'msg2', text: 'Hi Jane! I can come over tomorrow afternoon around 2 PM. Does that work for you?', senderId: 'student1', timestamp: new Date(Date.now() - 1000 * 60 * 4) },
        ]
    },
     {
        id: '3',
        title: 'Walk my dog twice a day',
        description: 'My golden retriever, Buddy, needs two walks a day while I\'m recovering from a minor surgery. He\'s very friendly!',
        serviceType: 'Pet Care',
        location: 'Palo Alto, CA',
        budget: 20,
        status: 'open' as const,
        taskDate: new Date(),
        creatorId: 'elder2',
        creatorName: 'John Smith',
        paymentMethod: 'cash' as const,
        isPaid: false,
    }
];

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const parseTasks = (jsonString: string | null): Task[] => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString).map((task: any) => ({
        ...task,
        taskDate: new Date(task.taskDate),
        taskDates: task.taskDates?.map((d: string) => new Date(d)) || [],
        messages: task.messages?.map((msg:any) => ({...msg, timestamp: new Date(msg.timestamp)})) || []
      }));
    } catch {
      return [];
    }
  }

  useEffect(() => {
    setIsLoading(true);
    const storedTasks = localStorage.getItem('fakeTasks');
    if (storedTasks) {
      setTasks(parseTasks(storedTasks));
    } else {
      setTasks(FAKE_TASKS);
      localStorage.setItem('fakeTasks', JSON.stringify(FAKE_TASKS));
    }
    setIsLoading(false);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'fakeTasks' && event.newValue) {
        setTasks(parseTasks(event.newValue));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };

  }, []);

  const updateLocalStorage = (updatedTasks: Task[]) => {
    localStorage.setItem('fakeTasks', JSON.stringify(updatedTasks));
  }

  const addTask = (task: Task) => {
    setTasks(prevTasks => {
        const newTasks = [task, ...prevTasks];
        updateLocalStorage(newTasks);
        return newTasks;
    });
  };
  
  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => {
        const newTasks = prevTasks.filter(task => task.id !== taskId);
        updateLocalStorage(newTasks);
        return newTasks;
    });
  };
  
  const updateTask = (taskId: string, updatedData: Partial<Task>) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => 
        task.id === taskId ? { ...task, ...updatedData } : task
      );
      updateLocalStorage(newTasks);
      return newTasks;
    });
  };
  
  const getTask = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const assignStudentToTask = (taskId: string, studentId: string) => {
      setTasks(prevTasks => {
          const newTasks = prevTasks.map(task => 
              task.id === taskId 
                  ? { ...task, applicantId: studentId, status: 'in progress' } 
                  : task
          );
          updateLocalStorage(newTasks);
          return newTasks;
      });
  };

  const addMessageToTask = (taskId: string, message: Message) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedMessages = task.messages ? [...task.messages, message] : [message];
          return { ...task, messages: updatedMessages };
        }
        return task;
      });
      updateLocalStorage(newTasks);
      return newTasks;
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, isLoading, addTask, deleteTask, getTask, updateTask, assignStudentToTask, addMessageToTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
