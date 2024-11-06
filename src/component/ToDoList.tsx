'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Todo {
  _id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  category: 'home' | 'personal' | 'work'
  dueDate: string
  completed: boolean
}

export default function TodoList() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'personal',
    dueDate: '',
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTodos()
    }
  }, [status, router])

  const fetchTodos = async () => {
    const res = await fetch('/api/todos')
    const data = await res.json()
    setTodos(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodo),
    })
    if (res.ok) {
      setNewTodo({
        title: '',
        description: '',
        priority: 'medium',
        category: 'personal',
        dueDate: '',
      })
      fetchTodos()
    }
  }

  const handleComplete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    })
    if (res.ok) {
      fetchTodos()
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      fetchTodos()
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo List</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          className="border p-2 mr-2"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          className="border p-2 mr-2"
        />
        <select
          value={newTodo.priority}
          onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as 'low' | 'medium' | 'high' })}
          className="border p-2 mr-2"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          value={newTodo.category}
          onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value as 'home' | 'personal' | 'work' })}
          className="border p-2 mr-2"
        >
          <option value="home">Home</option>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
        </select>
        <input
          type="date"
          value={newTodo.dueDate}
          onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Todo</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo._id} className="border p-2 mb-2 flex justify-between items-center">
            <div>
              <h3 className="font-bold">{todo.title}</h3>
              <p>{todo.description}</p>
              <p>Priority: {todo.priority}</p>
              <p>Category: {todo.category}</p>
              <p>Due: {new Date(todo.dueDate).toLocaleDateString()}</p>
            </div>
            <div>
              {!todo.completed && (
                <button onClick={() => handleComplete(todo._id)} className="bg-green-500 text-white p-2 rounded mr-2">
                  Complete
                </button>
              )}
              <button onClick={() => handleDelete(todo._id)} className="bg-red-500 text-white p-2 rounded">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}