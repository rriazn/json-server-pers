const express = require('express');
const { readFile, writeFile } = require('fs');
const cors = require('cors');
const crypto = require('crypto');
const args = require('minimist')(process.argv.slice(2));

const app = express();

app.use(cors());
app.use(express.json());


const sessionKey = crypto.randomBytes(32).toString('hex');




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


app.post('/login', (req, resp) => {
    const pwInput = req.body;
    readFile('./auth.json', 'utf-8', (err, json) => {
        if(err) {
            resp.status(500).send('Server Error');
        }
        try {
            const auth = JSON.parse(json);
            //const hash = crypto.createHash('sha256');
            //hash.update(pwInput.password);
            //const hashedPassword = hash.digest('hex');
            if (pwInput.password === auth.pwHash) {
                resp.status(200).json({
                    success: true,
                    sessionKey: sessionKey
                });
            } else {
                resp.status(401).json({
                    success: false,
                    message: "Invalid credentials"
                });
            }
        } catch (e) {
            resp.status(500).send('Invalid JSON');
        }       
    })
})


if(!args.pw) {
    console.log("No password provided");
} else {
    
    readFile('./auth.json', 'utf-8', (err, json) => {
        if(err) {
            console.error("error reading auth.json");
            process.exit(1);
        }
        const db = JSON.parse(json);
        const hash = crypto.createHash('sha256');
        hash.update(args.pw);
        const hashedPassword = hash.digest('hex');
        db.pwHash = hashedPassword;
        console.log(hashedPassword);
        writeFile('./auth.json', JSON.stringify(db, null, 2), (err) => {
            if(err) {
                console.error("error writing auth.json");
                process.exit(1);
            }
        });
    });
}
app.listen(3000, () => console.log('Server running on http://localhost:3000'));

