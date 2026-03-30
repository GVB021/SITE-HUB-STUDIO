import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  LayoutDashboard,
  Film, 
  Calendar, 
  Mic, 
  Sliders, 
  Settings, 
  Bell, 
  User, 
  Plus,
  Play,
  Users,
  Search,
  ChevronDown,
  CalendarDays,
  UserPlus,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '@studio/hooks/use-auth';
import { useProductions } from '@studio/hooks/use-productions';
import { useSessions } from '@studio/hooks/use-sessions';
import { useStudio } from '@studio/hooks/use-studios';
import { useStudioRole } from '@studio/hooks/use-studio-role';
import { isSessionVisibleOnDashboard } from '@studio/lib/session-status';
import { authFetch } from '@studio/lib/auth-fetch';
import { useToast } from '@studio/hooks/use-toast';

export default function Dashboard({ studioId }: { studioId: string }) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const studio = useStudio(studioId);
  const { data: productions } = useProductions(studioId);
  const { data: sessions } = useSessions(studioId);
  const { canCreateProductions, canCreateSessions, role } = useStudioRole(studioId);
  const isAdmin = role === 'admin' || role === 'owner';
  const isOwner = role === 'owner';
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [realTakes, setRealTakes] = useState<any[]>([]);
  const [takesLoading, setTakesLoading] = useState(false);

  // Fetch real takes data
  useEffect(() => {
    const fetchTakes = async () => {
      if (!studioId) return;
      setTakesLoading(true);
      try {
        // Try to fetch takes from the studio
        const data = await authFetch(`/api/studios/${studioId}/takes?limit=5`);
        if (Array.isArray(data)) {
          setRealTakes(data);
        } else if (data?.items) {
          setRealTakes(data.items);
        }
      } catch (err) {
        console.error('Failed to fetch takes:', err);
      } finally {
        setTakesLoading(false);
      }
    };
    fetchTakes();
  }, [studioId]);

  // Calculate stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const sessionsThisMonth = sessions?.filter(s => {
    const sessionDate = new Date(s.scheduledAt);
    return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
  }).length || 0;

  const totalTakes = sessions?.reduce((acc, s) => acc + ((s as any).takesCount || 0), 0) || 0;
  const activeProjects = productions?.filter(p => p.status !== 'completed').length || 0;
  const studioMembers = 25;

  const upcomingSessions = (sessions || [])
    .filter(s => isSessionVisibleOnDashboard(s.scheduledAt, s.durationMinutes ?? 60))
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
    .slice(0, 4);

  // Use real takes data or fallback to empty array
  const recentTakes = realTakes.length > 0 ? realTakes : [];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getSessionStatus = (session: any) => {
    const scheduledAt = new Date(session.scheduledAt);
    const now = new Date();
    const durationMinutes = session.durationMinutes || 60;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);
    
    if (now >= scheduledAt && now <= endTime) {
      return { label: 'AO VIVO', className: 'bg-green-100 text-green-700 animate-pulse' };
    } else if (now > endTime) {
      return { label: 'CONCLUÍDA', className: 'bg-gray-100 text-gray-500' };
    } else {
      return { label: 'AGENDADA', className: 'bg-blue-100 text-blue-700' };
    }
  };

  const getTakeStatus = (status: string) => {
    switch (status) {
      case 'completed': return { label: 'Aprovado', className: 'bg-green-100 text-green-700' };
      case 'processing': return { label: 'Pendente', className: 'bg-blue-100 text-blue-700' };
      default: return { label: 'N/A', className: 'bg-gray-100 text-gray-400' };
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* LEFT SIDEBAR - w-64 bg-white */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col">
        {/* TOP - Logo */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-900">HubDub</span>
              <p className="text-xs text-gray-400">Studio studio</p>
            </div>
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {/* ESTÚDIO Section */}
          <div>
            <h3 className="text-xs tracking-widest text-gray-400 uppercase px-3 mt-4 mb-2">
              ESTÚDIO
            </h3>
            <div className="space-y-1">
              {/* Dashboard - ACTIVE */}
              <Link href={`/hub-dub/studio/${studioId}/dashboard`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 border-l-2 border-blue-600 cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link href={`/hub-dub/studio/${studioId}/productions`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Film className="w-4 h-4" />
                  <span>Projetos</span>
                </div>
              </Link>
              <Link href={`/hub-dub/studio/${studioId}/sessions`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <CalendarDays className="w-4 h-4" />
                  <span>Sessões</span>
                </div>
              </Link>
              <Link href={`/hub-dub/studio/${studioId}/takes`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Mic className="w-4 h-4" />
                  <span>Takes</span>
                </div>
              </Link>
            </div>
          </div>

          {/* FERRAMENTAS Section */}
          <div className="mt-6">
            <h3 className="text-xs tracking-widest text-gray-400 uppercase px-3 mb-2">
              FERRAMENTAS
            </h3>
            <Link href={`/hub-dub/studio/${studioId}/hubalign`}>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                <Sliders className="w-4 h-4" />
                <span>HubAlign</span>
              </div>
            </Link>
          </div>

          {/* ADMIN Section - only for admin/owner */}
          {(isAdmin || isOwner) && (
            <div className="mt-6">
              <h3 className="text-xs tracking-widest text-gray-400 uppercase px-3 mb-2">
                ADMIN
              </h3>
              <Link href={`/hub-dub/studio/${studioId}/admin`}>
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Settings className="w-4 h-4" />
                  <span>Painel do Estúdio</span>
                </div>
              </Link>
            </div>
          )}
        </nav>

        {/* BOTTOM - User Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'Usuário'}
              </p>
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {role || 'dubber'}
              </span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 ml-auto">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP NAVBAR */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6">
          <h1 className="text-xl font-bold text-gray-900 flex-1">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-gray-600">
              <Search className="w-5 h-5" />
            </button>
            <button className="relative text-gray-400 hover:text-gray-600">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                1
              </span>
            </button>
            <div className="relative user-dropdown">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-1 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <Link href={`/hub-dub/profile`}>
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Perfil</div>
                  </Link>
                  <Link href={`/hub-dub/settings`}>
                    <div className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer">Configurações</div>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button 
                    onClick={() => logout()} 
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {/* PAGE HEADER */}
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold text-gray-900">
                Olá, {user?.fullName?.split(' ')[0] || 'Gabriel'} 👋
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {formatDate(now).charAt(0).toUpperCase() + formatDate(now).slice(1)}
              </p>
            </div>
            {canCreateSessions && (
              <Link href={`/hub-dub/studio/${studioId}/sessions/new`}>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
                  <Plus className="w-4 h-4" />Nova Sessão
                </button>
              </Link>
            )}
          </div>

          {/* STATS ROW */}
          <div className="grid grid-cols-4 gap-4 mt-8">
            {/* Card 1 - Sessões */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-green-500 text-xs">+12% este mês</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-3">360</div>
              <div className="text-gray-500 text-sm mt-1">Sessões este mês</div>
            </div>

            {/* Card 2 - Takes */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Mic className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-green-500 text-xs">+12% este mês</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-3">138</div>
              <div className="text-gray-500 text-sm mt-1">Takes gravados</div>
            </div>

            {/* Card 3 - Projetos */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Film className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-green-500 text-xs">+12% este mês</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-3">22</div>
              <div className="text-gray-500 text-sm mt-1">Projetos ativos</div>
            </div>

            {/* Card 4 - Membros */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-green-500 text-xs">+12% este mês</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mt-3">25</div>
              <div className="text-gray-500 text-sm mt-1">Membros do estúdio</div>
            </div>
          </div>

          {/* TWO COLUMN ROW */}
          <div className="grid grid-cols-[1fr_300px] gap-4 mt-6">
            {/* LEFT - PRÓXIMAS SESSÕES */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Próximas sessões</h3>
                <Link href={`/hub-dub/studio/${studioId}/sessions`}>
                  <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-700">Ver todas</span>
                </Link>
              </div>

              {/* Table */}
              <table className="w-full mt-4">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide text-left">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Projeto</th>
                    <th className="pb-3 font-medium">Data</th>
                    <th className="pb-3 font-medium">Participantes</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Row 1 */}
                  <tr className="border-t border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Sessão Dewam 1</p>
                          <p className="text-xs text-gray-400">Projeto · HubDub 1</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">Projeto</td>
                    <td className="py-3 text-gray-600">
                      <p>18/08/2023</p>
                      <p className="text-xs">Data 10:00</p>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border border-white flex items-center justify-center text-white text-[10px]">
                              {String.fromCharCode(64 + i)}
                            </div>
                          ))}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-500 ml-1"></div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">AGENDADA</span>
                        <span className="text-green-600 text-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                          AO VIVO
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                        Entrar
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="border-t border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Sessão Dewam 2</p>
                          <p className="text-xs text-gray-400">Projeto · HubDub 2</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">N/A</td>
                    <td className="py-3 text-gray-600">
                      <p>20/08/2023</p>
                      <p className="text-xs">14:00</p>
                    </td>
                    <td className="py-3">
                      <div className="flex -space-x-2">
                        {[1, 2].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 border border-white flex items-center justify-center text-white text-[10px]">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">N/A</span>
                    </td>
                    <td className="py-3">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                        Entrar
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="border-t border-gray-100">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">Sessão Dewam 3</p>
                          <p className="text-xs text-gray-400">Projeto · HubDub 3</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">Projeto</td>
                    <td className="py-3 text-gray-600">
                      <p>22/08/2023</p>
                      <p className="text-xs">16:00</p>
                    </td>
                    <td className="py-3">
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 border border-white flex items-center justify-center text-white text-[10px]">
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full">CONCLUÍDA</span>
                    </td>
                    <td className="py-3">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700">
                        Entrar
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4">
              {/* Empty State Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Próximas sessões</h3>
                  <span className="text-blue-600 text-sm cursor-pointer">Ver todas</span>
                </div>
                <div className="flex flex-col items-center py-6">
                  <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Calendar className="w-10 h-10 text-blue-300" />
                  </div>
                  <p className="text-gray-500 text-sm text-center">Nenhuma sessão agendada</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm mt-4 hover:bg-blue-700">
                    Criar sessão
                  </button>
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="text-xs tracking-widest uppercase text-gray-400 mb-3">
                  AÇÕES RÁPIDAS
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 transition text-center">
                    Criar Projeto
                  </button>
                  <button className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 transition text-center">
                    Agendar Sessão
                  </button>
                  <button className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 transition text-center">
                    Convidar Membro
                  </button>
                  <button className="border border-gray-200 rounded-lg py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 transition text-center">
                    Abrir HubAlign
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TAKES RECENTES */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Takes recentes</h3>
              <Link href={`/hub-dub/studio/${studioId}/takes`}>
                <span className="text-blue-600 text-sm cursor-pointer hover:text-blue-700">Ver todos</span>
              </Link>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide text-left">
                  <th className="pb-3 font-medium">Character</th>
                  <th className="pb-3 font-medium">Ator</th>
                  <th className="pb-3 font-medium">Sessão</th>
                  <th className="pb-3 font-medium">Duração</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentTakes.length > 0 ? (
                  recentTakes.map((take) => {
                    const status = getTakeStatus(take.status || 'pending');
                    return (
                      <tr key={take.id} className="border-t border-gray-100">
                        <td className="py-3 font-medium text-gray-900">{take.characterName || take.character || '-'}</td>
                        <td className="py-3 text-gray-600">{take.voiceActorName || take.actorName || '-'}</td>
                        <td className="py-3 text-gray-600">{take.sessionTitle || 'Sessão'}</td>
                        <td className="py-3 text-gray-600">{take.durationFormatted || take.duration || '-'}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <button 
                            onClick={() => take.audioUrl && window.open(take.audioUrl, '_blank')}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
                            disabled={!take.audioUrl}
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <>
                    <tr className="border-t border-gray-100">
                      <td className="py-3 font-medium text-gray-900">Personagem A</td>
                      <td className="py-3 text-gray-600">João Silva</td>
                      <td className="py-3 text-gray-600">Sessão Dewam 1</td>
                      <td className="py-3 text-gray-600">02:34</td>
                      <td className="py-3">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">Aprovado</span>
                      </td>
                      <td className="py-3">
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                          <Play className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="py-3 font-medium text-gray-900">Personagem B</td>
                      <td className="py-3 text-gray-600">Maria Santos</td>
                      <td className="py-3 text-gray-600">Sessão Dewam 2</td>
                      <td className="py-3 text-gray-600">01:45</td>
                      <td className="py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Pendente</span>
                      </td>
                      <td className="py-3">
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                          <Play className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                    <tr className="border-t border-gray-100">
                      <td className="py-3 font-medium text-gray-900">Personagem C</td>
                      <td className="py-3 text-gray-600">Pedro Costa</td>
                      <td className="py-3 text-gray-600">Sessão Dewam 3</td>
                      <td className="py-3 text-gray-600">03:12</td>
                      <td className="py-3">
                        <span className="bg-gray-100 text-gray-400 text-xs px-2 py-1 rounded-full">N/A</span>
                      </td>
                      <td className="py-3">
                        <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition">
                          <Play className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 z-50">
        <div className="flex items-center justify-around h-full">
          <Link href={`/hub-dub/studio/${studioId}/dashboard`}>
            <div className="flex flex-col items-center gap-1 text-blue-600">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px]">Dashboard</span>
            </div>
          </Link>
          <Link href={`/hub-dub/studio/${studioId}/productions`}>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Film className="w-5 h-5" />
              <span className="text-[10px]">Projetos</span>
            </div>
          </Link>
          <Link href={`/hub-dub/studio/${studioId}/sessions`}>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <CalendarDays className="w-5 h-5" />
              <span className="text-[10px]">Sessões</span>
            </div>
          </Link>
          <Link href={`/hub-dub/studio/${studioId}/takes`}>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Mic className="w-5 h-5" />
              <span className="text-[10px]">Takes</span>
            </div>
          </Link>
          <Link href={`/hub-dub/studio/${studioId}/hubalign`}>
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Sliders className="w-5 h-5" />
              <span className="text-[10px]">HubAlign</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Convidar Membro</h3>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-500 mb-6">
              Para convidar um membro, acesse o painel de administração do estúdio.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
                Fechar
              </button>
              <Link href={`/hub-dub/studio/${studioId}/admin`}>
                <button onClick={() => setShowInviteModal(false)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Ir para Admin
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
