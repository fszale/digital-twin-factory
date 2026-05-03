import { useSEO } from "@/hooks/use-seo";
import { motion } from "framer-motion";
import { Cpu, CheckCircle2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  {
    id: "operator",
    title: "Principal Operator",
    context: "Runs the operating cadence to ensure the team executes against top priorities without dropping context.",
    capabilities: [
      "Weekly priorities alignment",
      "Blocker triage & routing",
      "Decision log maintenance",
      "Follow-up tracking & nagging"
    ],
    guardrails: [
      "No task reassignment without manager approval",
      "Cannot override P0 incident priorities"
    ],
    sample: `[TRIAGE LOG]
Priority: HIGH
Blocker: Auth API rate limiting
Action: Escalated to infra-team via Slack
Status: Waiting for HITL approval to apply temporary limit increase.`
  },
  {
    id: "cto",
    title: "Fractional CTO",
    context: "Provides technical strategy, reviews architecture, and audits hiring loops for engineering roles.",
    capabilities: [
      "Architecture design review",
      "Vendor selection matrices",
      "Hiring loop technical screens",
      "Tech debt quantification"
    ],
    guardrails: [
      "All architecture decisions require human sign-off",
      "No direct database access"
    ],
    sample: `[ARCHITECTURE REVIEW]
Component: Events PubSub
Verdict: REJECTED
Reason: Proposed Redis stream lacks persistence required by audit logs. 
Recommendation: Pivot to Kafka or Postgres WAL tailing.`
  },
  {
    id: "manufacturing",
    title: "Manufacturing AI Advisor",
    context: "Surfaces high-ROI use cases on the factory floor, scoring potential implementations and designing pilots.",
    capabilities: [
      "Use case ROI scoring",
      "Pilot scope design",
      "Data readiness auditing",
      "Hardware integration planning"
    ],
    guardrails: [
      "Cannot approve budget >$0",
      "Must flag safety-critical processes for manual review"
    ],
    sample: `[USE CASE SCORECARD]
Process: Visual Defect Inspection
Score: 8.5/10 (Strong Candidate)
Risk: Hardware latency (Cameras -> Edge inference)
Next Step: Deploy shadow-mode pilot on Line 3.`
  },
  {
    id: "engineering",
    title: "Engineering Acceleration Advisor",
    context: "Reviews code, audits repositories for agent-readiness, and identifies bottlenecks in developer velocity.",
    capabilities: [
      "Code review packaging",
      "Agent-readiness repo audits",
      "Dev velocity bottleneck detection",
      "CI/CD pipeline optimization"
    ],
    guardrails: [
      "No production deploys without HITL approval",
      "Read-only access to source control"
    ],
    sample: `[REPO AUDIT]
Target: digital-twin-portal
Agent-Readiness: 65%
Issues: 
- Missing structured API schemas
- README lacks setup instructions for agents
Action: Generated PR #42 with OpenAPI spec stubs.`
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function TwinsGallery() {
  useSEO({ title: "Twin Gallery", description: "Explore the different roles powered by the digital-twin-filip kernel." });

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-4">
          One Kernel. <span className="text-accent">Four Roles.</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Every specialized role below is powered by the exact same underlying logic engine (<code className="text-primary bg-primary/10 px-1 py-0.5 rounded">digital-twin-filip</code>). 
          Only the prompt context, tools, and guardrails change.
        </p>
        
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-card border border-border rounded-full shadow-sm">
            <Cpu className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm font-semibold">Shared Agent Kernel V2.4</span>
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          </div>
        </div>
        
        {/* Visual Connector Line */}
        <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent mx-auto mt-4"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-2 gap-8"
      >
        {ROLES.map((role) => (
          <motion.div key={role.id} variants={itemVariants}>
            <Card className="h-full border-border/50 hover:border-accent/50 transition-colors hover:shadow-lg hover:shadow-accent/5 flex flex-col bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="font-mono text-xl text-foreground">{role.title}</CardTitle>
                    <CardDescription className="mt-2 text-sm text-muted-foreground">{role.context}</CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono bg-background">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-primary" /> Capabilities
                  </h4>
                  <ul className="space-y-2">
                    {role.capabilities.map((cap, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-accent mt-0.5">•</span>
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3 text-destructive" /> Guardrails
                  </h4>
                  <ul className="space-y-2">
                    {role.guardrails.map((rail, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive/70 mt-0.5">↳</span>
                        <span>{rail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-4">
                  <div className="bg-background rounded-md p-3 border border-border/50 font-mono text-xs text-muted-foreground whitespace-pre-wrap overflow-x-auto shadow-inner">
                    {role.sample}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
