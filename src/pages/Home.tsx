import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, MoreHorizontal, Search, LayoutGrid,
  BookTemplate, Clock, Star, FolderOpen, Settings, HelpCircle,
  ChevronLeft, Home as HomeIcon, Users, TrendingUp
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { listBoards, createBoard, renameBoard, deleteBoard, createBoardFromTemplate } from '@/lib/boardStorage';
import TemplateDialog from '@/components/TemplateDialog';
import type { BoardTemplate } from '@/lib/templates';
import type { BoardMeta } from '@/types/canvas';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function Home() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [search, setSearch] = useState('');
  const [renameDialog, setRenameDialog] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [templateOpen, setTemplateOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState('all');

  useEffect(() => {
    setBoards(listBoards());
  }, []);

  const filtered = boards.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    const board = createBoard(`Board ${boards.length + 1}`);
    navigate(`/board/${board.meta.id}`);
  };

  const handleTemplateSelect = (template: BoardTemplate) => {
    const board = createBoardFromTemplate(template);
    setTemplateOpen(false);
    navigate(`/board/${board.meta.id}`);
  };

  const handleRename = () => {
    if (!renameDialog || !newName.trim()) return;
    renameBoard(renameDialog.id, newName.trim());
    setBoards(listBoards());
    setRenameDialog(null);
    setNewName('');
  };

  const handleDelete = () => {
    if (!deleteDialog) return;
    deleteBoard(deleteDialog);
    setBoards(listBoards());
    setDeleteDialog(null);
  };

  const navItems = [
    { id: 'all', label: 'All Boards', icon: LayoutGrid, count: boards.length },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'shared', label: 'Shared with me', icon: Users },
  ];

  const secondaryNav = [
    { id: 'templates', label: 'Templates', icon: BookTemplate, action: () => setTemplateOpen(true) },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`relative flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-border/50 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <LayoutGrid size={16} className="text-primary-foreground" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-base font-semibold text-foreground tracking-tight">EduBoard</span>
          )}
        </div>

        {/* New Board Button */}
        <div className="px-3 pt-5 pb-2 shrink-0">
          <Button
            onClick={handleCreate}
            className={`w-full gap-2 rounded-lg h-10 font-medium shadow-sm ${
              sidebarCollapsed ? 'px-0 justify-center' : ''
            }`}
          >
            <Plus size={18} />
            {!sidebarCollapsed && <span>New Board</span>}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeNav === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                      {item.count}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}

          {!sidebarCollapsed && (
            <div className="pt-4 pb-2">
              <span className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Quick Access
              </span>
            </div>
          )}
          {sidebarCollapsed && <div className="pt-2" />}

          {secondaryNav.map(item => (
            <button
              key={item.id}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${
                sidebarCollapsed ? 'justify-center px-0' : ''
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 pb-4 shrink-0">
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all ${
              sidebarCollapsed ? 'justify-center px-0' : ''
            }`}
          >
            <ChevronLeft
              size={18}
              className={`shrink-0 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
            />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border/50 bg-card/40 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {activeNav === 'all' ? 'All Boards' : activeNav === 'recent' ? 'Recent' : activeNav === 'starred' ? 'Starred' : 'Shared with me'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search boards..."
                className="pl-9 w-64 h-9 bg-muted/50 border-border/50 rounded-lg text-sm focus:bg-card"
              />
            </div>
            <ThemeToggle className="text-muted-foreground hover:bg-muted h-9 w-9" />
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-semibold">
              U
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            {/* Stats Row */}
            {boards.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { label: 'Total Boards', value: boards.length, icon: LayoutGrid, color: 'text-primary' },
                  { label: 'Edited Today', value: boards.filter(b => Date.now() - b.updatedAt < 86400000).length, icon: TrendingUp, color: 'text-success' },
                  { label: 'This Week', value: boards.filter(b => Date.now() - b.updatedAt < 604800000).length, icon: Clock, color: 'text-accent' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl px-5 py-4 flex items-center gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                      <stat.icon size={18} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filtered.length === 0 && boards.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
                  <FolderOpen size={36} className="text-muted-foreground/40" />
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">No boards yet</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Create your first whiteboard to start collaborating with your team
                </p>
                <div className="flex items-center gap-3 justify-center">
                  <Button onClick={handleCreate} size="lg" className="gap-2 rounded-xl shadow-md">
                    <Plus size={18} />
                    Create Board
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setTemplateOpen(true)} className="gap-2 rounded-xl">
                    <BookTemplate size={18} />
                    Use Template
                  </Button>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Search size={36} className="text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">No boards match "<span className="text-foreground font-medium">{search}</span>"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {/* New board card */}
                <button
                  onClick={handleCreate}
                  className="border-2 border-dashed border-border/60 rounded-2xl h-[240px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary/40 hover:text-primary transition-all group bg-card/30 backdrop-blur-sm"
                >
                  <div className="w-14 h-14 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <Plus size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-sm font-medium">New Board</span>
                </button>

                {/* Board cards */}
                {filtered.map(board => (
                  <div
                    key={board.id}
                    className="bg-card/70 backdrop-blur-sm border border-border/40 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 cursor-pointer group"
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    {/* Thumbnail */}
                    <div className="h-[150px] bg-muted/30 relative overflow-hidden">
                      {board.thumbnail ? (
                        <img
                          src={board.thumbnail}
                          alt={board.name}
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/40 to-muted/20">
                          <LayoutGrid size={28} className="text-muted-foreground/20" />
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Info */}
                    <div className="px-4 py-3.5 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-sm text-foreground truncate">{board.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock size={11} />
                          Last edited {timeAgo(board.updatedAt)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-all">
                            <MoreHorizontal size={16} className="text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={e => e.stopPropagation()} className="rounded-xl">
                          <DropdownMenuItem onClick={() => { setRenameDialog({ id: board.id, name: board.name }); setNewName(board.name); }}>
                            <Pencil size={14} className="mr-2" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteDialog(board.id)} className="text-destructive">
                            <Trash2 size={14} className="mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={open => !open && setRenameDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Board name"
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            autoFocus
            className="rounded-lg"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)} className="rounded-lg">Cancel</Button>
            <Button onClick={handleRename} className="rounded-lg">Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)} className="rounded-lg">Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="rounded-lg">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template Dialog */}
      <TemplateDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
