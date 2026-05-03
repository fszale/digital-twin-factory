import { useState, useMemo } from "react";
import { useSEO } from "@/hooks/use-seo";
import { motion } from "framer-motion";
import { simulateROICurve, LearningRate, HitlIntensity } from "@/lib/roi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Clock, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { TooltipProps } from "recharts";
import type { ROICurvePoint } from "@/lib/roi";

type CurveTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    value: number;
    payload: ROICurvePoint;
  }>;
};

export default function RoiSimulator() {
  useSEO({ title: "ROI Simulator", description: "Simulate improvement curves for digital twin deployments." });

  const [baseline, setBaseline] = useState(10);
  const [target, setTarget] = useState(90);
  const [months, setMonths] = useState(12);
  const [learningRate, setLearningRate] = useState<LearningRate>('steady');
  const [hitl, setHitl] = useState<HitlIntensity>('medium');

  const result = useMemo(() => {
    return simulateROICurve(baseline, target, months, learningRate, hitl);
  }, [baseline, target, months, learningRate, hitl]);

  const CustomTooltip = ({ active, payload, label }: CurveTooltipProps) => {
    if (!active || !payload || payload.length === 0) return null;
    const first = payload[0];
    return (
      <div className="bg-card border border-border p-3 rounded shadow-xl font-mono text-sm">
        <p className="text-muted-foreground mb-1">Month {label}</p>
        <p className="text-primary font-bold">Value: {first.value}</p>
        {first.payload.isInflectionPoint && (
          <p className="text-xs text-accent mt-1">Inflection Point</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-4">Rate-of-Improvement Simulator</h1>
        <p className="text-muted-foreground">
          Digital twins don't operate at peak capacity on day one. They follow an S-curve, learning from human-in-the-loop corrections before accelerating.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card/50 border-border/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="font-mono text-lg">Simulation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Baseline Value</Label>
                  <Input 
                    type="number" 
                    value={baseline} 
                    onChange={e => setBaseline(Number(e.target.value))}
                    className="font-mono bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Value</Label>
                  <Input 
                    type="number" 
                    value={target} 
                    onChange={e => setTarget(Number(e.target.value))}
                    className="font-mono bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Time Horizon (Months)</Label>
                <Input 
                  type="number" 
                  min={3} max={60}
                  value={months} 
                  onChange={e => setMonths(Number(e.target.value))}
                  className="font-mono bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label>Agent Learning Rate</Label>
                <Select value={learningRate} onValueChange={(v: LearningRate) => setLearningRate(v)}>
                  <SelectTrigger className="font-mono bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (Complex domain)</SelectItem>
                    <SelectItem value="steady">Steady (Standard)</SelectItem>
                    <SelectItem value="fast">Fast (Highly structured)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>HITL Intensity</Label>
                <Select value={hitl} onValueChange={(v: HitlIntensity) => setHitl(v)}>
                  <SelectTrigger className="font-mono bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Fast early, lower peak)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="high">High (Slow early, higher peak)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  High human-in-the-loop intensity delays the inflection point but enables deeper learning.
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-card/30 border-border/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <Clock className="h-5 w-5 text-accent mb-2" />
                <div className="text-2xl font-mono font-light">
                  {result.timeTo80Percent ? `${result.timeTo80Percent} mo` : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">To 80% Target</div>
              </CardContent>
            </Card>
            <Card className="bg-card/30 border-border/30">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <div className="text-2xl font-mono font-light">
                  {result.peakImprovementRate}
                </div>
                <div className="text-xs text-muted-foreground mt-1">Peak Δ / mo</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <Card className="flex-1 border-border/50 bg-card/20 backdrop-blur-sm p-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="font-mono text-lg">Projected Trajectory</CardTitle>
                <CardDescription>Saturating logistic curve based on inputs</CardDescription>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border
                ${result.verdict === 'Accelerating' ? 'bg-primary/10 text-primary border-primary/20' : 
                  result.verdict === 'Stabilizing' ? 'bg-accent/10 text-accent border-accent/20' : 
                  'bg-muted/10 text-muted-foreground border-border'}
              `}>
                {result.verdict}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={result.curve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))" 
                    tick={{ fontFamily: 'monospace', fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    domain={['auto', 'auto']}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontFamily: 'monospace', fontSize: 12 }}
                    tickMargin={10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={target} stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
                  
                  {/* Inflection point marker */}
                  {result.curve.map((point) => point.isInflectionPoint && (
                    <ReferenceLine key={`inf-${point.month}`} x={point.month} stroke="hsl(var(--accent))" strokeDasharray="3 3" opacity={0.5} />
                  ))}
                  
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: "hsl(var(--primary))", stroke: "hsl(var(--background))", strokeWidth: 2 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
