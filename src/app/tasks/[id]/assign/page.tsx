
'use client';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, Star, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useTasks } from '@/context/task-context';
import { format } from 'date-fns';
import { useNotifications } from '@/context/notification-context';

type User = {
    uid: string;
    name: string;
    description?: string;
    isStudent?: boolean;
    availability?: {
        isAvailable: boolean;
        unavailableDays: string[];
    };
    skills?: string[];
    rating?: number;
    ratingCount?: number;
};

export default function AssignStudentPage() {
    const params = useParams();
    const router = useRouter();
    const { user, allUsers } = useAuth();
    const { toast } = useToast();
    const taskId = params.id as string;
    const { getTask, assignStudentToTask } = useTasks();
    const { addNotification } = useNotifications();
    
    const [task, setTask] = useState<any>(null);
    const [students, setStudents] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'You must be logged in to assign a task.',
            });
            router.push(`/`);
            return;
        }

        const currentTask = getTask(taskId);
        
        if (currentTask && currentTask.paymentMethod === 'app' && !currentTask.isPaid) {
            toast({
                variant: 'destructive',
                title: 'Payment Required',
                description: 'Please complete the payment before assigning a helper.',
            });
            router.push(`/tasks/${taskId}/payment`);
            return;
        }

        setTask(currentTask);

        const studentUsers = Object.values(allUsers).filter(u => u.isStudent).map(student => ({
            ...student,
            skills: ['Gardening', 'Tech Support', 'Pet Care'].sort(() => 0.5 - Math.random()).slice(0, 2),
        }));

        setStudents(studentUsers);
        setIsLoading(false);
    }, [taskId, user, router, toast, getTask, allUsers]);
    
    const isStudentAvailable = (student: User, task: any) => {
        if (!student.availability?.isAvailable) {
            return false;
        }

        if (task.taskDate) {
            const taskDay = format(new Date(task.taskDate), 'eeee').toLowerCase();
            if (student.availability?.unavailableDays.includes(taskDay)) {
                return false;
            }
        }
        
        return true;
    }

    const handleHire = (studentId: string, studentName: string) => {
        if (!taskId || !task) return;
        assignStudentToTask(taskId, studentId);

        addNotification({
            userId: studentId,
            message: `You've been hired for "${task.title}"!`,
            link: `/tasks/${taskId}`,
        });
        
        toast({
            title: 'Student Hired!',
            description: `You have hired ${studentName}. You can now chat with them to coordinate details.`,
        });
        
        router.push(`/tasks/${taskId}`);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-bold">Finding Helpers...</h1>
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
                    <Button asChild className="mt-4"><Link href="/tasks">View All Tasks</Link></Button>
                </main>
                <Footer />
            </div>
        );
    }

    if(task.status === 'in progress' || task.applicantId) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-12 md:py-20">
                     <div className="max-w-3xl mx-auto">
                        <Alert>
                            <Users className="h-4 w-4" />
                            <AlertTitle>Helper Already Assigned!</AlertTitle>
                            <AlertDescription>
                                This task already has a helper. You can now{' '}
                                <Link href={`/tasks/${taskId}/chat`} className="font-semibold text-primary hover:underline">
                                    chat with them
                                </Link>
                                {' '}to coordinate details or view the{' '}
                                <Link href={`/tasks/${taskId}`} className="font-semibold text-primary hover:underline">
                                    task details
                                </Link>.
                            </AlertDescription>
                        </Alert>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-6 py-12 md:py-20">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold">Choose a Helper for</h1>
                        <p className="text-2xl text-muted-foreground mt-2">&quot;{task.title}&quot;</p>
                    </div>
                    {students.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {students.map(student => {
                                const isAvailable = isStudentAvailable(student, task);
                                const rating = student.rating ? student.rating.toFixed(1) : 'N/A';
                                const ratingCount = student.ratingCount ?? 0;
                                return (
                                    <Card key={student.uid} className="overflow-hidden flex flex-col">
                                        <CardHeader className="p-6">
                                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <h3 className="text-2xl font-semibold">{student.name}</h3>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span>{rating} ({ratingCount} reviews)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                                                    {!isAvailable && (
                                                        <Badge variant="destructive">Unavailable</Badge>
                                                    )}
                                                    <Button
                                                        size="lg"
                                                        onClick={() => handleHire(student.uid, student.name)}
                                                        className="w-full sm:w-auto"
                                                        disabled={!isAvailable}
                                                    >
                                                        Hire {student.name.split(' ')[0]}
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 pt-0 flex-grow">
                                            {student.description && (
                                                <p className="text-muted-foreground italic border-l-4 pl-4">
                                                    &quot;{student.description}&quot;
                                                </p>
                                            )}
                                        </CardContent>
                                        <CardFooter className="bg-muted/50 p-4 flex flex-wrap gap-2 mt-auto">
                                            {student.skills?.map(skill => (
                                                <Badge key={skill} variant="secondary">{skill}</Badge>
                                            ))}
                                        </CardFooter>
                                    </Card>
                                )
                            })}
                        </div>
                    ) : (
                         <div className="text-center py-16 border-2 border-dashed rounded-lg">
                            <h2 className="text-2xl font-semibold text-muted-foreground">No helpers available right now.</h2>
                            <p className="mt-2 text-muted-foreground">Please check back later.</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
