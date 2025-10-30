
'use client';

import Link from 'next/link';
import { Menu, LogOut, User as UserIcon, Repeat, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useNotifications } from '@/context/notification-context';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const TEST_USER_IDS = [
  'elder1', 'student1', 'student2', 'student3',
  'student4', 'student5', 'student6', 'student7'
];

export default function Header() {
  const { user, logout, switchUser } = useAuth();
  const { notifications, markAsRead } = useNotifications();
  const router = useRouter();

  const isTestAccount = user ? TEST_USER_IDS.includes(user.uid) : false;

  const handleLogout = () => {
    if (isTestAccount) return;
    logout();
    router.push('/');
  };

  const getInitials = (name?: string | null) => {
    return name?.split(' ').map(n => n[0]).join('') ?? 'U';
  };
  
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleNotificationClick = (notificationId: string, link: string) => {
    markAsRead(notificationId);
    router.push(link);
  }

  const NotificationBell = () => (
     <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadNotifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Notifications</h4>
            <p className="text-sm text-muted-foreground">
              You have {unreadNotifications.length} unread messages.
            </p>
          </div>
          <div className="grid gap-2">
            {notifications.length > 0 ? notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n.id, n.link)}
                className={cn(
                  "grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0 cursor-pointer",
                  n.read && 'opacity-60'
                )}
              >
                {!n.read && <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />}
                <div className="space-y-1 col-start-2">
                  <p className="text-sm font-medium leading-none">
                    {n.message}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(n.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : <p className="text-sm text-muted-foreground">No new notifications.</p>}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <header className="bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Generations Connect
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-lg">
          <Link href="/#how-it-works" className="text-muted-foreground hover:text-primary transition duration-300">
            How It Works
          </Link>
          <Link href="/#services" className="text-muted-foreground hover:text-primary transition duration-300">
            Services
          </Link>
          <Link href="/tasks" className="text-muted-foreground hover:text-primary transition duration-300">
              My Tasks
          </Link>
          {user && !user.isStudent && (
            <Link href="/post-a-task" className="text-muted-foreground hover:text-primary transition duration-300">
                Post a Task
            </Link>
          )}
        </nav>
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <>
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={switchUser} title="Switch User">
                <Repeat className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="w-full">
                           <DropdownMenuItem onClick={handleLogout} disabled={isTestAccount} className={cn(isTestAccount && "cursor-not-allowed")}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                          </DropdownMenuItem>
                        </div>
                      </TooltipTrigger>
                       {isTestAccount && (
                        <TooltipContent side="left" align="center">
                          <p>Logging out of test accounts is disabled.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="h-10"></div>
          )}
        </div>
        <div className="md:hidden flex items-center gap-2">
          {user && <NotificationBell />}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 pt-10">
                <SheetClose asChild><Link href="/#how-it-works" className="text-xl text-muted-foreground hover:text-primary transition duration-300 py-2">How It Works</Link></SheetClose>
                <SheetClose asChild><Link href="/#services" className="text-xl text-muted-foreground hover:text-primary transition duration-300 py-2">Services</Link></SheetClose>
                <SheetClose asChild><Link href="/tasks" className="text-xl text-muted-foreground hover:text-primary transition duration-300 py-2">My Tasks</Link></SheetClose>
                {user && !user.isStudent && (
                  <SheetClose asChild>
                    <Link href="/post-a-task" className="text-xl text-muted-foreground hover:text-primary transition duration-300 py-2">Post a Task</Link>
                  </SheetClose>
                )}
                <div className="border-t pt-6 mt-4 space-y-4">
                  {user ? (
                    <>
                       <SheetClose asChild>
                          <Link href="/profile" className="flex items-center text-xl text-muted-foreground hover:text-primary transition duration-300 py-2">
                            <UserIcon className="mr-2 h-5 w-5" /> My Profile
                          </Link>
                        </SheetClose>
                      <SheetClose asChild>
                         <div className="flex items-center gap-4">
                           <Button variant="outline" className="flex-1 text-lg" onClick={switchUser}>
                             <Repeat className="mr-2 h-5 w-5" /> Switch User
                           </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-full">
                                    <Button variant="ghost" className="text-xl justify-start w-full" onClick={handleLogout} disabled={isTestAccount}>
                                      <LogOut className="mr-2 h-5 w-5" />
                                      Log Out
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                {isTestAccount && (
                                  <TooltipContent>
                                    <p>Logout disabled for test accounts.</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                         </div>
                      </SheetClose>
                    </>
                  ) : (
                     <div className="h-10"></div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
