import {
  LayoutDashboard,
  ListTodo,
  BrainCircuit,
  Siren,
  ChevronsUp,
  MinusSquare,
  ChevronsDown,
  ChevronDown,
  Plus,
  FileUp,
  FileDown,
  Bot,
  Bell,
  EyeOff,
  Eye,
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle,
  FolderOpen,
  Briefcase,
  Users,
  LoaderCircle,
  LogOut,
  Search,
  PanelLeft,
  Layers,
  ClipboardList,
  CalendarClock,
  FlaskConical,
  File,
  Settings,
} from 'lucide-react';

export const Icons = {
  dashboard: LayoutDashboard,
  backlog: Layers,
  directives: BrainCircuit,
  critical: Siren,
  high: ChevronsUp,
  medium: MinusSquare,
  low: ChevronsDown,
  chevronDown: ChevronDown,
  plus: Plus,
  import: FileUp,
  export: FileDown,
  bot: Bot,
  bell: Bell,
  zenOn: EyeOff,
  zenOff: Eye,
  more: MoreVertical,
  delete: Trash2,
  edit: Edit,
  checkCircle: CheckCircle,
  folderOpen: FolderOpen,
  meetings: ClipboardList,
  users: Users,
  spinner: LoaderCircle,
  logout: LogOut,
  search: Search,
  menu: PanelLeft,
  myTasks: ListTodo,
  projectManager: Briefcase,
  deadline: CalendarClock,
  aiTest: FlaskConical,
  file: File,
  settings: Settings,
};

export const PriorityIcons = {
  Critical: Icons.critical,
  High: Icons.high,
  Medium: Icons.medium,
  Low: Icons.low,
};

export const ProjectIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
    </svg>
);


export const BotMessageSquare = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 6V2H8" />
    <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
    <path d="M12 18h6" />
    <path d="M16 11.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1 0-1h3a.5.5 0 0 1 .5.5Z" />
  </svg>
);
