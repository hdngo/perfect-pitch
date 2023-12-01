// express server for final project
const express = require('express');
const path = require('path');
const database = require('./database.js');
const logger = require('morgan');
const fs = require('fs');

const app = express();
const port = JSON.parse(fs.readFileSync('settings.json', 'utf8')).port;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use('/', express.static('client'));

app.get('/', (req, res) => {
    let filePath = path.resolve(__dirname, '../client/index.html');
    res.sendFile(filePath);
});

app.get('/createUser', async (req, res) => {
    await database.createUser().then((data) => {
        res.status(200).send(JSON.stringify({ token: data }));
    });
});

app.post('/getUsername', async (req, res) => {
    if (req.body == null || req.body.token == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.getUsername(req.body.token).then((data) => {
        if (data == null) {
            res.status(400).send(JSON.stringify({ error: 'Invalid token.' }));
        } else {
            res.status(200).send(JSON.stringify({ username: data }));
        }
    });
});

app.post('/setUsername', async (req, res) => {
    if (req.body == null || req.body.token == null || req.body.username == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.setUsername(req.body.token, req.body.username).then((data) => {
        if (data != 'Success!') {
            res.status(400).send(JSON.stringify({ error: data }));
        } else {
            res.status(200).send(JSON.stringify({ status: data }));
        }
    });
});

app.post('/deleteUser', async (req, res) => {
    if (req.body == null || req.body.token == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.deleteUser(req.body.token).then((data) => {
        res.status(200).send(JSON.stringify({ status: data }));
    });
});

app.post('/submitScore', async (req, res) => {
    if (req.body == null || req.body.token == null || req.body.score == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.submitScore(req.body.token, req.body.score).then((data) => {
        res.status(200).send(JSON.stringify({ status: data }));
    });
});

app.post('/getScores', async (req, res) => {
    if (req.body == null || req.body.token == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.getScores(req.body.token).then((data) => {
        res.status(200).send(JSON.stringify({ scores: data }));
    });
});

app.post('/deleteScores', async (req, res) => {
    if (req.body == null || req.body.token == null) {
        res.status(400).send(JSON.stringify({ error: 'Invalid request.' }));
        return;
    }

    await database.deleteScores(req.body.token).then((data) => {
        res.status(200).send(JSON.stringify({ status: data }));
    });
});

app.get('/getTopScores', async (req, res) => {
    await database.getTopScores().then((data) => {
        res.status(200).send(JSON.stringify({ scores: data }));
    });
});

app.all('*', async (request, response) => {
    response.status(404).send(`Not found: ${request.path}`);
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
