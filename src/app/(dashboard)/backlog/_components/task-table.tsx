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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Icons, PriorityIcons } from "@/components/icons";
import { Task, Priority, User } from "@/types";
import { calculateWeightedProgress, getProgressGradient } from "@/lib/task-utils";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onTaskDeleted: () => void;
  users: User[];
}

export function TaskTable({ tasks, onEdit, onTaskDeleted, users }: TaskTableProps) {
    const handleDelete = async (taskId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to zadanie? To usunie również wszystkie jego podzadania.')) return;
        
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        onTaskDeleted();
    };
    
    const getAssigneeName = (email: string) => {
        return users.find(u => u.email === email)?.name || email;
    }

    const getAssigneeInitials = (email: string) => {
        const name = getAssigneeName(email);
        return name.split(' ').map(n => n[0]).join('');
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
            <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                    <AvatarFallback>{getAssigneeInitials(task.assignee)}</AvatarFallback>
                </Avatar>
              <span>{getAssigneeName(task.assignee)}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Progress value={progress} className="h-2" indicatorStyle={{ background: progressGradient }} />
              <span className="text-xs font-mono">{progress}%</span>
            </div>
          </TableCell>
          <TableCell className="text-right">
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
                  <DropdownMenuItem onSelect={() => handleDelete(task.id)} className="text-destructive">
                      <Icons.delete className="mr-2 h-4 w-4" /> Usuń
                  </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
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
