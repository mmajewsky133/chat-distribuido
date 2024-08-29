import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import cors from 'cors'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import { sha256 } from 'js-sha256'
import { Chat } from './models/chat.model.js'
import { User } from './models/user.model.js'

//Init de app, HTTP server, Socket.io y const de puerto
const PORT = 3000
const SECRET_KEY = 'FLMxpHVjpzLvIIv1lMeDR7y1bknzvhjS'
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

var userList = [];
io.on('connection', (socket) => {
  const id = socket.id;
  
  socket.on('join', async (handshake) => {
    //Agregar aqui que mande en el handshake el JSON Web Token y validarlo
    if (handshake.jwt) {
      try {
        jwt.verify(handshake.jwt, SECRET_KEY)

        userList[id] = handshake.username;
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
          io.emit(handshake.connectionHash, {
            messages: data,
            error: null
          });
          io.emit('userList-admin', userList)
        }).catch((err) => {
          console.log('Error reading file:', err)
        })
      } catch (error) {
        io.emit(handshake.connectionHash, {
          messages: null,
          error: 'El token no es valido'
        });
      }
    }
  });

  socket.on('message', async (msg) => {
    writeToFile(msg).then(() => {
      io.emit('message', msg)
    })
  });

  socket.on('disconnect', (username) => {
    if (userList[id]) {
      let disconnectionMessage = {
        who: {
          userId: '0', //Should be 0 if not known
          username: username
        },
        when: new Date(),
        what: {
          type: 'notification',
          content: `${userList[id]} ha abandonado el chat • ${new Date().toLocaleTimeString()}`
        }
      }
      io.emit('message', disconnectionMessage)
    }
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
    if (regUser && regUser.pass === sha256(userCreds.pass+':'+regUser.salt)) {
      let token;
      try {
        token = jwt.sign(
          { 
            user: regUser.username, 
            admin: regUser.admin 
          },
          SECRET_KEY,
          { expiresIn: '8h' }
        );
      } catch (error) {
        res.status(500).json({ error: 'Error al tratar de iniciar sesion' })
      }
      res.status(200).json({ token: token })
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
    res.status(500).json({ error: 'Hubo un error al obtener el usuario' })
  }
});

//Agregar User (Como admin)
app.post('/admin/users', async (req, res) => {
  let newUserCreds = {
    username: req.body.username,
    salt: req.body.salt,
    pass: req.body.pass,
    email: req.body.email,
    admin: true, //req.body.admin,
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

//Obtener Users (Como admin)
app.get('/admin/users', async (req, res) => {
  try {
    await User.find().then((data) => {
      res.status(200).json(data)
    });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener la lista de usuarios' })
  }
});

//Obtener User (Como admin)
app.get('/admin/users/:user', async (req, res) => {
  try {
    await User.findOne({ username: req.params.user }).then((data) => {
      if (data) {
        res.status(200).json(data)
      } else {
        res.status(404).send()
      }
    })
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener el usuario' })
  }
});

//Obtener Chats (Como Admin)
app.get('/admin/chats', async (req, res) => {
  //Como query params: Rango de Fecha (Obligratorio), Usuario (Si no se manda un usuario en especifico, se obtienen todos los chats)
  if (!req.query.date || !req.query.date.start || !req.query.date.end) {res.status(400).json({ error: 'Se debe de mandar un rango de fecha' })}
  
  let dateQuery = { when: { $gte: req.query.date.start, $lte: req.query.data.end } };
  let userQuery = req.query.user ? { who: { username: req.query.user } } : {};

  try {
    await Chats.find({
      $and: [
        dateQuery,
        userQuery
      ]
    }).then(() => {
      res.status(200).json(data)
    });
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al crear el rol' })
  }
});

//Obtener current users
app.get('/admin/currentusers', async (req, res) => {
  try {
    res.status(200).json(userList)
  } catch (error) {
    res.status(500).json({ error: 'Hubo un error al obtener los usuarios conectados' })
  }
});

mongoose.connect('mongodb+srv://mmajz133aee:QNuj6tMNhR09PDLh@chatapp.hh0a2.mongodb.net/?retryWrites=true&w=majority&appName=ChatApp').then(() => {
  console.log('Connected to database')
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  });
})
.catch(() => {
  console.log('Error connecting to database ');
})
