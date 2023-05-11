const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3001;
const User = require('../userSchema');
const cors = require('cors');

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fishingcrew.waynefrancis', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware for parsing request body
app.use(express.json());

app.use(cors());

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.post('/register', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ firstName, lastName, email, password: hashedPassword });
      await newUser.save();
      res.status(201).json({ message: 'User registered successfully', newUser });
    } catch (error) {
      res.status(500).json({ message: 'Error registering user', error });
    }
  });

  app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Email or password is incorrect' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Email or password is incorrect' });
      }
  
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ message: 'User authenticated', token });
    } catch (error) {
      res.status(500).json({ message: 'Error signing in', error });
    }
  });
  
  

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

