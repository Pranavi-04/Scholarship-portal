const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const cron = require('node-cron');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb+srv://pranavi:pranu04@cluster0.byydxvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

const scholarshipSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: String,
    eligibility: String,
    deadline: String,
    link: String
});

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

const scholarship2Schema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    description: String,
    link: String
});

const Scholarship2 = mongoose.model('Scholarship2', scholarship2Schema);

// Function to insert data from scholarships.json into Scholarship collection
async function insertScholarshipsFromJson() {
    try {
        const scholarshipsData = JSON.parse(fs.readFileSync('scholarships.json', 'utf8'));

        // Get all current scholarship names from the JSON data
        const scholarshipNames = scholarshipsData.map(s => s.name);

        // Remove scholarships from the database that are not in the JSON file
        await Scholarship.deleteMany({ name: { $nin: scholarshipNames } });

        // Insert or update each document based on 'name' field
        for (let scholarship of scholarshipsData) {
            try {
                await Scholarship.findOneAndUpdate(
                    { name: scholarship.name },
                    scholarship,
                    { upsert: true, new: true }
                );
                console.log(`Inserted or updated: ${scholarship.name}`);
            } catch (error) {
                console.error(`Error inserting or updating scholarship ${scholarship.name}:`, error);
            }
        }

        console.log('Scholarships data inserted, updated, or deleted in MongoDB.');
    } catch (err) {
        console.error('Error inserting scholarships data:', err);
    }
}

// Function to insert data from scholarships2.json into Scholarship2 collection
async function insertScholarships2FromJson() {
    try {
        const scholarships2Data = JSON.parse(fs.readFileSync('scholarships2.json', 'utf8'));

        // Get all current scholarship2 names from the JSON data
        const scholarship2Names = scholarships2Data.map(s => s.name);

        // Remove scholarships2 from the database that are not in the JSON file
        await Scholarship2.deleteMany({ name: { $nin: scholarship2Names } });

        // Insert or update each document based on 'name' field
        for (let scholarship of scholarships2Data) {
            try {
                await Scholarship2.findOneAndUpdate(
                    { name: scholarship.name },
                    scholarship,
                    { upsert: true, new: true }
                );
                console.log(`Inserted or updated: ${scholarship.name}`);
            } catch (error) {
                console.error(`Error inserting or updating scholarship2 ${scholarship.name}:`, error);
            }
        }

        console.log('Scholarships2 data inserted, updated, or deleted in MongoDB.');
    } catch (err) {
        console.error('Error inserting scholarships2 data:', err);
    }
}


// Function to run the scraper.py script
function runScraperPythonScript(scriptName) {
    return new Promise((resolve, reject) => {
        exec(`set PYTHONIOENCODING=utf-8 && python ${scriptName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error running ${scriptName}:`, error);
                reject(error);
            }
            console.log(`${scriptName} output:`, stdout);
            if (stderr) {
                console.error(`${scriptName} stderr:`, stderr);
            }
            resolve();
        });
    });
}


// Schedule tasks to run at 12:05 AM for scholarships collection
cron.schedule('05 00 * * *', async () => {
    console.log('Running scraper script to update scholarships...');
    try {
        await runScraperPythonScript('scraper.py');
        await insertScholarshipsFromJson();
    } catch (err) {
        console.error('Error running scraper script:', err);
    }
});

// Schedule tasks to run at 12:10 AM for scholarships2 collection
cron.schedule('10 00 * * *', async () => {
    console.log('Running scrape2 script to update scholarships2...');
    try {
        await runScraperPythonScript('scrape.py');
        await insertScholarships2FromJson();
    } catch (err) {
        console.error('Error running scrape2 script:', err);
    }
});

// Routes for fetching scholarships
app.get('/api/scholarships', async (req, res) => {
    try {
        const scholarships = await Scholarship.find();
        res.json(scholarships);
    } catch (err) {
        console.error('Error fetching scholarships:', err);
        res.status(500).send('Error fetching scholarships.');
    }
});

// Routes for fetching scholarships2
app.get('/api/scholarships2', async (req, res) => {
    try {
        const scholarships2 = await Scholarship2.find();
        res.json(scholarships2);
    } catch (err) {
        console.error('Error fetching scholarships2:', err);
        res.status(500).send('Error fetching scholarships2.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
