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
  Clapperboard,
  CheckCircle,
  FolderOpen,
  Briefcase,
  Users,
  LoaderCircle,
  LogOut,
} from 'lucide-react';

export const Icons = {
  dashboard: LayoutDashboard,
  backlog: ListTodo,
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
  movie: Clapperboard,
  checkCircle: CheckCircle,
  folderOpen: FolderOpen,
  meetings: Briefcase,
  attendees: Users,
  spinner: LoaderCircle,
  logout: LogOut,
};

export const PriorityIcons = {
  Critical: Icons.critical,
  High: Icons.high,
  Medium: Icons.medium,
  Low: Icons.low,
};

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
