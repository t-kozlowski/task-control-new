'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Icons, PriorityIcons } from "@/components/icons";
import { Task, Priority, User } from "@/types";
import { calculateWeightedProgress, getProgressGradient } from "@/lib/task-utils";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onTaskDeleted: () => void;
  users: User[];
}

export function TaskTable({ tasks, onEdit, onTaskDeleted, users }: TaskTableProps) {
    const handleDelete = async (taskId: string) => {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        onTaskDeleted();
    };
    
    const getAssigneeInfo = (email: string) => {
        const user = users.find(u => u.email === email);
        return {
            name: user?.name || email,
            initials: user?.name.split(' ').map(n => n[0]).join('') || '?',
        }
    }

    const mainTasks = tasks.filter(task => !task.parentId);
    const subTasksByParentId = tasks.reduce((acc, task) => {
      if (task.parentId) {
        if (!acc[task.parentId]) {
          acc[task.parentId] = [];
        }
        acc[task.parentId].push(task);
      }
      return acc;
    }, {} as Record<string, Task[]>);

  const renderTaskRow = (task: Task, isSubTask: boolean = false) => {
      const progress = calculateWeightedProgress(task, tasks);
      const progressGradient = getProgressGradient(progress);
      const PriorityIcon = PriorityIcons[task.priority as Priority];
      const assignedUsers = task.assignees.map(getAssigneeInfo);
      
      return (
        <TableRow key={task.id} className={isSubTask ? "bg-secondary/50" : ""}>
          <TableCell className="font-medium">
            <div className={`flex items-center ${isSubTask ? "pl-6" : ""}`}>
              {isSubTask && <ChevronRight className="h-4 w-4 mr-2 text-muted-foreground" />}
              <span>{task.name}</span>
            </div>
          </TableCell>
          <TableCell>
            <Badge variant="outline">{task.status}</Badge>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <PriorityIcon className="size-4" />
              {task.priority}
            </div>
          </TableCell>
          <TableCell>
             <div className="flex items-center -space-x-2">
                <TooltipProvider>
                  {assignedUsers.map((user, index) => (
                    <Tooltip key={`${task.id}-assignee-${index}`}>
                      <TooltipTrigger>
                        <Avatar className="h-6 w-6 border-2 border-background">
                            <AvatarFallback>{user.initials}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2" indicatorStyle={{ background: progressGradient }} />
              <span className="text-xs font-mono">{progress}%</span>
            </div>
          </TableCell>
          <TableCell className="text-right">
              <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Icons.more />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => onEdit(task)}>
                        <Icons.edit className="mr-2 h-4 w-4" /> Edytuj
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                          <Icons.delete className="mr-2 h-4 w-4" /> Usuń
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Czy na pewno chcesz usunąć to zadanie?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja jest nieodwracalna. Spowoduje to trwałe usunięcie zadania
                        {subTasksByParentId[task.id] ? ` i ${subTasksByParentId[task.id].length} jego podzadań.` : '.'}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(task.id)} className="bg-destructive hover:bg-destructive/90">Kontynuuj</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
          </TableCell>
        </TableRow>
      );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Zadanie</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorytet</TableHead>
            <TableHead>Przypisany</TableHead>
            <TableHead className="w-[200px]">Postęp</TableHead>
            <TableHead className="w-[50px] text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length > 0 ? (
            mainTasks.map(task => (
              <Fragment key={task.id}>
                {renderTaskRow(task)}
                {subTasksByParentId[task.id]?.map(subTask => renderTaskRow(subTask, true))}
              </Fragment>
            ))
           ) : (
            <TableRow>
              <TableCell colSpan={6}>
                <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                  <Icons.folderOpen className="h-12 w-12" />
                  <h3 className="text-lg font-semibold">Brak zadań do wyświetlenia</h3>
                  <p>Kliknij "Dodaj Zadanie", aby rozpocząć pracę.</p>
                </div>
              </TableCell>
            </TableRow>
           )}
        </TableBody>
      </Table>
    </div>
  );
}
