// server/app.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

async function comparePassword(password, hashedPassword) {
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    return passwordMatch;
}
  

// Function to securely compare the plain text password with the hashed password
app.post('/login', async (req, res) => {
    const { name, password } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE name = $1', [name]);

      if (result.rows.length === 0) {
        console.log('User not found.');
        res.status(404).json({ error: 'User not found.' });
        return;
      }
  
      if (result.rows.length > 0) {
        const user = result.rows[0];
  
        // Compare the plain text password with the hashed password using the comparePassword() function
        const passwordMatch = await comparePassword(password, user.hashed_password);
  
        if (passwordMatch) {
          // Successful login
          res.json({ message: 'Login successful.', user });
        } else {
          console.log('Incorrect password.');
          res.status(401).json({ error: 'Incorrect password.' });
        }
      } 
      
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





