
'use client';

import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, DollarSign, User, Trash2, MessageSquare, Users, Pencil, Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTasks } from '@/context/task-context';
import { cn } from '@/lib/utils';

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, updateUser, allUsers } = useAuth();
    const { toast } = useToast();
    const taskId = params.id as string;
    const { getTask, deleteTask } = useTasks();
    
    const [task, setTask] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        setIsLoading(true);
        const currentTask = getTask(taskId);
        setTask(currentTask);
        setIsLoading(false);
    }, [taskId, getTask]);


    const handleDeleteTask = () => {
        deleteTask(taskId);
        toast({
            title: 'Task Deleted',
            description: 'The task has been successfully removed.',
        });
        router.push('/tasks');
    };

    const handleCompleteTask = () => {
        if (!task || !task.applicantId) return;

        const student = allUsers[task.applicantId];
        if (student) {
            const newRatingCount = (student.ratingCount || 0) + 1;
            const oldTotalRating = (student.rating || 0) * (student.ratingCount || 0);
            const newAverageRating = (oldTotalRating + rating) / newRatingCount;

            updateUser(student.uid, {
                rating: newAverageRating,
                ratingCount: newRatingCount,
            });
             toast({
                title: "Task Completed!",
                description: `You've rated ${student.name} ${rating} stars.`
            });
        }

        deleteTask(taskId);
        
        setIsRatingModalOpen(false);
        setRating(0);
        router.push('/tasks');
    };


    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-bold">Loading Task Details...</h1>
                </main>
                <Footer />
            </div>
        );
    }
    
    if (!task) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-bold">Task Not Found</h1>
                     <p className="text-muted-foreground mt-2">This task may have been removed or is no longer available.</p>
                     <Button asChild className="mt-4"><a href="/tasks">View All Tasks</a></Button>
                </main>
                <Footer />
            </div>
        );
    }
    
    const isOwner = user?.uid === task.creatorId;
    const isAssignedStudent = user?.uid === task.applicantId;
    const canChat = (isOwner || isAssignedStudent) && task.status === 'in progress';
    const canEdit = isOwner && task.status !== 'completed';
    const canComplete = isOwner && task.status === 'in progress';

    const renderTaskDates = () => {
        if (!task.taskDates || task.taskDates.length === 0) {
            return (
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{format(new Date(task.taskDate), 'PPP')}</span>
                </div>
            );
        }
        if (task.taskDates.length === 1) {
             return (
                <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span>{format(new Date(task.taskDates[0]), 'PPP')}</span>
                </div>
            );
        }
        return (
             <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary mt-1" />
                <ul>
                    {task.taskDates.map((date: Date, index: number) => (
                        <li key={index}>{format(new Date(date), 'PPP')}</li>
                    ))}
                </ul>
            </div>
        )
    }

    return (
        <>
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 md:py-20">
                 <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                             <CardTitle className="text-3xl md:text-4xl">{task.title}</CardTitle>
                             <Badge variant={task.status === 'open' ? 'secondary' : (task.status === 'completed' ? 'default' : 'outline')} className={cn("capitalize", task.status === 'in progress' && 'bg-green-600 text-white')}>{task.status}</Badge>
                        </div>
                        <CardDescription className="text-lg pt-2">{task.serviceType}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 text-lg">
                        <p>{task.description}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-md">
                            {renderTaskDates()}
                             <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-primary" />
                                <span>{task.location}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <DollarSign className="w-5 h-5 text-primary" />
                                <span className="font-semibold">${task.budget}</span>
                            </div>
                             <div className="flex items-center gap-3">
                                <User className="w-5 h-5 text-primary" />
                                <span>Posted by {task.creatorName}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex flex-col sm:flex-row w-full gap-4">
                            {isOwner && task.status === 'open' && (
                                <Button asChild className="flex-1 text-lg" size="lg" variant="outline">
                                    <Link href={`/tasks/${task.id}/assign`}><Users className="mr-2 h-5 w-5" />Assign a Student</Link>
                                </Button>
                            )}
                            {canEdit && (
                                <Button asChild className="flex-1 text-lg" size="lg" variant="secondary">
                                  <Link href={`/tasks/${task.id}/edit`}><Pencil className="mr-2 h-5 w-5" />Edit Task</Link>
                                </Button>
                            )}
                            {canChat && (
                                <Button asChild className="flex-1 text-lg" size="lg">
                                    <Link href={`/tasks/${task.id}/chat`}><MessageSquare className="mr-2 h-5 w-5" />Chat with {isOwner ? 'Student' : 'Elder'}</Link>
                                </Button>
                            )}
                            {canComplete && (
                                <Button className="flex-1 text-lg" size="lg" onClick={() => setIsRatingModalOpen(true)}>
                                    <CheckCircle className="mr-2 h-5 w-5" />Complete Task
                                </Button>
                            )}
                        </div>
                         {isOwner && task.status !== 'in progress' && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="icon" className="w-full sm:w-auto mt-4 sm:mt-0">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this task.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteTask}>
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         )}
                    </CardFooter>
                </Card>
            </main>
            <Footer />
        </div>
        
        <Dialog open={isRatingModalOpen} onOpenChange={setIsRatingModalOpen}>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Rate Your Helper</DialogTitle>
                    <DialogDescription>
                        Task &quot;{task.title}&quot; is complete. Please rate the service provided by {allUsers[task.applicantId]?.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center py-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                        key={star}
                        className={cn(
                            'w-10 h-10 cursor-pointer',
                            (hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        )}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        />
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsRatingModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleCompleteTask} disabled={rating === 0}>Submit Rating & Complete</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
     </>
    );
}
