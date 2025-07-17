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
import { calculateWeightedProgress, getProgressColor } from "@/lib/task-utils";
import Image from 'next/image';

interface TaskTableProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onTaskDeleted: () => void;
  users: User[];
}

export function TaskTable({ tasks, onEdit, onTaskDeleted, users }: TaskTableProps) {
    const handleDelete = async (taskId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to zadanie?')) return;
        
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
        onTaskDeleted();
    };
    
    const getAssigneeName = (email: string) => {
        return users.find(u => u.email === email)?.name || email;
    }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Zadanie</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priorytet</TableHead>
            <TableHead>Przypisany</TableHead>
            <TableHead className="w-[200px]">Postęp</TableHead>
            <TableHead className="w-[50px] text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const progress = calculateWeightedProgress(task);
            const progressColor = getProgressColor(progress);
            const PriorityIcon = PriorityIcons[task.priority as Priority];
            return (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.name}</TableCell>
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
                     <Image
                      src={`https://placehold.co/40x40.png`}
                      alt={task.assignee}
                      width={24}
                      height={24}
                      className="rounded-full"
                      data-ai-hint="people avatar"
                    />
                    <span>{getAssigneeName(task.assignee)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={progress} className={`h-2 [&>*]:${progressColor}`} />
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
          })}
        </TableBody>
      </Table>
    </div>
  );
}
