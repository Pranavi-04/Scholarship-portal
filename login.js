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
app.use(express.static(path.join(__dirname))); // Serve static files from the root directory

// MongoDB connection
mongoose.connect('mongodb+srv://pranavi:pranu04@cluster0.byydxvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// Define the User schema
const userSchema = new mongoose.Schema({
    company: String,
    username: { type: String, unique: true },
    password: String,
    isApproved: { type: Boolean, default: false }
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

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'http://localhost:3001/admin.html')); // Corrected path
});

// Admin routes
app.get('/admin/approval', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html')); // Corrected path
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
    const user = await User.findOne({ username, password, isApproved: true });
    if (user) {
        res.redirect('form.html');
    } else {
        const pendingUser = await User.findOne({ username, password, isApproved: false });
        if (pendingUser) {
            res.send('Your account is pending approval. Please wait for admin approval.');
        } else {
            res.send('Invalid login details. <a href="login.html">Try again</a>');
        }
    }
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Admin' && password === '12345') {
        res.redirect('/admin.html'); // Correct path
    } else {
        res.send('Invalid admin credentials. <a href="/admin.html">Try again</a>');
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


app.get('/admin/pending-users', async (req, res) => {
    try {
        const pendingUsers = await User.find({ isApproved: false });
        res.json(pendingUsers);
    } catch (err) {
        console.error('Error fetching pending users:', err);
        res.status(500).send('Error fetching pending users.');
    }
});

app.get('/admin/registered-users', async (req, res) => {
    try {
        const users = await User.find({ isApproved: true });
        res.json(users);
    } catch (err) {
        console.error('Error fetching registered users:', err);
        res.status(500).send('Error fetching registered users.');
    }
});

app.post('/admin/approve-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndUpdate(userId, { isApproved: true });
        res.send('User approved');
    } catch (err) {
        console.error('Error approving user:', err);
        res.status(500).send('Error approving user.');
    }
});

app.post('/admin/deny-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.send('User denied');
    } catch (err) {
        console.error('Error denying user:', err);
        res.status(500).send('Error denying user.');
    }
});

app.post('/admin/cancel-user/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        await User.findByIdAndDelete(userId);
        res.send('User registration cancelled');
    } catch (err) {
        console.error('Error cancelling user registration:', err);
        res.status(500).send('Error cancelling user registration.');
    }
});

// Routes for fetching scholarship_news
app.get('/api/scholarship_news', async (req, res) => {
    try {
        const scholarships = await Scholarship_new.find();
        res.json(scholarships);
    } catch (err) {
        console.error('Error fetching scholarships:', err);
        res.status(500).send('Error fetching scholarships.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
