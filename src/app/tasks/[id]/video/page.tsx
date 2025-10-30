
'use client';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { useTasks } from '@/context/task-context';

export default function VideoPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;
  const { toast } = useToast();
  const { user, allUsers } = useAuth();
  const { getTask } = useTasks();
  
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [otherUserName, setOtherUserName] = useState('Remote User');
  const [participants, setParticipants] = useState<string[]>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = `video-call-participants-${taskId}`;
  const hasOtherParticipant = participants.filter(p => p !== user?.uid).length > 0;

  useEffect(() => {
    const task = getTask(taskId);
    if (task && user) {
        const otherUserId = user.uid === task.creatorId ? task.applicantId : task.creatorId;
        if (otherUserId && allUsers[otherUserId]) {
            setOtherUserName(allUsers[otherUserId].name);
        }
    }
  }, [taskId, user, getTask, allUsers]);

  const leaveCall = () => {
    if (user) {
        const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
        delete currentData[user.uid];
        localStorage.setItem(storageKey, JSON.stringify(currentData));
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }
  };

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support video chat.',
        });
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use video chat.',
        });
      }
    };
    getCameraPermission();

    const handleBeforeUnload = () => {
      leaveCall();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      leaveCall();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!user) return;

    const checkParticipants = () => {
      const now = Date.now();
      const currentData = JSON.parse(localStorage.getItem(storageKey) || '{}');
      
      currentData[user.uid] = now;

      const activeParticipants: string[] = [];
      for (const uid in currentData) {
        if (now - currentData[uid] < 5000) {
          activeParticipants.push(uid);
        } else {
          delete currentData[uid];
        }
      }
      
      localStorage.setItem(storageKey, JSON.stringify(currentData));
      
      setParticipants(prevParticipants => {
        const sortedPrev = [...prevParticipants].sort();
        const sortedActive = [...activeParticipants].sort();
        if (JSON.stringify(sortedPrev) !== JSON.stringify(sortedActive)) {
            return activeParticipants;
        }
        return prevParticipants;
      });
    };

    checkParticipants();
    intervalRef.current = setInterval(checkParticipants, 2000);

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === storageKey) {
            const updatedData = JSON.parse(e.newValue || '{}');
            const activeParticipants: string[] = [];
             for (const uid in updatedData) {
                if (Date.now() - updatedData[uid] < 5000) {
                    activeParticipants.push(uid);
                }
            }
            setParticipants(activeParticipants);
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, storageKey]);

  useEffect(() => {
    if (hasCameraPermission && streamRef.current) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      if (remoteVideoRef.current) {
        // If the other participant is here, show the stream. Otherwise, show nothing.
        remoteVideoRef.current.srcObject = hasOtherParticipant ? streamRef.current : null;
      }
    }
  }, [hasCameraPermission, hasOtherParticipant]);
  
  const toggleMute = () => {
      if (streamRef.current) {
          streamRef.current.getAudioTracks().forEach(track => {
              track.enabled = !track.enabled;
          });
          setIsMuted(!isMuted);
      }
  };

  const toggleVideo = () => {
      if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach(track => {
              track.enabled = !track.enabled;
          });
          setIsVideoOff(!isVideoOff);
      }
  };

  const handleEndCall = () => {
    router.push(`/tasks/${taskId}/chat`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-6">Video Call</h1>
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                
                <div className="bg-black rounded-md aspect-video flex items-center justify-center relative overflow-hidden">
                  <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay />
                  {hasOtherParticipant ? (
                      <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                        {otherUserName}
                      </div>
                  ) : (
                    <div className="text-center text-muted-foreground p-4">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Waiting for {otherUserName} to join...</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-black rounded-md aspect-video flex items-center justify-center relative overflow-hidden">
                  <video ref={localVideoRef} className="w-full h-full object-cover" autoPlay muted />
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-sm px-2 py-1 rounded">
                    {user?.name || 'You'}
                  </div>
                  {!hasCameraPermission && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                         <Alert variant="destructive" className="m-4 max-w-sm">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                              Please allow camera and microphone access to start the video call.
                            </AlertDescription>
                        </Alert>
                     </div>
                  )}
                   {isVideoOff && hasCameraPermission && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <VideoOff className="h-16 w-16 text-white/50"/>
                     </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="mt-6 flex justify-center items-center gap-4">
            <Button variant={isMuted ? 'destructive' : 'secondary'} size="icon" className="h-14 w-14 rounded-full" onClick={toggleMute}>
                {isMuted ? <MicOff /> : <Mic />}
            </Button>
            <Button variant={isVideoOff ? 'destructive' : 'secondary'} size="icon" className="h-14 w-14 rounded-full" onClick={toggleVideo}>
                {isVideoOff ? <VideoOff /> : <VideoIcon />}
            </Button>
            <Button variant="destructive" size="icon" className="h-14 w-14 rounded-full" onClick={handleEndCall}>
                <PhoneOff />
            </Button>
          </div>
           <div className="text-center mt-6">
                <Button variant="link" asChild>
                    <Link href={`/tasks/${taskId}/chat`}>Back to Chat</Link>
                </Button>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
