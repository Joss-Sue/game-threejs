import express from 'express'
import sessionConfig from './config/session.js'
import userRoutes from './routes/userRoutes.js'
import viewRoutes from './routes/viewRoutes.js'
import roomRoutes from './routes/roomRoutes.js'
import scoreRoutes from './routes/scoreRoutes.js'

const app = express()

// Middleware
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true })) // reemplaza body-parser
app.use(express.json()) // por si usas JSON en tus peticiones
app.use(sessionConfig)

// Rutas
app.use(userRoutes)
app.use(viewRoutes)
app.use(roomRoutes)
app.use(scoreRoutes)

export default app



