
'use client';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
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
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const TEST_USER_IDS = [
  'elder1', 'student1', 'student2', 'student3',
  'student4', 'student5', 'student6', 'student7'
];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [description, setDescription] = useState(user?.description ?? '');
  const [isAvailable, setIsAvailable] = useState(user?.availability?.isAvailable ?? true);
  const [unavailableDays, setUnavailableDays] = useState(user?.availability?.unavailableDays ?? []);

  const isTestAccount = user ? TEST_USER_IDS.includes(user.uid) : false;

  useEffect(() => {
    if (user?.availability) {
      setIsAvailable(user.availability.isAvailable);
      setUnavailableDays(user.availability.unavailableDays);
    }
    if (user?.description) {
      setDescription(user.description);
    }
  }, [user]);

  const handleDayChange = (dayId: string, checked: boolean) => {
    setUnavailableDays(prev => 
      checked ? [...prev, dayId] : prev.filter(d => d !== dayId)
    );
  };
  
  const handleSaveChanges = () => {
    if (!user) return;
    updateUser(user.uid, {
      description,
      availability: {
        isAvailable,
        unavailableDays,
      },
    });
    toast({
      title: "Profile Saved!",
      description: "Your profile and availability settings have been updated.",
    });
  };

  const handleDeleteAccount = () => {
    logout();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-bold">Could not load your profile.</h1>
           <p className="text-muted-foreground mt-2">Please log in to view your profile.</p>
           <Button asChild className="mt-4">
              <a href="/">Log In</a>
           </Button>
        </main>
        <Footer />
      </div>
    );
  }
  
  const formattedRating = user.rating ? user.rating.toFixed(1) : 'N/A';
  const ratingCount = user.ratingCount ?? 0;


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12 md:py-20">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-3xl">My Profile</CardTitle>
                        <CardDescription>View and manage your account details.</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-lg">{user.isStudent ? 'Student' : 'Elder'}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{user.name}</p>
                </div>
                <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{user.email}</p>
                </div>
                 {user.isStudent && (
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">My Rating</p>
                        <div className="flex items-center gap-2">
                             <Star className="w-5 h-5 text-yellow-400 fill-current" />
                             <p className="text-lg font-semibold">{formattedRating}</p>
                             <p className="text-muted-foreground">({ratingCount} {ratingCount === 1 ? 'rating' : 'ratings'})</p>
                        </div>
                    </div>
                 )}
            </CardContent>
            <CardFooter className="flex justify-end bg-muted/50 pt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div tabIndex={isTestAccount ? 0 : -1}>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isTestAccount}>Delete Account</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                (fake) account data from this session.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                Yes, delete my account
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TooltipTrigger>
                  {isTestAccount && (
                    <TooltipContent>
                      <p>Deleting test accounts is disabled.</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
            </Card>

            {user.isStudent && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-3xl">Student Settings</CardTitle>
                        <CardDescription>Manage your public profile and work schedule.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                         <div>
                            <Label htmlFor="description" className="text-lg font-medium">Profile Description</Label>
                            <p className="text-sm text-muted-foreground mb-4">Introduce yourself to potential clients. Let them know about your skills and why you'd be a great helper.</p>
                            <Textarea
                                id="description"
                                placeholder="Hi! I'm a friendly and reliable student eager to help out..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                             <Label htmlFor="availability-toggle" className="text-lg">
                                Available for new tasks
                            </Label>
                            <Switch
                                id="availability-toggle"
                                checked={isAvailable}
                                onCheckedChange={setIsAvailable}
                            />
                        </div>
                         <div>
                            <Label className="text-lg font-medium">Weekly Unavailability</Label>
                            <p className="text-sm text-muted-foreground mb-4">Select the days you are typically NOT available.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {daysOfWeek.map(day => (
                                    <div key={day.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={day.id}
                                          checked={unavailableDays.includes(day.id)}
                                          onCheckedChange={(checked) => handleDayChange(day.id, !!checked)}
                                        />
                                        <label
                                            htmlFor={day.id}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {day.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                     <CardFooter className="bg-muted/50 pt-6 flex justify-end">
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </CardFooter>
                </Card>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
