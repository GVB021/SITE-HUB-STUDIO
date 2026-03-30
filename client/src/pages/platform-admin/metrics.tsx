import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Calendar, Mic, HardDrive, Users } from "lucide-react";

async function fetchOverview() {
  const res = await fetch("/api/platform-admin/overview");
  if (!res.ok) throw new Error("Failed to fetch overview");
  return res.json();
}

async function fetchStudios() {
  const res = await fetch("/api/platform-admin/studios");
  if (!res.ok) throw new Error("Failed to fetch studios");
  const data = await res.json();
  return data.studios || [];
}

// Mock data for charts (replace with real endpoints later)
const mockSessionsByDay = Array.from({ length: 30 }, (_, i) => ({
  day: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
  sessoes: Math.floor(Math.random() * 40) + 10,
}));

const mockTakesByDay = Array.from({ length: 30 }, (_, i) => ({
  day: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR", { month: "short", day: "numeric" }),
  takes: Math.floor(Math.random() * 200) + 50,
}));

const COLORS = ["#8b5cf6", "#6366f1", "#3b82f6", "#06b6d4", "#10b981"];

export default function PlatformAdminMetrics() {
  const { data: overview } = useQuery({ queryKey: ["platform-admin-overview"], queryFn: fetchOverview });
  const { data: studios = [] } = useQuery({ queryKey: ["platform-admin-studios"], queryFn: fetchStudios });

  // Plan distribution
  const planData = [
    { name: "Free", value: studios.filter((s: any) => s.planTier === "basic").length },
    { name: "Pro", value: studios.filter((s: any) => s.planTier === "pro").length },
    { name: "Enterprise", value: studios.filter((s: any) => s.planTier === "enterprise").length },
  ].filter(item => item.value > 0);

  // Top 5 studios by usage (mock)
  const topStudios = studios.slice(0, 5).map((studio: any, idx: number) => ({
    rank: idx + 1,
    name: studio.name,
    takes: Math.floor(Math.random() * 1000) + 100,
    storage: `${(Math.random() * 50 + 5).toFixed(1)} GB`,
    sessions: Math.floor(Math.random() * 200) + 20,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Métricas</h1>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sessions per day */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Sessões por Dia (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockSessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Line type="monotone" dataKey="sessoes" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Takes per day */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Mic className="w-5 h-5 text-violet-400" />
              Takes Gravados por Dia (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={mockTakesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="takes" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Plan Distribution + Top 5 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Plan distribution pie */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-violet-400" />
              Distribuição de Planos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend wrapperStyle={{ color: "#94a3b8" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top 5 Studios by Usage */}
        <Card className="bg-gradient-to-b from-slate-900/80 to-slate-900/40 border-white/10 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Top 5 Estúdios por Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-slate-400">#</TableHead>
                  <TableHead className="text-slate-400">Estúdio</TableHead>
                  <TableHead className="text-slate-400 text-right">Takes</TableHead>
                  <TableHead className="text-slate-400 text-right">Storage</TableHead>
                  <TableHead className="text-slate-400 text-right">Sessões</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudios.map((studio: any) => (
                  <TableRow key={studio.rank} className="border-white/10">
                    <TableCell className="text-white font-medium">{studio.rank}</TableCell>
                    <TableCell className="text-white">{studio.name}</TableCell>
                    <TableCell className="text-slate-300 text-right">{studio.takes}</TableCell>
                    <TableCell className="text-slate-300 text-right">{studio.storage}</TableCell>
                    <TableCell className="text-slate-300 text-right">{studio.sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
