import express from 'express'
import logger from 'morgan'
import dotenv from 'dotenv'
//import { createClient } from '@libsql/client' // Importa el cliente SQL personalizado
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import * as fs from 'node:fs'

dotenv.config() // Carga las variables de entorno desde el archivo .env

//Init de app, HTTP server, Socket.io y const de puerto
const port = process.env.PORT ?? 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {},
})

function writeToFile(data) {
  fs.appendFileSync('chats.txt', JSON.stringify(data)+',', (err) => {
    if (err) {
      console.log('Error writing file:', err)
    }
  })
}

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado!')

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado')
  })
  
  socket.on('join', (hash) => {
    fs.readFile('chats.txt', 'utf8', (err, data) => {
      if (err) {
        console.log('Error reading file:', err)
      } else {
        let msgData = data.substring(0, data.length - 1)
        io.emit(hash, JSON.parse('[' + msgData + ']'))
      }
    })
  })

  socket.on('message', async (msg) => {
    //push a list de mensajes en backend y actualizar archivo local
    writeToFile(msg)
    io.emit('message', msg)
  })
});

// // Crear una instancia del cliente de la base de datos
// const db = createClient({
//   url: 'libsql://star-rogue-proyectosoctavio.turso.io', // URL de conexión a la base de datos
//   authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3MjA0MTEyOTAsImlkIjoiODI0NDM2ZDctNDlkZi00OGVkLTkyNDctYjg3YzQ0ZTE0ODU0In0.Blzr_1r1lcSbUZlXYa_dSAGsLZFnH1rS_6MFW7o98razPj1Lmd89Sj4RCHI3_qZ-Tihkdx11Ihuq1uFJiB3_Dw'
//   // Token de autenticación
// })

// // Crear una tabla si no existe en la base de datos
// await db.execute(`
//   CREATE TABLE IF NOT EXISTS messages (
//     id INTEGER PRIMARY KEY AUTOINCREMENT,
//     content TEXT,
//     user TEXT
//   )
// `)



// Manejar eventos de Socket.io
// io.on('connection', (socket) => {
//   console.log('Un usuario se ha conectado!')

//   socket.on('disconnect', () => {
//     console.log('Un usuario se ha desconectado')
//   })
  
//   socket.on('message', async (msg) => {
//     //let result
//     const username = socket.handshake.auth.username ?? 'anonymous' // Obtiene el nombre de usuario desde el handshake del socket
//     // console.log({ username })
//     // try {
//     //   // Insertar el mensaje en la tabla 'messages'
//     //   result = await db.execute({
//     //     sql: 'INSERT INTO messages (content, user) VALUES (:msg, :username)',
//     //     args: { msg, username }
//     //   })
//     // } catch (e) {
//     //   console.error(e)
//     //   return
//     // }
  
//    // Emitir evento 'chat message' a todos los clientes conectados
//     io.emit('message', msg, /*result.lastInsertRowid.toString(),*/ )
//   })
  
    // Recuperar mensajes cuando se restablece la conexión del socket
  // if (!socket.recovered) { 
  //   try {
  //     const results = await db.execute({
  //       sql: 'SELECT id, content, user FROM messages WHERE id > ?',
  //       args: [socket.handshake.auth.serverOffset ?? 0]
  //     })
  
  
  //     // Emitir cada mensaje al socket que acaba de reconectarse
  //     results.rows.forEach(row => {
  //       socket.emit('chat message', row.content, row.id.toString(), row.user)
  //     })
  //   } catch (e) {
  //     console.error(e)
  //   }
  // }
// })

// app.use(logger('dev')) // Usar el middleware de logging Morgan para registrar las peticiones HTTP

// Establecer la ruta para el endpoint raíz '/'
// app.get('/', (req, res) => {
//   res.sendFile(process.cwd() + '/client/index.html')
// })

// Iniciar el servidor y escuchar en el puerto especificado
server.listen(port, () => {
  console.log(`Server running on port ${port}`)
});