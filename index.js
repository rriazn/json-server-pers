const express = require('express');
const { readFile, writeFile } = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/events', (req, resp) => {
    readFile('./db.json', 'utf-8', (err, json) => {
        if(err) {
            resp.status(500).send('Server Error');
        }
        try {
            const data = JSON.parse(json);      
            const events = data.events || {};   
            resp.json(events);                  
        } catch (e) {
            resp.status(500).send('Invalid JSON');
        }       
    })
});


app.put('/events', (req, resp) => {
    const newEvents = req.body;
    readFile('./db.json', 'utf-8', (err, json) => {
        if(err) {
            resp.status(500).send('Server Error');
        }
        const db = JSON.parse(json);
        db.events = newEvents;

        writeFile('./db.json', JSON.stringify(db, null, 2), (err) => {
            if(err) {
                return resp.status(500).send('Server Error');
            }
            resp.status(200).send(db.events);
        });
    });
});



app.listen(3000, () => console.log('Server running on http://localhost:3000'));

