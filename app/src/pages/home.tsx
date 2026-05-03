import { useSEO } from "@/hooks/use-seo";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, Database, Brain, Network, Factory } from "lucide-react";

const LAYERS = [
  {
    id: "prompt",
    title: "PROMPT",
    repo: "github.com/fszale/agentic-playbook",
    icon: Database,
    description: "The foundational instructions, context formatting, and rules of engagement. Defines 'how to think' before any action is taken."
  },
  {
    id: "agent",
    title: "AGENT",
    repo: "github.com/fszale/agent-kernel",
    icon: Brain,
    description: "The execution engine. Tool usage, loop reasoning, memory retrieval, and planning. The 'kernel' that powers autonomous behavior."
  },
  {
    id: "twin",
    title: "DIGITAL TWIN",
    repo: "github.com/fszale/digital-twin-filip",
    icon: Network,
    description: "A specialized agent infused with my specific operating principles, decision logs, and style. An employee modeled after the founder."
  },
  {
    id: "factory",
    title: "AGENT FACTORY",
    repo: "github.com/fszale/agent-factory",
    icon: Factory,
    description: "The organizational structure. Routing work to multiple digital twins playing specialized roles, with human-in-the-loop review gates."
  }
];

export default function Home() {
  useSEO({ 
    title: "Thesis", 
    description: "The agentic factory thesis. How to build an organization of digital twins." 
  });

  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-12 md:py-24">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-foreground">
            Scale the <span className="text-primary">Operator</span>,<br/>
            Not the <span className="text-accent">Headcount</span>.
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A digital twin factory is an organization where one underlying agent kernel plays many specialized roles. 
            It's not about replacing humans—it's about multiplying the capacity of your best operators with highly instrumented, human-in-the-loop AI employees.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button asChild size="lg" className="font-mono">
              <Link href="/twins">Explore the Twins <ChevronRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-mono">
              <Link href="/architecture">View Architecture</Link>
            </Button>
          </div>
        </motion.div>

        <div className="relative flex flex-col justify-end h-[500px]">
          {LAYERS.map((layer, index) => {
            const isActive = activeLayer === layer.id;
            const isHovered = activeLayer !== null && !isActive;
            const Icon = layer.icon;
            
            return (
              <motion.div
                key={layer.id}
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
                initial={{ opacity: 0, y: 50 }}
                animate={{ 
                  opacity: 1, 
                  y: 0,
                  scale: isActive ? 1.02 : isHovered ? 0.98 : 1,
                  zIndex: isActive ? 10 : LAYERS.length - index
                }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.1,
                  scale: { type: "spring", bounce: 0.4 }
                }}
                className={`
                  relative bg-card border shadow-xl p-6 rounded-xl cursor-pointer
                  transition-colors overflow-hidden
                  ${isActive ? 'border-primary shadow-primary/20' : 'border-border/50 hover:border-accent/50'}
                `}
                style={{
                  marginTop: index === 0 ? 0 : '-3rem'
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted/20 text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-mono font-bold tracking-widest text-lg">{layer.title}</h3>
                  </div>
                  <a 
                    href={`https://${layer.repo}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-mono text-muted-foreground hover:text-accent transition-colors"
                  >
                    {layer.repo.replace('github.com/', '')}
                  </a>
                </div>
                
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="pt-2"
                    >
                      <p className="text-sm text-muted-foreground">{layer.description}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
