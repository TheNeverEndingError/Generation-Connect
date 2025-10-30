
'use client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from '@/components/ui/card';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { useTasks } from '@/context/task-context';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';


export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, isLoading } = useTasks();
  const [displayedTasks, setDisplayedTasks] = useState(tasks);
  const [pageTitle, setPageTitle] = useState("Available Tasks");
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      // Redirect or show a message if user is not logged in.
      // For now, let's keep the current behavior which will be handled by the return block below.
      return;
    };

    if (user.isStudent) {
        // Students see tasks they are assigned to
        setDisplayedTasks(tasks.filter(task => task.status === 'open' || task.applicantId === user.uid));
        setPageTitle("Available Tasks");
    } else {
        // Elders see tasks they have created
        setDisplayedTasks(tasks.filter(task => task.creatorId === user.uid));
        setPageTitle("My Posted Tasks");
    }
  }, [tasks, user]);


  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold">Finding Your Tasks...</h1>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!user) {
     return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold">Please log in to see your tasks.</h1>
           <Button asChild className="mt-4"><Link href="/">Go to Homepage</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">{pageTitle}</h1>
        {displayedTasks && displayedTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTasks.map((task) => (
              <Card key={task.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{task.title}</CardTitle>
                    <Badge variant={task.status === 'open' ? 'secondary' : 'default'} className="capitalize">{task.status}</Badge>
                  </div>
                  <CardDescription>{task.serviceType}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground line-clamp-4">{task.description}</p>
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="font-semibold text-lg text-primary">${task.budget}</div>
                  <Button asChild>
                    <Link href={`/tasks/${task.id}`}>View Details <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold text-muted-foreground">
                {user.isStudent ? "You haven't been assigned any tasks yet." : "You haven't posted any tasks yet."}
            </h2>
            <p className="mt-2 text-muted-foreground">
                 {user.isStudent ? "Check the 'Available Tasks' to find jobs." : "Click 'Post a Task' to get started!"}
            </p>
             {!user.isStudent && (
                <Button asChild className="mt-4">
                    <Link href="/post-a-task">Post a New Task</Link>
                </Button>
             )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
