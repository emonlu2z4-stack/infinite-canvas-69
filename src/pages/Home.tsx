import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, MoreVertical, Search, LayoutGrid } from 'lucide-react';
import { listBoards, createBoard, renameBoard, deleteBoard } from '@/lib/boardStorage';
import type { BoardMeta } from '@/types/canvas';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<BoardMeta[]>([]);
  const [search, setSearch] = useState('');
  const [renameDialog, setRenameDialog] = useState<{ id: string; name: string } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

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

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <LayoutGrid size={18} className="text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">EduBoard</h1>
              <p className="text-xs text-muted-foreground">Collaborative Whiteboard</p>
            </div>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus size={16} />
            New Board
          </Button>
        </div>
      </header>

      {/* Search & Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search boards..."
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} board{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filtered.length === 0 && boards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={28} className="text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">No boards yet</h2>
            <p className="text-muted-foreground mb-6">Create your first whiteboard to get started</p>
            <Button onClick={handleCreate} className="gap-2">
              <Plus size={16} />
              Create Board
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No boards match "{search}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New board card */}
            <button
              onClick={handleCreate}
              className="border-2 border-dashed border-border rounded-xl h-[220px] flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus size={22} />
              </div>
              <span className="text-sm font-medium">New Board</span>
            </button>

            {/* Board cards */}
            {filtered.map(board => (
              <div
                key={board.id}
                className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                {/* Thumbnail */}
                <div className="h-[140px] bg-muted relative overflow-hidden">
                  {board.thumbnail ? (
                    <img
                      src={board.thumbnail}
                      alt={board.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <LayoutGrid size={32} className="text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm text-foreground truncate">{board.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(board.updatedAt)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                      <button className="p-1.5 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={e => e.stopPropagation()}>
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

      {/* Rename Dialog */}
      <Dialog open={!!renameDialog} onOpenChange={open => !open && setRenameDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Board name"
            onKeyDown={e => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog(null)}>Cancel</Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={open => !open && setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. Are you sure?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
