const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const shortid = require('shortid');

const cors = require('cors')

const mongoose = require('mongoose')
// mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track' )

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


const users = [];
const exercises = [];

const getUsernameById = (id) => users.find(user => user._id === id).username;
const getExercisesFromUserWithId = (id) => exercises.filter(exe => exe._id === id);

app.post('/api/exercise/new-user', (req, res) => {
    const { username } = req.body;
  
  const newUser = {
    username,
    _id: shortid.generate()
  }
  
  users.push(newUser);
  
  console.log(users)
  
  res.json(newUser);
})

app.get('/api/exercise/users', (req, res) => {
        return res.json(users);
    });


app.post('/api/exercise/add', (req, res) => {
  const{ username, description, duration, userId, date } = req.body;
  
  const dateObj = date === '' ? new Date() : new Date(date);
  
  const newExercise = {
        username: getUsernameById(userId),
        description,
        duration: +duration,
        _id: userId,
        date: dateObj.toDateString(),
  }
  
  exercises.push(newExercise);
  
  console.log(newExercise)
  
  res.json(newExercise);
});

app.get('/api/exercise/log', (req, res) => {
     const { userId, from, to, limit } = req.query;
  
  let log = getExercisesFromUserWithId(userId);
  
  if(from) {
    const fromDate = new Date(from);
    log = log.filter(exe => new Date(exe.date) >= fromDate);
  }
  
  if(to) {
    const toDate = new Date(to);
    log = log.filter(exe => new Date(exe.date) <= toDate);
  }
  
  if(limit) {
    log = log.slice(0, +limit);
  }
  
  res.json({
    _id: userId,
    username: getUsernameById(userId),
    count: log.length,
    log 
  });
});


// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
