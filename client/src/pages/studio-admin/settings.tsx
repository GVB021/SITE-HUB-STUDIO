import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Upload,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";

const studioId = "demo-studio";

async function fetchSettings() {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

async function updateSettings(data: any) {
  const res = await fetch(`/api/studio-admin/studios/${studioId}/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}

async function requestStudioDeletion() {
  // Mock: replace with real endpoint
  console.log("Request studio deletion");
  return true;
}

export default function StudioAdminSettings() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
    website: "",
    instagram: "",
    linkedin: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["studio-admin-settings", studioId],
    queryFn: fetchSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        name: (settings as any).name || "",
        logoUrl: (settings as any).logoUrl || "",
        website: (settings as any).website || "",
        instagram: (settings as any).instagram || "",
        linkedin: (settings as any).linkedin || "",
        description: (settings as any).description || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({ mutationFn: updateSettings, onSuccess: () => queryClient.invalidateQueries({ queryKey: ["studio-admin-settings"] }) });
  const deleteMutation = useMutation({ mutationFn: requestStudioDeletion, onSuccess: () => { setDeleteDialogOpen(false); setDeleteConfirmText(""); } });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setLogoFile(file);
  };

  const planColor = (plan: string) => {
    switch (plan) {
      case "basic": return "bg-slate-600/20 text-slate-300 border-slate-600/30";
      case "pro": return "bg-blue-600/20 text-blue-300 border-blue-600/30";
      case "enterprise": return "bg-purple-600/20 text-purple-300 border-purple-600/30";
      default: return "bg-slate-600/20 text-slate-300 border-slate-600/30";
    }
  };
  const planLabel = (plan: string) => {
    switch (plan) {
      case "basic": return "FREE";
      case "pro": return "PRO";
      case "enterprise": return "ENTERPRISE";
      default: return plan.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Configurações</h1>

      {/* Identidade */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            Identidade do Estúdio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="studio-name">Nome</Label>
              <Input id="studio-name" value={formData.name} onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label>Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={formData.logoUrl} />
                  <AvatarFallback className="bg-emerald-600/20 text-emerald-300 text-2xl">
                    {formData.name?.[0] || "S"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <Label htmlFor="logo-upload" className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 bg-slate-800 border border-white/10 rounded-lg hover:bg-white/5 text-sm">
                    <Upload className="w-4 h-4" />
                    {logoFile ? logoFile.name : "Enviar logo"}
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" value={formData.website} onChange={(e) => setFormData((f) => ({ ...f, website: e.target.value }))} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" value={formData.instagram} onChange={(e) => setFormData((f) => ({ ...f, instagram: e.target.value }))} className="bg-slate-800 border-white/10" />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input id="linkedin" value={formData.linkedin} onChange={(e) => setFormData((f) => ({ ...f, linkedin: e.target.value }))} className="bg-slate-800 border-white/10" />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
              className="w-full mt-1 bg-slate-800 border border-white/10 rounded-lg p-2 text-sm text-white resize-none"
            />
          </div>
          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => updateMutation.mutate(formData)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plano Atual */}
      <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Badge className="bg-emerald-600/20 text-emerald-300 border-emerald-600/30 text-xs">PLANO ATUAL</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <Badge className={planColor((settings as any)?.planTier || "basic")}>{planLabel((settings as any)?.planTier || "basic")}</Badge>
                <p className="text-slate-400 text-sm mt-2">Para alterar seu plano, entre em contato com o suporte.</p>
              </div>
              <Button variant="outline" className="border-white/10" disabled>
                Alterar Plano
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="bg-gradient-to-b from-rose-900/20 to-rose-900/10 border-rose-600/30 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-medium">Solicitar exclusão do estúdio</h3>
              <p className="text-slate-400 text-sm mt-1">Esta ação é irreversível. Todos os dados serão permanentemente removidos.</p>
            </div>
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Solicitar Exclusão</Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Confirmar Exclusão</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Digite o nome do estúdio <strong>{(settings as any)?.name}</strong> para confirmar a exclusão.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={(settings as any)?.name}
                    className="bg-slate-800 border-white/10"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                  <Button
                    variant="destructive"
                    disabled={deleteConfirmText !== (settings as any)?.name}
                    onClick={() => deleteMutation.mutate()}
                  >
                    {deleteMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                    Excluir Estúdio
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
