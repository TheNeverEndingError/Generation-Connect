
'use client';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTasks } from '@/context/task-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CreditCard, Lock } from 'lucide-react';
import Link from 'next/link';

const paymentSchema = z.object({
  cardNumber: z.string().refine((val) => /^\d{16}$/.test(val), {
    message: 'Card number must be 16 digits.',
  }),
  expiryDate: z.string().refine((val) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(val), {
    message: 'Expiry date must be in MM/YY format.',
  }),
  cvc: z.string().refine((val) => /^\d{3,4}$/.test(val), {
    message: 'CVC must be 3 or 4 digits.',
  }),
  cardName: z.string().min(2, { message: 'Name on card is required.' }),
});

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { getTask, updateTask } = useTasks();

  const taskId = params.id as string;
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      expiryDate: '',
      cvc: '',
      cardName: '',
    },
  });

  useEffect(() => {
    const currentTask = getTask(taskId);
    if (!user || (currentTask && user.uid !== currentTask.creatorId)) {
        toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "You cannot access this page.",
        });
        router.push(`/tasks`);
        return;
    }

    if (currentTask?.isPaid) {
        toast({
            title: "Already Paid",
            description: "This task has already been paid for. You can now assign a helper.",
        });
        router.push(`/tasks/${taskId}/assign`);
        return;
    }

    setTask(currentTask);
    setIsLoading(false);
  }, [taskId, user, getTask, router, toast]);

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    if (!task) return;
    
    updateTask(taskId, { isPaid: true });

    toast({
      title: 'Payment Successful!',
      description: "Your payment has been processed. You can now choose a helper.",
    });
    router.push(`/tasks/${taskId}/assign`);
  }

  if (isLoading || !task) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold">Loading Payment...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12 md:py-20 flex justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl">Secure Payment</CardTitle>
            <CardDescription>Fund the task: &quot;{task.title}&quot;</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4 mb-6 text-center">
                <p className="text-muted-foreground">Amount to Pay</p>
                <p className="text-4xl font-bold text-primary">${task.budget.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Your funds will be held securely and only released to the student after you mark the task as complete.
                </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="cardName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on Card</FormLabel>
                      <FormControl>
                        <Input placeholder="John M. Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="0000 0000 0000 0000" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC / CVV</FormLabel>
                        <FormControl>
                           <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full text-lg py-3 h-auto"
                  size="lg"
                  disabled={form.formState.isSubmitting}
                >
                  <Lock className="mr-2 h-5 w-5" />
                  {form.formState.isSubmitting ? 'Processing...' : `Pay $${task.budget.toFixed(2)}`}
                </Button>
              </form>
            </Form>
          </CardContent>
           <CardFooter className="flex-col items-center gap-2 text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <p>This is a simulated secure payment for presentation purposes.</p>
                </div>
                 <Link href={`/tasks/${taskId}/assign`} className="text-primary hover:underline text-sm mt-2">
                    Skip payment and assign helper
                </Link>
           </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
