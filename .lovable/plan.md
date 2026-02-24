

# 📝 EduBoard — Collaborative Whiteboard for Education

A professional, full-featured whiteboard app designed for students, teachers, and study groups. Built with an infinite canvas, smart drawing tools, real-time collaboration, and AI-powered features.

---

## Phase 1: Core Drawing Engine & Canvas

### Infinite Canvas
- Pannable, zoomable canvas with smooth scrolling
- Zoom controls (buttons + pinch/scroll)
- Mini-map for navigation on large boards

### Drawing Tools Toolbar
- **Pen/Pencil** with pressure-sensitive feel
- **Highlighter** with semi-transparent strokes
- **Eraser** (stroke-level and area-level)
- **Shape tools**: Rectangle, circle, arrow, line
- **Color picker** with preset palette + custom colors
- **Brush size slider**
- Undo / Redo support

### Text & Notes
- Click-to-add text boxes with rich formatting (bold, italic, font size)
- Drag to move, handles to resize
- Sticky note style cards for quick annotations

---

## Phase 2: Save, Export & Board Management

### Local Auto-Save
- Auto-save board state to browser storage
- Manual save button

### Export Options
- Export board as PNG image
- Export board as PDF document
- Import images onto the canvas (drag & drop or file picker)

### Board Management
- Create, rename, delete boards
- Board list/gallery view on the home page
- Thumbnail previews of each board

---

## Phase 3: Authentication & Cloud Storage (Supabase)

### User Accounts
- Sign up / Login (email + password)
- User profile with avatar and display name

### Cloud Sync
- Save boards to Supabase database
- Sync across devices automatically
- Backup & restore boards from cloud

### Board Organization
- Folders / categories for boards
- Search boards by name
- Star/favorite boards

---

## Phase 4: Collaboration Features

### Real-Time Collaboration
- Share board via link with view/edit permissions
- Multiple users drawing simultaneously (Supabase Realtime)
- Live cursor tracking showing collaborator positions
- User presence indicators (who's online)

### Comments & Chat
- Click anywhere on the board to add a comment pin
- Thread-based replies on comments
- Built-in side-panel chat for the session

### Sharing & Permissions
- Private boards (default)
- Share via link (view-only or edit access)
- Permission control per user (owner, editor, viewer)

---

## Phase 5: Templates & Smart Tools

### Template Library
- Pre-built templates: mind maps, flowcharts, study note layouts, Kanban boards, Cornell notes
- One-click to start from a template
- Save custom boards as personal templates

### AI-Powered Smart Tools (Lovable AI)
- **Shape auto-recognition**: Rough sketch → clean shape
- **Handwriting to text**: Convert drawn text to typed text
- **AI diagram suggestion**: Describe a concept, get a diagram layout suggested

---

## Phase 6: Polish & Competitive Features

### Dark Mode
- Full dark/light theme toggle
- Respects system preference

### Keyboard Shortcuts
- Standard shortcuts for all tools (B for brush, E for eraser, T for text, etc.)
- Ctrl+Z/Y for undo/redo
- Spacebar to pan

### Offline Mode
- Work offline with local storage
- Auto-sync when back online

### Touch & Mobile Support
- Touch gestures for pan, zoom, and draw
- Responsive toolbar that adapts to smaller screens
- Optimized for tablets (ideal for students)

---

## Design Direction
- **Professional & polished** aesthetic inspired by Miro/FigJam
- Clean toolbar with icon-based tools and subtle hover states
- Neutral color palette with accent colors for actions
- Smooth animations and transitions throughout

