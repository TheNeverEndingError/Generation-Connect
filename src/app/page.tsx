
'use client';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { services } from '@/lib/services';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const heroImage = PlaceHolderImages.find(p => p.id === 'student-helping');

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  const handleServiceClick = (serviceTitle: string) => {
    if (user && !user.isStudent) {
      router.push(`/post-a-task?serviceType=${encodeURIComponent(serviceTitle)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section
          className="py-20 md:py-32 hero-bg"
          style={{ '--hero-bg-image': `url(${heroImage?.imageUrl})` } as React.CSSProperties}
        >
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              Connecting Generations, Building Community.
            </h1>
            <p className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Get friendly, reliable help from local high schoolers for your everyday tasks. It's simple, safe, and strengthens our neighborhood connections.
            </p>
            <div className="mt-8">
              <Button asChild size="lg" className="text-xl px-8 py-4 h-auto rounded-xl transform hover:scale-105 shadow-xl">
                <Link href={user && !user.isStudent ? '/post-a-task' : '/tasks'}>Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-card">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">Get Help in 3 Easy Steps</h2>
              <p className="mt-2 text-lg text-muted-foreground">Quickly find the perfect student for your needs.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-10 text-center">
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-secondary text-primary rounded-full text-3xl font-bold mb-4">1</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Post a Task</h3>
                <p className="text-lg text-muted-foreground">Choose a service you need help with, describe the task, and suggest a fair payment.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-secondary text-primary rounded-full text-3xl font-bold mb-4">2</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Connect with a Student</h3>
                <p className="text-lg text-muted-foreground">Choose from capable and reliable high schoolers in your area. You can view profiles and chat safely.</p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 mx-auto bg-secondary text-primary rounded-full text-3xl font-bold mb-4">3</div>
                <h3 className="text-2xl font-semibold text-foreground mb-2">Task Completed!</h3>
                <p className="text-lg text-muted-foreground">Your helper completes the job, and you can pay in person or securely through the platform.<br></br> It's that easy!</p>
              </div>
            </div>
             <div className="mt-12 text-center">
                <Button asChild size="lg" className="text-2xl font-bold px-10 py-5 h-auto rounded-xl shadow-lg">
                    <Link href="/post-a-task">Post a Task</Link>
                </Button>
            </div>
          </div>
        </section>

        <section id="services" className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground">What Can We Help With?</h2>
              <p className="mt-2 text-lg text-muted-foreground">Explore popular tasks our student helpers can assist you with.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                  <Card
                    key={service.id}
                    onClick={() => handleServiceClick(service.title)}
                    className={cn(
                        "overflow-hidden shadow-lg transform hover:-translate-y-2 transition duration-300 group flex flex-col",
                        user && !user.isStudent && "cursor-pointer"
                    )}
                  >
                    <CardContent className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold text-foreground mb-2">{service.title}</h3>
                      <p className="text-lg text-muted-foreground mb-4 flex-grow">{service.description}</p>
                      <p className="text-lg font-semibold text-primary mb-4">Starting from ${service.price}/hr {service.priceSuffix}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>

        {(!user || user.isStudent) && (
          <section id="students" className="py-20 bg-card">
            <div className="container mx-auto px-6">
              <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-foreground">Are You a Student?</h2>
                <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">Earn money, gain valuable experience, and make a positive impact in your community. Helping a senior is a rewarding way to spend your free time.</p>
                <ul className="mt-6 space-y-4 text-lg inline-block text-left max-w-xl mx-auto">
                  <li className="flex items-start">
                    <CheckCircle2 className="w-7 h-7 text-primary mr-3 flex-shrink-0 mt-1" />
                    <span><span className="font-semibold">Flexible Hours:</span> Work when you want, around your school schedule.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-7 h-7 text-primary mr-3 flex-shrink-0 mt-1" />
                    <span><span className="font-semibold">Earn Money:</span> Get paid fairly for the help you provide.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-7 h-7 text-primary mr-3 flex-shrink-0 mt-1" />
                    <span><span className="font-semibold">Build Your Resume:</span> Develop skills like responsibility, communication, and time management.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-7 h-7 text-primary mr-3 flex-shrink-0 mt-1" />
                    <span><span className="font-semibold">Get Community Service Hours:</span> Get service hours and community engagment for college resumes</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
