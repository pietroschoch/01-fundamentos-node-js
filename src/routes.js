import { randomUUID } from 'node:crypto'
import { Database } from './database.js'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
    {
        method: 'GET',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            const { search }  = req.query

            const tasks = database.select('tasks', search ? {
                title: search,
                description: search,
            } : null)

            return res.end(JSON.stringify(tasks))
        }
    },
    {
        method: 'POST',
        path: buildRoutePath('/tasks'),
        handler: (req, res) => {
            if (req.body == null) {
                return res.writeHead(403).end("The title is needed to create a task")
            }

            const { title, description } = req.body

            if (title === undefined) {
                return res.writeHead(403).end("The title is needed to create a task")
            }

            const created_at = Date.now()
            const updated_at = Date.now()
            const completed_at = null

            const task = {
                id: randomUUID(),
                title,
                description,
                completed_at,
                created_at,
                updated_at
            }
    
            database.insert('tasks', task)
    
            return res.writeHead(201).end()
        }
    },
    {
        method: 'PUT',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            if (req.body == null) {
                return res.writeHead(403).end("Fill the title or description to make an edition")
            }

            const { title: req_title, description: req_description } = req.body

            const existent_task = database.select('tasks', id ? {
                id: id,
            } : null)

            if (existent_task[0] == undefined) {
                return res.writeHead(404).end("Task not found")
            }

            const title = req_title == undefined ? existent_task[0].title : req_title
            const description = req_description == undefined ? existent_task[0].description : req_description
            const updated_at = Date.now()

            const { created_at, completed_at } = existent_task[0]


            database.update('tasks', id, {
                title,
                description,
                completed_at,
                created_at,
                updated_at
            })

            return res.writeHead(204).end()
            
        }
    },
    {
        method: 'DELETE',
        path: buildRoutePath('/tasks/:id'),
        handler: (req, res) => {
            const { id } = req.params

            const existent_task = database.select('tasks', id ? {
                id: id,
            } : null)

            if (existent_task[0] == undefined) {
                return res.writeHead(404).end("Task not found")
            }

            database.delete('tasks', id)
            return res.writeHead(204).end()
            
        }
    },
    {
        method: 'PATCH',
        path: buildRoutePath('/tasks/:id/complete'),
        handler: (req, res) => {
            const { id } = req.params

            const existent_task = database.select('tasks', id ? {
                id: id,
            } : null)

            if (existent_task[0] == undefined) {
                return res.writeHead(404).end("Task not found")
            }

            const updated_at = Date.now()

            const { created_at, title, description, completed_at:old_completed_at } = existent_task[0]

            const completed_at = old_completed_at === null ? Date.now() : null

           
            database.update('tasks', id, {
                title,
                description,
                completed_at, 
                created_at,
                updated_at
            })

            return res.writeHead(204).end()
            
        }
    }
]