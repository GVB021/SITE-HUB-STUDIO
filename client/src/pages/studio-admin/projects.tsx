import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Film,
  Plus,
  ChevronDown,
  ChevronUp,
  Calendar,
  Mic,
  Users,
  PlayCircle,
} from "lucide-react";

const studioId = "demo-studio";

async function fetchProjects() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  return res.json();
}

async function fetchProjectSessions(projectId: string) {
  // Mock: replace with real endpoint if available
  return [
    { id: "1", title: "Sessão 1", scheduledAt: new Date().toISOString(), status: "scheduled" },
    { id: "2", title: "Sessão 2", scheduledAt: new Date(Date.now() + 86400000).toISOString(), status: "completed" },
  ];
}

async function createProject(data: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export default function StudioAdminProjects() {
  const [newProjectOpen, setNewProjectOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [newProject, setNewProject] = useState({ name: "", description: "" });

  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["studio-admin-projects", studioId],
    queryFn: fetchProjects,
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-admin-projects"] });
      setNewProjectOpen(false);
      setNewProject({ name: "", description: "" });
    },
  });

  const toggleExpanded = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "planned": return "bg-blue-600/20 text-blue-300 border-blue-600/30";
      case "in_progress": return "bg-amber-600/20 text-amber-300 border-amber-600/30";
      case "completed": return "bg-emerald-600/20 text-emerald-300 border-emerald-600/30";
      default: return "bg-slate-600/20 text-slate-300 border-slate-600/30";
    }
  };
  const statusLabel = (status: string) => {
    switch (status) {
      case "planned": return "PLANEJADO";
      case "in_progress": return "EM ANDAMENTO";
      case "completed": return "CONCLUÍDO";
      default: return status.toUpperCase();
    }
  };

  // Mock sessions per project
  const sessionsByProject: Record<string, any[]> = {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Projetos</h1>
        <Sheet open={newProjectOpen} onOpenChange={setNewProjectOpen}>
          <SheetTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
            <SheetHeader>
              <SheetTitle className="text-white">Criar Novo Projeto</SheetTitle>
              <SheetDescription className="text-slate-400">Preencha os dados do novo projeto.</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="project-name">Nome</Label>
                <Input id="project-name" value={newProject.name} onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
              <div>
                <Label htmlFor="project-desc">Descrição</Label>
                <Input id="project-desc" value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} className="bg-slate-800 border-white/10" />
              </div>
            </div>
            <SheetFooter>
              <Button variant="outline" onClick={() => setNewProjectOpen(false)}>Cancelar</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => createMutation.mutate(newProject)}>Criar</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardContent className="p-8 text-center">
            <Film className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Nenhum projeto encontrado.</p>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setNewProjectOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
            <Card key={project.id} className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white truncate">{project.name}</CardTitle>
                  <Badge className={statusColor(project.status)}>{statusLabel(project.status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>— sessões</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Mic className="w-4 h-4" />
                      <span>— takes</span>
                    </div>
                  </div>
                  <Collapsible open={expandedProjects.has(project.id)} onOpenChange={() => toggleExpanded(project.id)}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between text-emerald-400 hover:text-emerald-300">
                        <span>Sessões</span>
                        {expandedProjects.has(project.id) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-3">
                      <Separator className="bg-white/10 mb-3" />
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {/* Mock sessions */}
                        {Array.from({ length: 3 }, (_, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-slate-800/40 rounded-lg border border-white/5">
                            <div>
                              <p className="text-white text-sm font-medium">Sessão {i + 1}</p>
                              <p className="text-xs text-slate-400">{new Date(Date.now() + i * 86400000).toLocaleDateString("pt-BR")}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <PlayCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
