import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import * as fs from 'node:fs'
import cors from 'cors'
import mongoose from 'mongoose'
import { Chat } from './models/chat.model.js'
import { User } from './models/user.model.js'

//Init de app, HTTP server, Socket.io y const de puerto
const port = 3000
const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {},
})

app.use(cors())

//Funciona para escribir datos al archivo de chats.txt
async function writeToFile(data) {
  try {
    await Chat.create(data)
  } catch (error) {
    console.log('Error writing file:', err)
  }
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
  
  socket.on('join', async (handshake) => {
    let connectionMessage = {
      who: {
        userId: '0', //Should be 0 if not known
        username: handshake.username
      },
      when: new Date(),
      what: {
        type: 'notification',
        content: `${handshake.username} se ha unido al chat • ${new Date().toLocaleTimeString()}`
      }
    }
    await Chat.find().then((data) => {
      io.emit('message', connectionMessage)
      io.emit(handshake.connectionHash, data)
    }).catch((err) => {
      console.log('Error reading file:', err)
    })
  });

  socket.on('message', async (msg) => {
    writeToFile(msg).then(() => {
      io.emit('message', msg)
    })
  });
});

app.use(express.json())

app.post('/login', (req, res) => {
  let userCreds = {
    username: req.body.username,
    hash: req.body.loginHash
  }
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error al tratar de iniciar sesion' })
    } else {
      let userData = JSON.parse('['+data.substring(0, data.length - 1)+']')
      if (userData.find((user) => user.username === userCreds.username && user.hash === userCreds.hash)) {
        res.status(200).send()
      } else {
        res.status(401).json({ error: 'Usuario no autorizado' })
      }
    }
  })
});

app.post('/signup', (req, res) => {
  let userCreds = {
    username: req.body.username,
    hash: req.body.loginHash
  }
  fs.readFile('users.txt', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error al tratar de iniciar sesion' })
    } else {
      if (data.includes(userCreds.username)) {
        res.status(401).json({ error: 'Usuario ya registrado' })
      } else {
        fs.appendFile('users.txt', JSON.stringify(userCreds)+',', (err) => {
          if (err) {
            res.status(500).json({ error: 'Error al tratar de registrarse' })
          } else {
            res.status(201).send()
          }
        })
      }
    }
  })
});


mongoose.connect('mongodb://localhost:27017/chatapp').then(() => {
  console.log('Connected to database')
  server.listen(port, () => {
    console.log(`Server running on port ${port}`)
  });
})
.catch(() => {
  console.log('Error connecting to database');
})
