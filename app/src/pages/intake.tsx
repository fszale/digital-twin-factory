import { useState, useEffect } from "react";
import { useSEO } from "@/hooks/use-seo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { intakeFormSchema, IntakeFormValues } from "@/lib/validation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Factory } from "lucide-react";
import { motion } from "framer-motion";

const BOOKING_URL = "https://crm.solidcage.com/widget/bookings/filip-szalewicz-fractional-cto-calendar-vfs0lblxh";
const REDIRECT_DELAY_MS = 2500;

export default function Intake() {
  useSEO({ title: "Readiness Review", description: "Request a digital twin readiness review." });

  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(REDIRECT_DELAY_MS / 1000));

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
  });

  const department = watch("department");

  // Hydrate from local storage so users don't lose progress on refresh.
  useEffect(() => {
    const saved = localStorage.getItem("dtf_intake_form");
    if (!saved) return;
    try {
      const data = JSON.parse(saved) as Partial<IntakeFormValues>;
      (Object.keys(data) as Array<keyof IntakeFormValues>).forEach((key) => {
        const value = data[key];
        if (typeof value === "string") setValue(key, value);
      });
    } catch {
      // ignore corrupted local state
    }
  }, [setValue]);

  // After submission, count down and auto-redirect to the booking page.
  useEffect(() => {
    if (!submitted) return;

    const tick = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const redirect = window.setTimeout(() => {
      window.location.href = BOOKING_URL;
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(redirect);
    };
  }, [submitted]);

  const onSubmit = (data: IntakeFormValues) => {
    localStorage.setItem("dtf_intake_form", JSON.stringify(data));
    setSecondsLeft(Math.ceil(REDIRECT_DELAY_MS / 1000));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex-1 w-full max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full"
        >
          <Card className="border-primary/20 bg-card/50 backdrop-blur shadow-2xl shadow-primary/10 text-center py-8">
            <CardHeader>
              <div className="mx-auto bg-primary/15 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-mono">Profile Captured</CardTitle>
              <CardDescription className="text-lg mt-2">
                Sending you to the booking page in {secondsLeft}s…
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                If the redirect doesn't happen automatically, use the button below.
              </p>
              <Button asChild size="lg" className="font-mono w-full md:w-auto h-14 text-lg px-8">
                <a href={BOOKING_URL}>
                  Book Your Session Now
                </a>
              </Button>
              <div className="pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setSubmitted(false)}
                  className="font-mono text-muted-foreground text-xs"
                >
                  ← Edit Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Factory className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-4">Request a Readiness Review</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Provide your operational context below. We'll evaluate your process bottlenecks to determine if a digital twin factory approach fits your organization.
        </p>
      </div>

      <Card className="border-border/50 bg-card/80 backdrop-blur-sm shadow-xl">
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} className="font-mono bg-background/60" />
                {errors.name && <p className="text-destructive text-xs font-mono">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input id="email" type="email" {...register("email")} className="font-mono bg-background/60" />
                {errors.email && <p className="text-destructive text-xs font-mono">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" {...register("company")} className="font-mono bg-background/60" />
                {errors.company && <p className="text-destructive text-xs font-mono">{errors.company.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Function / Department</Label>
                <Select value={department} onValueChange={(v) => setValue("department", v)}>
                  <SelectTrigger className="font-mono bg-background/60">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="engineering">Engineering</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="sales">Sales / RevOps</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-destructive text-xs font-mono">{errors.department.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bottleneck">Biggest Operational Bottleneck</Label>
              <p className="text-xs text-muted-foreground mb-2">Where does your best talent spend time doing repetitive cognitive work?</p>
              <Textarea
                id="bottleneck"
                {...register("bottleneck")}
                className="min-h-[120px] font-mono bg-background/60"
                placeholder="e.g. Our senior engineers spend 40% of their week reviewing boilerplate PRs and resolving basic architectural disputes..."
              />
              {errors.bottleneck && <p className="text-destructive text-xs font-mono">{errors.bottleneck.message}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full font-mono text-lg" disabled={isSubmitting}>
              Submit & Book Your Session
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Submitting takes you straight to <span className="font-mono">crm.solidcage.com</span>. Your context is saved locally so you can edit and resubmit.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
