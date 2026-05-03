import { z } from 'zod';

export const intakeFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  company: z.string().min(2, "Company must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  department: z.string().min(1, "Please select a department."),
  bottleneck: z.string().min(10, "Please provide more detail about your bottleneck (min 10 chars).")
});

export type IntakeFormValues = z.infer<typeof intakeFormSchema>;
