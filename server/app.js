import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import * as fs from 'node:fs'

//Init de app, HTTP server, Socket.io y const de puerto
const port = 3000
const server = createServer(express())
const io = new Server(server, {
  cors: {
    origin: '*',
  },
  connectionStateRecovery: {},
})

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

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
});