import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import * as fs from 'node:fs'
import cors from 'cors'
import mongoose from 'mongoose'
import { Chat } from './models/chat.model.js'
import { User } from './models/user.model.js'
import { sha256 } from 'js-sha256'

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
app.use(express.json())

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

//Iniciar Sesion
app.post('/auth/login', async (req, res) => {
  let userCreds = {
    user: req.body.username,
    pass: req.body.password
  }

  try {
    let regUser = await User.findOne({ username: userCreds.user })
    if (regUser.pass === sha256(userCreds.pass+':'+regUser.salt)) {
      //Aqui debo de implementar el JWT
      res.status(200).send()
    } else {
      res.status(401).json({ error: 'Las credenciales no son correctas' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al tratar de iniciar sesion' })
  }
});

//Validar la existencia del user
app.get('/auth/users/:user', async (req, res) => {
  try {
    await User.findOne({ username: req.params.user }).then((data) => {
      if (data) {
        res.status(200).send()
      } else {
        res.status(404).send()
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al crear el usuario' })
  }
});

//Agregar User (Como admin)
app.post('/admin/users', async (req, res) => {
  let newUserCreds = {
    username: req.body.username,
    salt: req.body.salt,
    pass: req.body.pass,
    email: req.body.email,
    active: req.body.active
  }

  try {
    await User.create(newUserCreds).then(() => {
      res.status(201).send()
    });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al crear el usuario' })
  }
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
