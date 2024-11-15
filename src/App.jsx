import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
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
  User, 
  Trash, 
  X, 
  Sun 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FixedSizeList } from 'react-window';
import { Toaster, toast } from 'react-hot-toast';

// Add theme context
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});

// Add theme provider component
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('constellation-theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('constellation-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Simple Button component
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-primary text-white shadow hover:bg-primary/90 dark:bg-blue-500 dark:hover:bg-blue-600',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground dark:border-gray-600 dark:hover:bg-gray-700',
    ghost: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-gray-700 dark:text-gray-200'
  };

  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    icon: 'h-8 w-8'
  };

  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-1
        focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50
        ${variants[variant]}
        ${sizes[size]}
        active:scale-95 
        transition-all duration-150
        hover:ring-2 hover:ring-offset-2
        dark:hover:ring-offset-gray-900
        ${className}
      `}
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
      className={`
        flex h-9 w-full rounded-md
        border border-gray-200 dark:border-gray-700
        bg-transparent
        px-3 py-1 text-sm
        shadow-sm transition-colors
        placeholder:text-gray-500 dark:placeholder:text-gray-400
        focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}
      `}
      {...props}
    />
  );
};

// Simple Card component
const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`
        rounded-xl border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-100
        shadow-sm hover:shadow-md
        transition-all duration-200 ease-in-out
        ${className}
      `}
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
const SortableTask = ({ task, projectId, onToggle, onEdit, onAddSubtask, onAddTag, onAssign, onDelete, onRemoveTag, onEditAssignee }) => {
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

  const touchStart = useRef(0);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStart.current = touch.clientX;
  };

  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const diff = touchStart.current - touch.clientX;
    
    if (Math.abs(diff) > 50) { // minimum swipe distance
      if (diff > 0) {
        onDelete(task.id); // swipe left to delete
      } else {
        onToggle(task.id); // swipe right to toggle
      }
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className="flex items-center gap-2 py-1 pl-2">
        <button 
          className="opacity-0 group-hover:opacity-40 hover:opacity-100 cursor-grab p-1" 
          {...attributes} 
          {...listeners}
          aria-label="Drag to reorder task"
          title="Drag to reorder task"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          className="w-4 h-4"
          id={`task-${task.id}`}
          aria-label={`Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`}
        />
        <label 
          htmlFor={`task-${task.id}`}
          className="flex-1 flex items-center gap-2"
        >
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
              aria-label="Add tag"
              title="Add tag"
            >
              <TagIcon className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAssign(task.id)}
              className="h-6 w-6 p-0"
              aria-label="Assign task"
              title="Assign task"
            >
              <User className="w-3 h-3" />
            </Button>
          </div>
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddSubtask(task.id)}
          aria-label="Add subtask"
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
                id={`subtask-${subtask.id}`}
                aria-label={`Mark subtask "${subtask.text}" as ${subtask.completed ? 'incomplete' : 'complete'}`}
              />
              <label 
                htmlFor={`subtask-${subtask.id}`}
                className="flex-1 flex items-center gap-2"
              >
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
                    aria-label="Add tag"
                    title="Add tag"
                  >
                    <TagIcon className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAssign(task.id, subtask.id)}
                    className="h-6 w-6 p-0"
                    aria-label="Assign subtask"
                    title="Assign subtask"
                  >
                    <User className="w-3 h-3" />
                  </Button>
                </div>
              </label>
            </div>
          ))}
        </div>
      )}
      <TaskActions
        task={task}
        onDelete={() => onDelete(task.id)}
        onEditTag={() => onAddTag(task.id)}
        onRemoveTag={(tag) => onRemoveTag(task.id, tag)}
        onEditAssignee={() => onEditAssignee(task.id)}
      />
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
    const timeOfDay = new Date().getHours();
    let defaultText = 'New task';
    
    // Smart defaults based on time
    if (timeOfDay < 12) defaultText = 'Morning task';
    else if (timeOfDay < 17) defaultText = 'Afternoon task';
    else defaultText = 'Evening task';
    
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: [...project.tasks, {
            id: Date.now().toString(),
            text: defaultText,
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

  const handleDelete = (projectId, taskId) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(task => task.id !== taskId)
        };
      }
      return project;
    }));
  };

  const handleRemoveTag = (projectId, taskId, tag) => {
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return {
                ...task,
                tags: task.tags.filter(t => t !== tag)
              };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const handleEditAssignee = (projectId, taskId) => {
    const assignee = prompt('Assign to:');
    if (!assignee?.trim()) return;

    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.map(task => {
            if (task.id === taskId) {
              return { ...task, assignee: assignee.trim() };
            }
            return task;
          })
        };
      }
      return project;
    }));
  };

  const handleDeleteProject = (projectId) => {
    const projectCopy = projects.find(p => p.id === projectId);
    setProjects(prev => prev.filter(p => p.id !== projectId));
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(resolve, 5000);
      }),
      {
        loading: 'Deleting project...',
        success: (data) => {
          return (
            <div className="flex items-center gap-2">
              <span>Project deleted</span>
              <button
                className="text-blue-500 hover:text-blue-700"
                onClick={() => setProjects(prev => [...prev, projectCopy])}
              >
                Undo
              </button>
            </div>
          );
        },
        error: 'Error deleting project',
      }
    );
  };

  const handleDeleteTask = (projectId, taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    setProjects(prev => prev.map(project => {
      if (project.id === projectId) {
        return {
          ...project,
          tasks: project.tasks.filter(t => t.id !== taskId)
        };
      }
      return project;
    }));
  };

  // Add intelligent task suggestions based on patterns
  const suggestNextAction = (project) => {
    const timeOfDay = new Date().getHours();
    const incompleteTasks = project.tasks.filter(t => !t.completed);
    
    if (timeOfDay < 12 && incompleteTasks.length > 0) {
      return `Continue working on "${incompleteTasks[0].text}"`;
    }
    return "What would you like to accomplish?";
  };

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

// Move main content to new component
const AppContent = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  return (
    <div className="min-h-screen transition-colors duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Toaster position="bottom-right" toastOptions={{
        style: {
          background: theme === 'dark' ? '#374151' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
        },
      }} />
      <div className="max-w-3xl mx-auto p-4">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">Constellation</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Focus on what matters</p>
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
          {projects.length === 0 && (
            <div className="text-center py-12">
              <Moon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-medium mb-2">Create your first project</h2>
              <p className="text-gray-500 mb-4">
                Start organizing your work by creating a new project above
              </p>
              <Button onClick={() => document.querySelector('input').focus()}>
                Get Started
              </Button>
            </div>
          )}
          {projects.map(project => (
            <Card key={project.id} className="p-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <EditableText
                    value={project.name}
                    onChange={(newName) => handleProjectNameChange(project.id, newName)}
                    className="text-lg font-medium"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddTask(project.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Task
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
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
                  <ProjectTasks tasks={project.tasks} projectId={project.id} />
                </SortableContext>
              </DndContext>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProjectTasks = ({ tasks, projectId }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <SortableTask
        task={tasks[index]}
        projectId={projectId}
        onToggle={(taskId) => handleToggleTask(projectId, taskId)}
        onEdit={(taskId, newName) => handleTaskNameChange(projectId, taskId, newName)}
        onAddSubtask={(taskId) => handleAddSubtask(projectId, taskId)}
        onAddTag={(taskId) => handleAddTag(projectId, taskId)}
        onAssign={(taskId) => handleAssign(projectId, taskId)}
        onDelete={(taskId) => handleDeleteTask(projectId, taskId)}
        onRemoveTag={(taskId, tag) => handleRemoveTag(projectId, taskId, tag)}
        onEditAssignee={(taskId) => handleEditAssignee(projectId, taskId)}
      />
    </div>
  );

  return (
    <FixedSizeList
      height={400}
      width="100%"
      itemCount={tasks.length}
      itemSize={60}
    >
      {Row}
    </FixedSizeList>
  );
};

export default App;