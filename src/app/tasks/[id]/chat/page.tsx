
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useEffect, useState, useRef } from 'react';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Video, Phone } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { useTasks } from '@/context/task-context';
import { useNotifications } from '@/context/notification-context';
import Link from 'next/link';

type Message = { id: string; text: string; senderId: string, timestamp: Date };

export default function ChatPage() {
    const params = useParams();
    const router = useRouter();
    const { user, allUsers } = useAuth();
    const { toast } = useToast();
    const taskId = params.id as string;
    const { getTask, addMessageToTask } = useTasks();
    const { addNotification } = useNotifications();

    const [task, setTask] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const foundTask = getTask(taskId);
        
        if (!user || !foundTask || (user.uid !== foundTask.creatorId && user.uid !== foundTask.applicantId)) {
            toast({
                variant: 'destructive',
                title: 'Access Denied',
                description: 'You are not authorized to view this chat.',
            });
            router.push(`/tasks/${taskId}`);
            return;
        }
        setTask(foundTask);
        setIsLoading(false);
    }, [taskId, user, router, toast, getTask]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [task?.messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !taskId || !task) return;

        const message: Message = {
            id: `msg${Date.now()}`,
            text: newMessage,
            senderId: user.uid,
            timestamp: new Date(),
        };

        addMessageToTask(taskId, message);
        
        const recipientId = user.uid === task.creatorId ? task.applicantId : task.creatorId;
        if (recipientId) {
            addNotification({
                userId: recipientId,
                message: `New message from ${user.name} for task "${task.title}"`,
                link: `/tasks/${taskId}/chat`
            });
        }
    
        // No need to call getTask here as the context update will trigger a re-render
        setNewMessage('');
    };

    const handleStartVideoCall = () => {
        if (!user || !task) return;

        const callLink = `/tasks/${taskId}/video`;
        const messageText = `VIDEO_CALL:${callLink}`;

        const message: Message = {
            id: `msg${Date.now()}`,
            text: messageText,
            senderId: user.uid,
            timestamp: new Date(),
        };
        addMessageToTask(taskId, message);

        const recipientId = user.uid === task.creatorId ? task.applicantId : task.creatorId;
        if (recipientId) {
             addNotification({
                userId: recipientId,
                message: `${user.name} started a video call for "${task.title}"`,
                link: `/tasks/${taskId}/chat`
            });
        }
        router.push(callLink);
    }

    if (isLoading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-6 py-20 text-center">
                    <h1 className="text-5xl font-bold">Loading Chat...</h1>
                </main>
                <Footer />
            </div>
        );
    }
    
    if (!task) {
        return null;
    }
    
    const getOtherUserName = () => {
        const otherUserId = user?.uid === task.creatorId ? task.applicantId : task.creatorId;
        if (!otherUserId) return 'User';
        
        const otherUser = allUsers[otherUserId as keyof typeof allUsers];
        return otherUser?.name ?? 'User';
    };
    const otherUserName = getOtherUserName();
    
    const getSenderName = (senderId: string) => {
       const sender = allUsers[senderId as keyof typeof allUsers];
       return sender?.name ?? 'User';
    };

    const renderMessageContent = (message: Message) => {
        if (message.text.startsWith('VIDEO_CALL:')) {
            const senderName = getSenderName(message.senderId);
            return (
                <div className="flex flex-col items-start gap-2">
                    <p>{senderName} started a video call.</p>
                    <Button asChild size="sm">
                        <Link href={`/tasks/${taskId}/video`}>
                            <Phone className="mr-2 h-4 w-4" /> Join Call
                        </Link>
                    </Button>
                </div>
            );
        }
        return <p className="text-sm">{message.text}</p>;
    }


    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto border rounded-lg flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h1 className="text-xl font-bold">Chat for &quot;{task.title}&quot;</h1>
                            <p className="text-sm text-muted-foreground">with {otherUserName}</p>
                        </div>
                        <Button variant="outline" size="icon" onClick={handleStartVideoCall}>
                            <Video className="h-5 w-5" />
                            <span className="sr-only">Video Call</span>
                        </Button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto space-y-4">
                        {task.messages?.map((message: Message) => {
                            const isSender = message.senderId === user?.uid;
                            const senderName = getSenderName(message.senderId);
                            
                            return (
                                <div key={message.id} className={cn("flex items-end gap-2", isSender ? "justify-end" : "justify-start")}>
                                    {!isSender && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{senderName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn(
                                        "max-w-xs md:max-w-md p-3 rounded-lg",
                                        isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                    )}>
                                        {renderMessageContent(message)}
                                        <p className={cn("text-xs mt-1", isSender ? "text-primary-foreground/70" : "text-muted-foreground/70")}>
                                            {format(new Date(message.timestamp), 'p')}
                                        </p>
                                    </div>
                                     {isSender && (
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>{senderName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                    )}
                                </div>
                            );
                        })}
                         <div ref={messagesEndRef} />
                    </div>
                    <div className="p-4 border-t bg-background">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <Input
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                autoComplete="off"
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <SendHorizonal className="h-5 w-5" />
                                <span className="sr-only">Send Message</span>
                            </Button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
