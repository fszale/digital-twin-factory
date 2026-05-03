import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { useSEO } from "@/hooks/use-seo";
import { calculateScore, DimensionScores, ScoreResult } from "@/lib/scoring";
import { encodeScoresToUrl, decodeScoresFromUrl } from "@/lib/share-link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, BarChart3, ChevronRight } from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

type FormValues = {
  processName: string;
  description: string;
  department: string;
  scores: DimensionScores;
};

const DEFAULT_SCORES: DimensionScores = {
  revenueGeneration: 5,
  costSavings: 5,
  riskMitigation: 5,
  dataReadiness: 5,
  adoptionDifficulty: 5,
  roiPotential: 5,
};

export default function Scorer() {
  useSEO({ 
    title: "Use Case Scorer", 
    description: "Evaluate business processes for agent factory readiness." 
  });

  const { toast } = useToast();
  const [result, setResult] = useState<ScoreResult | null>(null);
  
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>({
    defaultValues: {
      processName: "",
      description: "",
      department: "",
      scores: DEFAULT_SCORES
    }
  });

  const scores = watch("scores");
  const processName = watch("processName");
  const description = watch("description");
  const department = watch("department");

  // Read from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const decoded = decodeScoresFromUrl(params);
    
    if (decoded.scores) {
      reset({
        processName: decoded.processName,
        description: decoded.description,
        department: decoded.department,
        scores: decoded.scores
      });
      // Auto-score if loaded from URL
      setResult(calculateScore(decoded.scores));
    }
  }, [reset]);

  const onSubmit = (data: FormValues) => {
    const res = calculateScore(data.scores);
    setResult(res);
    
    // Scroll to results on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShare = () => {
    const url = encodeScoresToUrl(scores, processName, description, department);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Scorecard URL copied to clipboard.",
    });
  };

  const chartData = [
    { subject: 'Revenue', A: scores.revenueGeneration, fullMark: 10 },
    { subject: 'Cost', A: scores.costSavings, fullMark: 10 },
    { subject: 'Risk Mitig.', A: scores.riskMitigation, fullMark: 10 },
    { subject: 'Data Ready', A: scores.dataReadiness, fullMark: 10 },
    { subject: 'Ease', A: 10 - scores.adoptionDifficulty, fullMark: 10 }, // inverted for chart
    { subject: 'ROI', A: scores.roiPotential, fullMark: 10 },
  ];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-3">Use Case Scorer</h1>
        <p className="text-muted-foreground">
          Quantify the readiness of a business process for agentic automation.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        <div className={`lg:col-span-7 transition-all duration-500 ${result ? 'order-2 lg:order-1' : 'lg:col-span-8 lg:col-start-3'}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-primary">1. Process Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="processName">Process Name</Label>
                  <Input 
                    id="processName" 
                    placeholder="e.g. Vendor Invoice Processing" 
                    {...register("processName", { required: true })}
                    className="font-mono bg-background/50"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="department">Department</Label>
                    <Select value={department} onValueChange={(val) => setValue("department", val)}>
                      <SelectTrigger className="font-mono bg-background/50">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engineering">Engineering</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Briefly describe what this process does and who is involved today..."
                    className="min-h-[80px] font-mono text-sm bg-background/50"
                    {...register("description")}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="font-mono text-lg text-primary">2. Dimensions (0-10)</CardTitle>
                <CardDescription>Rate the process on these six factors.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                
                {[
                  { key: "revenueGeneration", label: "Revenue Generation", desc: "Direct impact on top-line growth (0 = none, 10 = massive)" },
                  { key: "costSavings", label: "Cost Savings", desc: "Reduction in OPEX or manual hours (0 = none, 10 = huge)" },
                  { key: "riskMitigation", label: "Risk Mitigation", desc: "Reduces compliance, security, or error risk" },
                  { key: "dataReadiness", label: "Data Readiness", desc: "Are APIs and structured data available? (0 = totally siloed, 10 = clean APIs)" },
                  { key: "adoptionDifficulty", label: "Adoption Difficulty", desc: "Change management required (0 = seamless, 10 = highly resistant org)" },
                  { key: "roiPotential", label: "ROI Potential", desc: "Overall return on investment estimate" },
                ].map((dim) => (
                  <div key={dim.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="font-mono text-sm">{dim.label}</Label>
                      <span className="font-mono text-accent font-bold">
                        {scores[dim.key as keyof DimensionScores]}/10
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{dim.desc}</p>
                    <Slider
                      value={[scores[dim.key as keyof DimensionScores]]}
                      min={0}
                      max={10}
                      step={1}
                      onValueChange={(vals) => setValue(`scores.${dim.key as keyof DimensionScores}`, vals[0])}
                      className="py-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" size="lg" className="w-full font-mono text-lg">
                <BarChart3 className="mr-2 h-5 w-5" />
                Generate Scorecard
              </Button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className={`lg:col-span-5 transition-all duration-500 order-1 lg:order-2 ${result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none hidden lg:block'}`}>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticky top-24 space-y-6"
            >
              <Card className="border-accent/50 shadow-lg shadow-accent/10 overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-primary to-accent"></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardDescription className="font-mono text-xs uppercase tracking-wider">Composite Score</CardDescription>
                      <CardTitle className="text-5xl font-mono mt-1 font-light tracking-tighter">
                        {result.compositeScore}<span className="text-2xl text-muted-foreground">/10</span>
                      </CardTitle>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleShare} title="Share Scorecard">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`
                    mt-4 p-3 rounded-md font-mono text-sm border font-bold text-center
                    ${result.verdict.includes("Strong") ? 'bg-primary/10 border-primary text-primary' : 
                      result.verdict.includes("Defer") ? 'bg-destructive/10 border-destructive text-destructive' : 
                      'bg-accent/10 border-accent text-accent'}
                  `}>
                    {result.verdict}
                  </div>

                  <div className="h-[250px] w-full mt-6 -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                        <Radar
                          name="Score"
                          dataKey="A"
                          stroke="hsl(var(--accent))"
                          fill="hsl(var(--accent))"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-2 space-y-3">
                    <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 pb-2">Recommended Next Steps</h4>
                    <ul className="space-y-2">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}
