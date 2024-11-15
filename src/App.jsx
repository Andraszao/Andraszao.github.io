import React, { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Moon, 
  Pencil, 
  GripVertical, 
  Tag as TagIcon, 
  User 
} from 'lucide-react';

// Simple Button component
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    icon: 'h-8 w-8'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simple Input component
const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );
};

// Simple Card component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-xl border bg-card text-card-foreground shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge component
const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-input'
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Sortable Task Component
const SortableTask = ({ task, projectId, onToggle, onEdit, onAddSubtask, onAddTag, onAssign }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-center gap-2 py-1 pl-2">
        <button 
          className="opacity-0 group-hover:opacity-40 hover:opacity-100 cursor-grab p-1" 
          {...attributes} 
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4"
        />
        <div className="flex-1 flex items-center gap-2">
          <EditableText
            value={task.text}
            onChange={(newName) => onEdit(task.id, newName)}
            className={task.completed ? 'line-through text-gray-400' : ''}
          />
          {task.tags?.map(tag => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {task.assignee && (
            <Badge variant="outline">
              <User className="w-3 h-3 mr-1" />
              {task.assignee}
            </Badge>
          )}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddTag(task.id)}
              className="h-6 w-6 p-0"
            >
              <TagIcon className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAssign(task.id)}
              className="h-6 w-6 p-0"
            >
              <User className="w-3 h-3" />
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSubtask(task.id)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Subtask
        </Button>
      </div>
      {task.subtasks?.length > 0 && (
        <div className="ml-12">
          {task.subtasks.map(subtask => (
            <div key={subtask.id} className="flex items-center gap-2 py-1 group">
              <input
                type="checkbox"
                checked={subtask.completed}
                onChange={() => onToggle(task.id, subtask.id)}
                className="w-4 h-4"
              />
              <div className="flex-1 flex items-center gap-2">
                <EditableText
                  value={subtask.text}
                  onChange={(newName) => onEdit(task.id, subtask.id, newName)}
                  className={subtask.completed ? 'line-through text-gray-400' : ''}
                />
                {subtask.tags?.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
                {subtask.assignee && (
                  <Badge variant="outline">
                    <User className="w-3 h-3 mr-1" />
                    {subtask.assignee}
                  </Badge>
                )}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddTag(task.id, subtask.id)}
                    className="h-6 w-6 p-0"
                  >
                    <TagIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssign(task.id, subtask.id)}
                    className="h-6 w-6 p-0"
                  >
                    <User className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const EditableText = ({ value, onChange, className = '' }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    if (text.trim() !== value) {
      onChange(text.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setText(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`bg-transparent border-none focus:outline-none ${className}`}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:opacity-80 ${className}`}
    >
      {value}
    </div>
  );
};

// Main App Component
const App = () => {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('constellation-projects');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [projectInput, setProjectInput] = useState('');
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    localStorage.setItem('constellation-projects', JSON.stringify(projects));
  }, [projects]);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projectInput.trim()) return;
    
    const newProject = {
      id: Date.now().toString(),
      name: projectInput.trim(),
      tasks: []
    };
    
    setProjects(prev => [...prev, newProject]);
    setProjectInput('');
  };

  const handleAddTask = (projectId) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...project.tasks, {
            id: Date.now().toString(),
            text: 'New task',
            completed: false,
            subtasks: [],
            tags: [],
            assignee: null
          }]
        };
      }
      return project;
    }));
  };

  const handleAddSubtask = (projectId, taskId) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                subtasks: [...(task.subtasks || []), {
                  id: Date.now().toString(),
                  text: 'New subtask',
                  completed: false,
                  tags: [],
                  assignee: null
                }]
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const handleToggleTask = (projectId, taskId, subtaskId = null) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (!subtaskId && task.id === taskId) {
              return { ...task, completed: !task.completed };
            }
            if (subtaskId && task.id === taskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return { ...subtask, completed: !subtask.completed };
                  }
                  return subtask;
                }).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
              };
            }
            return task;
          }).sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
        };
      }
      return project;
    }));
  };

  const handleAddTag = (projectId, taskId, subtaskId = null) => {
    const tag = prompt('Add tag:');
    if (!tag?.trim()) return;

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (taskId === task.id && !subtaskId) {
              return {
                ...task,
                tags: [...new Set([...(task.tags || []), tag.trim().toLowerCase()])]
              };
            }
            if (taskId === task.id && subtaskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return {
                      ...subtask,
                      tags: [...new Set([...(subtask.tags || []), tag.trim().toLowerCase()])]
                    };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const handleAssign = (projectId, taskId, subtaskId = null) => {
    const assignee = prompt('Assign to:');
    if (!assignee?.trim()) return;

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (taskId === task.id && !subtaskId) {
              return { ...task, assignee: assignee.trim() };
            }
            if (taskId === task.id && subtaskId) {
              return {
                ...task,
                subtasks: task.subtasks.map(subtask => {
                  if (subtask.id === subtaskId) {
                    return { ...subtask, assignee: assignee.trim() };
                  }
                  return subtask;
                })
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    setProjects(prev => prev.map(project => {
      const taskIndex = project.tasks.findIndex(t => t.id === active.id);
      if (taskIndex === -1) return project;

      const overIndex = project.tasks.findIndex(t => t.id === over.id);
      if (overIndex === -1) return project;

      const newTasks = [...project.tasks];
      const [movedTask] = newTasks.splice(taskIndex, 1);
      newTasks.splice(overIndex, 0, movedTask);

      return {
        ...project,
        tasks: newTasks
      };
    }));
  };

  const handleProjectNameChange = (projectId, newName) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, name: newName }
        : project
    ));
  };

  const handleTaskNameChange = (projectId, taskId, newName, subtaskId = null) => {
    setProjects(prev => prev.map(project => {
      if (project.id !== projectId) return project;
      
      return {
        ...project,
        tasks: project.tasks.map(task => {
          if (task.id !== taskId) return task;
          
          if (subtaskId) {
            return {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, text: newName }
                  : subtask
              )
            };
          }
          
          return { ...task, text: newName };
        })
      };
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl font-bold">Constellation</h1>
          <Moon className="w-6 h-6" />
        </div>
        <p className="text-gray-500">Focus on what matters</p>
      </div>

      <div className="mb-6">
        <form onSubmit={handleAddProject} className="flex gap-2">
          <Input
            value={projectInput}
            onChange={e => setProjectInput(e.target.value)}
            placeholder="New project name"
            className="flex-1"
          />
          <Button type="submit">
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        {projects.map(project => (
          <Card key={project.id} className="p-4">
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <EditableText
                  value={project.name}
                  onChange={(newName) => handleProjectNameChange(project.id, newName)}
                  className="text-lg font-medium"
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAddTask(project.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={project.tasks}
                strategy={verticalListSortingStrategy}
              >
                {project.tasks.map(task => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    projectId={project.id}
                    onToggle={(taskId, subtaskId) => 
                      handleToggleTask(project.id, taskId, subtaskId)
                    }
                    onAddSubtask={(taskId) => 
                      handleAddSubtask(project.id, taskId)
                    }
                    onAddTag={(taskId, subtaskId) => 
                      handleAddTag(project.id, taskId, subtaskId)
                    }
                    onAssign={(taskId, subtaskId) => 
                      handleAssign(project.id, taskId, subtaskId)
                    }
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;