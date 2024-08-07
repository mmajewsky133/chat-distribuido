import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import * as fs from 'node:fs'
import cors from 'cors'

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
function writeToFile(data) {
  fs.appendFileSync('chats.txt', JSON.stringify(data)+',', (err) => {
    if (err) {
      console.log('Error writing file:', err)
    }
  })
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {});
  
  socket.on('join', (handshake) => {
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
    io.emit('message', connectionMessage)
    
    fs.readFile('chats.txt', 'utf8', (err, data) => {
      if (err) {
        console.log('Error reading file:', err)
      } else {
        let msgData = data.substring(0, data.length - 1)
        io.emit(handshake.connectionHash, JSON.parse('[' + msgData + ']'))
      }
    })
  });

  socket.on('message', async (msg) => {
    writeToFile(msg)
    io.emit('message', msg)
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

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
});