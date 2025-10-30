
'use client';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/auth-context';
import { useTasks } from '@/context/task-context';
import { services } from '@/lib/services';

const serviceTypes = services.map(s => s.title);
serviceTypes.push('Other');

const formSchema = z.object({
  title: z.string().min(4, 'Title must be at least 4 characters.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  serviceType: z.string({ required_error: 'Please select a service type.' }),
  location: z.string().min(3, 'Location is required.'),
  budget: z.coerce.number().min(5, 'Budget must be at least $5.'),
  paymentMethod: z.enum(['cash', 'app'], { required_error: 'You need to select a payment method.' }),
  taskDates: z.array(z.date()).min(1, 'At least one date for the task is required.'),
});

export default function PostTaskPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addTask } = useTasks();

  const queryServiceType = searchParams.get('serviceType');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      budget: 15,
      serviceType: queryServiceType && serviceTypes.includes(queryServiceType) ? queryServiceType : undefined,
      taskDates: [],
    },
  });

  const serviceType = form.watch('serviceType');
  

  useEffect(() => {
    if (queryServiceType && serviceTypes.includes(queryServiceType)) {
      form.setValue('serviceType', queryServiceType);
    }
  }, [queryServiceType, form]);

  useEffect(() => {
    if (serviceType) {
      const selectedService = services.find(s => s.title === serviceType);
      if (selectedService) {
        form.setValue('budget', selectedService.price);
      }
    }
  }, [serviceType, form]);

  useEffect(() => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be logged in to post a task.',
      });
      router.push('/');
    } else if (user.isStudent) {
        toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Students cannot post tasks.',
        });
        router.push('/tasks');
    }
  }, [user, router, toast]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Authenticated',
        description: 'You must be logged in to post a task.',
      });
      return;
    }
    const fakeTaskId = `task-${Date.now()}`;
    const newTask = {
      ...values,
      id: fakeTaskId,
      creatorId: user.uid,
      creatorName: user.name,
      status: 'open' as const,
      applicantId: undefined,
      taskDate: values.taskDates[0],
      isPaid: values.paymentMethod === 'cash',
    };
    addTask(newTask);

    toast({
      title: 'Task Posted Successfully!',
      description: "Next, complete the final steps.",
    });

    if (values.paymentMethod === 'app') {
      router.push(`/tasks/${fakeTaskId}/payment`);
    } else {
      router.push(`/tasks/${fakeTaskId}/assign`);
    }
  }

  if (!user || user.isStudent) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-bold">Redirecting...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12 md:py-20 flex justify-center">
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
            Post a New Task
          </h1>
          <p className="text-center text-muted-foreground mb-8">Tell us what you need done. We'll help you find the right student for the job.</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Help planting my garden"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the task in detail. What needs to be done? Any specific requirements?"
                        className="resize-y min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                  control={form.control}
                  name="taskDates"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Task Dates</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value?.length && "text-muted-foreground"
                              )}
                            >
                              {field.value?.length ? (
                                `${field.value.length} date(s) selected`
                              ) : (
                                <span>Pick one or more dates</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="multiple"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setDate(new Date().getDate() - 1))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Where is the task located?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

               <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="cash" />
                          </FormControl>
                          <FormLabel className="font-normal">
                           In-person with cash
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="app" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Secure online payment
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full text-lg py-3 h-auto"
                size="lg"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? 'Posting...' : 'Continue'}
              </Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
