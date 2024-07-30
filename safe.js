const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); 

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// MongoDB connection
mongoose.connect('mongodb+srv://pranavi:pranu04@cluster0.byydxvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

// Define the User schema
const userSchema = new mongoose.Schema({
    company: String,
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

// Define the Scholarship_new schema
const scholarshipNewSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: String,
    eligibility: String,
    deadline: String,
    link: String
});
const Scholarship_new = mongoose.model('Scholarship_new', scholarshipNewSchema);

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/signup.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

app.post('/signup', async (req, res) => {
    try {
        const { company, username, password } = req.body;
        const newUser = new User({ company, username, password });
        await newUser.save();
        res.redirect('login.html');
    } catch (err) {
        if (err.code === 11000) { // Duplicate username error
            res.send('Username already exists. <a href="signup.html">Try again</a>');
        } else {
            res.send('An error occurred. Please try again.');
        }
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
        res.redirect('form.html');
    } else {
        res.send('Invalid login details. <a href="login.html">Try again</a>');
    }
});

app.post('/add-scholarship', async (req, res) => {
    try {
        const { name, description, eligibility, deadline, link } = req.body;
        const formattedDeadline = new Date(deadline).toISOString().split('T')[0];
        
        // Normalize the name to lowercase to ensure uniqueness regardless of case
        const normalizedName = name.toLowerCase();
        
        const newScholarship = new Scholarship_new({
            name: normalizedName,
            description,
            eligibility,
            deadline: formattedDeadline,
            link
        });
        
        await newScholarship.save();
        res.send('Scholarship added successfully! <a href="form.html">Add/Delete more</a>');
    } catch (err) {
        console.error('Error adding scholarship:', err); // Log the error details
        if (err.code === 11000) { // Duplicate scholarship name error
            res.send('Scholarship with this name already exists. <a href="form.html">Try again</a>');
        } else {
            res.send('An error occurred. Please try again.');
        }
    }
});

app.post('/delete-scholarship', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).send('Scholarship name is required.');
        }

        console.log(`Attempting to delete scholarship with name: ${name}`); // Log the request payload

        const result = await Scholarship_new.deleteOne({ name: name.toLowerCase() });
        if (result.deletedCount > 0) {
            res.send('Scholarship deleted successfully! <a href="form.html">Add/Delete more</a>');
        } else {
            res.send('No scholarship found with this name. <a href="form.html">Try again</a>');
        }
    } catch (err) {
        console.error('Error occurred while deleting scholarship:', err); // Log the error details
        res.send('An error occurred. Please try again.');
    }
});


// Routes for fetching scholarship_news
app.get('/api/scholarship_news', async (req, res) => {
    try {
        const scholarship_new = await Scholarship_new.find();
        res.json(scholarship_new);
    } catch (err) {
        console.error('Error fetching scholarships:', err);
        res.status(500).send('Error fetching scholarships.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
