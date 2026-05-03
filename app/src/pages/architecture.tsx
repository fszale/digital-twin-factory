import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowRight,
  Bot,
  Database as _Database,
  Layers,
  RefreshCw,
  Shield,
  UserCheck,
} from "lucide-react";

void _Database;

type NodeId = "entry" | "router" | "execution" | "gate" | "hitl" | "memory";

type NodeDef = {
  title: string;
  icon: LucideIcon;
  color: string;
  desc: string;
  detail: string;
};

const NODES: Record<NodeId, NodeDef> = {
  entry: {
    title: "Work Entry",
    icon: Layers,
    color: "text-muted-foreground",
    desc: "Slack / Email / Cron",
    detail: "Tasks enter the factory through standard human interfaces. The factory listens to Slack channels, email inboxes, or scheduled cron jobs."
  },
  router: {
    title: "Role Routing",
    icon: ArrowRight,
    color: "text-accent",
    desc: "Classification",
    detail: "The request is analyzed and routed to the correct specialized role (e.g. CTO, Operator, Analyst) based on the context."
  },
  execution: {
    title: "Execution",
    icon: Bot,
    color: "text-primary",
    desc: "digital-twin-filip",
    detail: "The underlying agent kernel loads the specific role's prompt, tools, and guardrails, then executes the task autonomously."
  },
  gate: {
    title: "Review Gate",
    icon: Shield,
    color: "text-accent",
    desc: "Policy Check",
    detail: "Before any external action is taken (sending email, pushing code), the output is checked against the role's guardrails."
  },
  hitl: {
    title: "HITL Approval",
    icon: UserCheck,
    color: "text-primary",
    desc: "Human in the Loop",
    detail: "A human reviews the proposed action in a dashboard or Slack message. They can approve, reject, or provide feedback."
  },
  memory: {
    title: "Improvement Loop",
    icon: RefreshCw,
    color: "text-muted-foreground",
    desc: "Vector DB",
    detail: "If the human provides feedback or rejects, the agent kernel updates its memory to avoid the mistake next time."
  }
};

export default function Architecture() {
  useSEO({ title: "Architecture", description: "The agent factory workflow." });
  const [activeNode, setActiveNode] = useState<NodeId>("execution");

  const NodeBlock = ({ id }: { id: NodeId }) => {
    const node = NODES[id];
    const Icon = node.icon;
    const isActive = activeNode === id;

    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setActiveNode(id)}
        className={`
          flex flex-col items-center p-4 rounded-xl border-2 transition-all w-40
          ${isActive ? "border-primary bg-primary/10 shadow-lg shadow-primary/20" : "border-border/50 bg-card hover:border-accent/50"}
        `}
      >
        <div className={`p-3 rounded-full mb-3 ${isActive ? "bg-primary/20" : "bg-muted/10"} ${node.color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="font-mono font-bold text-sm text-center leading-tight mb-1">{node.title}</div>
        <div className="text-[10px] text-muted-foreground font-mono text-center">{node.desc}</div>
      </motion.button>
    );
  };

  const Edge = () => (
    <div className="flex items-center justify-center w-8 md:w-16 h-full relative">
      <div className="h-0.5 w-full bg-border/50"></div>
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-accent"
        animate={{
          left: ["0%", "100%"],
          opacity: [0, 1, 0]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );

  const ActiveIcon = NODES[activeNode].icon;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-mono font-bold mb-4">Factory Architecture</h1>
        <p className="text-muted-foreground max-w-2xl">
          The flow of work through the agent factory. Click any node to inspect its function.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 overflow-x-auto pb-8">
          <div className="min-w-[600px] py-8 flex flex-col items-center">

            {/* Top Row */}
            <div className="flex items-center">
              <NodeBlock id="entry" />
              <Edge />
              <NodeBlock id="router" />
              <Edge />
              <div className="relative">
                <motion.div
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -inset-4 bg-primary/5 rounded-2xl -z-10 border border-primary/20 border-dashed"
                />
                <NodeBlock id="execution" />
              </div>
            </div>

            {/* Down edge */}
            <div className="flex w-full justify-end pr-20 h-16 relative">
              <div className="w-0.5 h-full bg-border/50 absolute right-20"></div>
              <motion.div
                className="absolute w-2 h-2 rounded-full bg-accent right-[76px]"
                animate={{
                  top: ["0%", "100%"],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.5
                }}
              />
            </div>

            {/* Bottom Row (Right to Left) */}
            <div className="flex items-center flex-row-reverse">
              <NodeBlock id="gate" />
              <div className="flex items-center justify-center w-8 md:w-16 h-full relative flex-row-reverse">
                <div className="h-0.5 w-full bg-border/50"></div>
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-primary"
                  animate={{
                    right: ["0%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                />
              </div>
              <NodeBlock id="hitl" />
              <div className="flex items-center justify-center w-8 md:w-16 h-full relative flex-row-reverse">
                <div className="h-0.5 w-full bg-border/50"></div>
                <motion.div
                  className="absolute w-2 h-2 rounded-full bg-muted-foreground"
                  animate={{
                    right: ["0%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1.5 }}
                />
              </div>
              <NodeBlock id="memory" />
            </div>

            {/* Up edge (Loop back) */}
            <div className="w-full flex justify-start pl-20 h-24 relative">
              <svg className="absolute left-20 bottom-0 h-full w-full pointer-events-none" style={{ zIndex: -1 }}>
                <path
                  d="M 0,100 C 0,0 200,0 200,0"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="opacity-50"
                />
              </svg>
            </div>

          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="border-accent/30 bg-card/50 backdrop-blur shadow-xl sticky top-24">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <ActiveIcon className={`h-6 w-6 ${NODES[activeNode].color}`} />
                    <CardTitle className="font-mono text-xl">{NODES[activeNode].title}</CardTitle>
                  </div>
                  <CardDescription className="font-mono text-xs uppercase tracking-wider text-primary">
                    {NODES[activeNode].desc}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {NODES[activeNode].detail}
                  </p>

                  {activeNode === "execution" && (
                    <div className="mt-6 p-4 bg-background border border-border rounded-lg">
                      <div className="font-mono text-xs font-bold text-accent mb-2">KERNEL SOURCE</div>
                      <code className="text-xs text-muted-foreground break-all">
                        github.com/fszale/agent-kernel
                      </code>
                    </div>
                  )}
                  {activeNode === "memory" && (
                    <div className="mt-6 p-4 bg-background border border-border rounded-lg">
                      <div className="font-mono text-xs font-bold text-accent mb-2">VECTOR STORE</div>
                      <p className="text-xs text-muted-foreground">
                        Stores successful completions and corrections to fine-tune future executions.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
