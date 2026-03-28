import { memo, useState } from "react";
import { Monitor, Search, Filter, Download, RefreshCw, Mic, Upload, AlertTriangle, CheckCircle, User } from "lucide-react";
import { Button } from "@studio/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@studio/components/ui/card";
import { Input } from "@studio/components/ui/input";
import { Badge } from "@studio/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@studio/components/ui/select";
import { format } from "date-fns";

interface SimpleLog {
  id: string;
  type: 'recording' | 'upload' | 'access' | 'error';
  message: string;
  timestamp: Date;
  userId: string;
  userName: string;
}

interface MonitorPanelProps {
  studioId: string;
  logs: SimpleLog[] | null;
  isLoading: boolean;
}

const MonitorPanel = memo(function MonitorPanel({ logs, isLoading }: MonitorPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTime, setFilterTime] = useState<string>("today");

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'recording': return <Mic className="w-4 h-4 text-blue-500" />;
      case 'upload': return <Upload className="w-4 h-4 text-green-500" />;
      case 'access': return <User className="w-4 h-4 text-purple-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'recording': 'default',
      'upload': 'secondary',
      'access': 'outline',
      'error': 'destructive'
    };
    return variants[type] || 'secondary';
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recording': return 'Gravação';
      case 'upload': return 'Upload';
      case 'access': return 'Acesso';
      case 'error': return 'Erro';
      default: return 'Outro';
    }
  };

  const filterLogs = () => {
    if (!logs) return [];
    
    let filtered = [...logs];
    
    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(log => log.type === filterType);
    }
    
    // Filter by time
    const now = new Date();
    switch (filterTime) {
      case "today":
        filtered = filtered.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(log => new Date(log.timestamp) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(log => new Date(log.timestamp) >= monthAgo);
        break;
    }
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const filteredLogs = filterLogs();
  const stats = {
    total: logs?.length || 0,
    recording: logs?.filter(l => l.type === 'recording').length || 0,
    upload: logs?.filter(l => l.type === 'upload').length || 0,
    access: logs?.filter(l => l.type === 'access').length || 0,
    error: logs?.filter(l => l.type === 'error').length || 0,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-semibold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-blue-500" />
            <div>
              <p className="text-lg font-semibold">{stats.recording}</p>
              <p className="text-xs text-muted-foreground">Gravações</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-green-500" />
            <div>
              <p className="text-lg font-semibold">{stats.upload}</p>
              <p className="text-xs text-muted-foreground">Uploads</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-purple-500" />
            <div>
              <p className="text-lg font-semibold">{stats.access}</p>
              <p className="text-xs text-muted-foreground">Acessos</p>
            </div>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <div>
              <p className="text-lg font-semibold">{stats.error}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Input
              placeholder="Buscar por usuário ou mensagem..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="recording">Gravações</SelectItem>
                <SelectItem value="upload">Uploads</SelectItem>
                <SelectItem value="access">Acessos</SelectItem>
                <SelectItem value="error">Erros</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTime} onValueChange={setFilterTime}>
              <SelectTrigger className="w-full md:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">7 dias</SelectItem>
                <SelectItem value="month">30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Logs do Sistema ({filteredLogs.length})
            </span>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum log encontrado com os filtros atuais</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="mt-0.5">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{log.userName}</span>
                      <Badge variant={getLogBadge(log.type)} className="text-xs">
                        {getTypeLabel(log.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.timestamp), "HH:mm:ss")}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

MonitorPanel.displayName = "MonitorPanel";

export default MonitorPanel;
