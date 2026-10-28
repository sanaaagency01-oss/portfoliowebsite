'use client'

import React, { useState } from 'react'
import { Check, Plus, Trash2, Calendar } from 'lucide-react'
import { ProjectTask } from '@/lib/types/studio'

interface ProjectTasksManagerProps {
  tasks: ProjectTask[]
  projectToken: string
  contractEnd?: string
  onTasksUpdated: (updatedTasks: ProjectTask[]) => void
}

export default function ProjectTasksManager({
  tasks,
  projectToken,
  contractEnd,
  onTasksUpdated,
}: ProjectTasksManagerProps) {
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDesc, setNewTaskDesc] = useState('')
  const [newTaskDue, setNewTaskDue] = useState('')
  const [saving, setSaving] = useState(false)

  const completedCount = tasks.filter((t) => t.completed).length

  const handleToggleTask = async (index: number) => {
    const updated = [...tasks]
    const item = updated[index]
    if (!item) return

    const newCompleted = !item.completed
    updated[index] = {
      ...item,
      completed: newCompleted,
      completedAt: newCompleted ? new Date().toISOString() : undefined,
    }

    onTasksUpdated(updated)

    try {
      setSaving(true)
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { tasks: updated },
        }),
      })
    } catch (e) {
      console.error('Failed toggling task', e)
    } finally {
      setSaving(false)
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim()) return

    const newTask: ProjectTask = {
      id: `task_${Date.now()}`,
      name: newTaskName.trim(),
      description: newTaskDesc.trim() || 'Төслийн явцад хийгдэх ажил',
      due: newTaskDue || contractEnd,
      completed: false,
    }

    const updated = [...tasks, newTask]
    onTasksUpdated(updated)

    setNewTaskName('')
    setNewTaskDesc('')
    setNewTaskDue('')
    setShowAddTask(false)

    try {
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { tasks: updated },
        }),
      })
    } catch (e) {
      console.error('Failed adding task', e)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Энэхүү task-ыг жагсаалтаас хасах уу?')) return
    const updated = tasks.filter((t) => t.id !== taskId)
    onTasksUpdated(updated)

    try {
      await fetch(`/api/projects/${projectToken}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contract: { tasks: updated },
        }),
      })
    } catch (e) {
      console.error('Failed deleting task', e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e0e0] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
            1
          </span>
          <h4 className="text-sm font-bold text-black">
            Төслийн явцад хийх Task-ууд (Workflow Checklist)
          </h4>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#666666]">
            {completedCount} / {tasks.length} Гүйцэтгэсэн
          </span>
          {saving && <span className="text-[11px] text-[#888888] animate-pulse">Хадгалж байна...</span>}
          <button
            type="button"
            onClick={() => setShowAddTask(!showAddTask)}
            className="flex items-center gap-1 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white hover:bg-[#222222]"
          >
            <Plus className="size-3" /> Task нэмэх
          </button>
        </div>
      </div>

      {/* Add Task Form Modal/Accordion */}
      {showAddTask && (
        <form onSubmit={handleAddTask} className="rounded-2xl border border-[#e0e0e0] bg-[#fafafa] p-5 shadow-xs">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[#888888] mb-3">
            Шинэ Task нэмэх
          </h5>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Task-ын нэр *</label>
              <input
                required
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="Жишээ: 6. Хэвлэлийн өнгөний сорил хийх"
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Төлөвлөсөн хугацаа</label>
              <input
                type="date"
                value={newTaskDue}
                onChange={(e) => setNewTaskDue(e.target.value)}
                className="w-full rounded-xl border border-[#e0e0e0] bg-white px-3.5 py-2 text-xs text-black outline-none focus:border-black"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-[#666666] block mb-1">Тайлбар</label>
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Task-ын явцад хийгдэх ажлын тайлбар..."
                rows={2}
                className="w-full rounded-xl border border-[#e0e0e0] bg-white p-2.5 text-xs text-black outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddTask(false)}
              className="rounded-full px-4 py-1.5 text-xs font-semibold text-[#666666] hover:text-black"
            >
              Болих
            </button>
            <button
              type="submit"
              className="rounded-full bg-black px-5 py-1.5 text-xs font-semibold text-white hover:bg-[#222222] transition"
            >
              Task хадгалах
            </button>
          </div>
        </form>
      )}

      {/* Tasks List */}
      <div className="flex flex-col gap-3">
        {tasks.map((task, idx) => {
          const isDone = task.completed
          return (
            <div
              key={task.id || idx}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 sm:p-5 transition ${
                isDone ? 'border-[#bbf7d0] bg-[#f0fdf4]/50' : 'border-[#e0e0e0] bg-white hover:border-[#cccccc]'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  type="button"
                  onClick={() => handleToggleTask(idx)}
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    isDone
                      ? 'border-[#166534] bg-[#166534] text-white shadow-xs'
                      : 'border-[#cccccc] bg-white hover:border-black text-transparent hover:text-[#cccccc]'
                  }`}
                  title={isDone ? 'Гүйцэтгэлийг цуцлах' : 'Гүйцэтгэсэн гэж тэмдэглэх'}
                >
                  <Check className="size-4 stroke-[3]" />
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-bold transition-all ${isDone ? 'line-through text-[#666666]' : 'text-black'}`}>
                      {task.name}
                    </h4>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        isDone ? 'border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]' : 'border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]'
                      }`}
                    >
                      {isDone ? '✅ Гүйцэтгэсэн' : '⏳ Хийгдэж буй'}
                    </span>
                  </div>

                  {task.description && (
                    <p className="mt-1 text-xs text-[#555555] max-w-2xl leading-relaxed">{task.description}</p>
                  )}

                  <div className="mt-2.5 flex flex-wrap items-center gap-4 text-[11px] text-[#888888]">
                    {task.due && (
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" /> Хугацаа: {task.due}
                      </span>
                    )}
                    {task.completedAt && (
                      <span className="text-[#166534]">
                        Баталгаажсан: {new Date(task.completedAt).toLocaleDateString('mn-MN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleToggleTask(idx)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                    isDone ? 'border border-[#e0e0e0] bg-white text-[#666666] hover:text-black' : 'bg-black text-white hover:bg-[#222222]'
                  }`}
                >
                  {isDone ? 'Цуцлах' : 'Гүйцэтгэсэн'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-[#aaaaaa] hover:text-[#dc2626] transition p-1"
                  title="Task хасах"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
