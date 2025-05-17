'use client'

import { createTRPCQueryHook } from './create-query-hooks'
import { 
  createTRPCOptimisticMutationHook, 
  createTRPCOptimisticItemMutationHook 
} from './create-optimistic-mutation-hook'

/**
 * Get all tasks with caching
 */
export const useTasks = createTRPCQueryHook(
  'tasks',
  'getAll',
  {
    staleTime: 1000 * 60, // 1 minute
    refetchOnWindowFocus: true
  }
)

/**
 * Add a new task with optimistic updates
 * 
 * This will immediately add the task to the UI before
 * the server confirms the creation, then refresh the data
 * when the server responds.
 */
export const useAddTask = createTRPCOptimisticMutationHook({
  mutationRouter: 'tasks',
  mutationProcedure: 'create',
  queryRouter: 'tasks',
  queryProcedure: 'getAll',
  updateCache: (queryClient, newTask, oldTasks = []) => {
    // Create an optimistic version of the new task
    const optimisticTask = {
      id: `temp-${Date.now()}`, // Temporary ID
      ...newTask,              // User-provided task data
      createdAt: new Date().toISOString(),
      completed: false,
      // Add any other default fields needed
    }
    
    // Add the optimistic task to the list
    return [...oldTasks, optimisticTask]
  },
})

/**
 * Toggle a task's completion status with optimistic updates
 * 
 * This will immediately update the task in the UI before
 * the server confirms the update.
 */
export const useToggleTask = createTRPCOptimisticItemMutationHook({
  mutationRouter: 'tasks',
  mutationProcedure: 'toggle',
  queryRouter: 'tasks',
  queryProcedure: 'getAll',
  getOptimisticItem: (input, tasks = []) => {
    // Map through tasks and toggle the completed status of the matching task
    return tasks.map(task => 
      task.id === input.id 
        ? { ...task, completed: !task.completed } 
        : task
    )
  },
})

/**
 * Delete a task with optimistic updates
 * 
 * This will immediately remove the task from the UI before
 * the server confirms the deletion.
 */
export const useDeleteTask = createTRPCOptimisticItemMutationHook({
  mutationRouter: 'tasks',
  mutationProcedure: 'delete',
  queryRouter: 'tasks',
  queryProcedure: 'getAll',
  getOptimisticItem: (input, tasks = []) => {
    // Filter out the task to be deleted
    return tasks.filter(task => task.id !== input.id)
  },
})