const pg = require('pg');
const fs = require('fs');

class Database {
    constructor() {
        // Read from config file settings.json
        const conString = JSON.parse(fs.readFileSync('settings.json', 'utf8')).connectionString;
        this.client = new pg.Client(conString);
        this.client.connect((err) => {
            if (err) {
                console.log('db connection error', err.stack);
            } else {
                console.log('db connected');
            }
        });
    }

    async _validateUsername(username) {
        if (username.length == 0) {
            return 'Please enter a username.';
        }

        if (username.length > 20) {
            return 'Username must be less than 20 characters.';
        }

        if (!username.match(/^[0-9a-zA-Z]+$/)) {
            return 'Username must be alphanumeric.';
        }

        return 'Success!';
    }

    async _validateToken(token) {
        if (!token.match(/^[0-9a-zA-Z]+$/)) {
            return 'Invalid token.';
        }

        return 'Success!';
    }

    async _validateScore(score) {
        if (score >= 0 && score <= 1000000) {
            return 'Success!';
        }

        return 'Invalid score.';
    }

    async createUser() {
        const token = Math.random().toString(36).substring(2);

        // Check if token already exists
        const query = {
            text: 'SELECT * FROM users WHERE token = $1',
            values: [token],
        };
        const result = await this.client.query(query);
        if (result.rows.length > 0) {
            return this.createUser();
        }

        // Token is new
        const query2 = {
            text: 'INSERT INTO users(token, username) VALUES($1, $2)',
            values: [token, 'Player'],
        };
        await this.client.query(query2);
        return token;
    }

    async getUsername(token) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        const query = {
            text: 'SELECT * FROM users WHERE token = $1',
            values: [token],
        };

        const result = await this.client.query(query);
        if (result.rows.length == 0) {
            return null;
        }

        return result.rows[0].username;
    }

    async setUsername(token, username) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        const validUsername = await this._validateUsername(username);
        if (validUsername != 'Success!') {
            return validUsername;
        }

        const query = {
            text: 'UPDATE users SET username = $1 WHERE token = $2',
            values: [username, token],
        };
        await this.client.query(query);
        return 'Success!';
    }

    async deleteUser(token) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        await this.deleteScores(token);

        const query = {
            text: 'DELETE FROM users WHERE token = $1',
            values: [token],
        };
        await this.client.query(query);
        return 'Success!';
    }

    async submitScore(token, score) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        const validScore = await this._validateScore(score);
        if (validScore != 'Success!') {
            return validScore;
        }

        // Check if token already exists
        if (await this.getUsername(token) == null) {
            return 'Invalid token.';
        }

        let today = new Date();
        const query = {
            text: 'INSERT INTO scores(token, score, date) VALUES($1, $2, $3)',
            values: [token, score, today.toISOString()],
        };

        await this.client.query(query);
        return 'Success!';
    }

    async getScores(token) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        // Check if token already exists
        if (await this.getUsername(token) == null) {
            return 'Invalid token.';
        }

        const query = {
            text: 'SELECT * FROM scores WHERE token = $1 ORDER BY score DESC LIMIT 10',
            values: [token],
        };

        const result = await this.client.query(query);
        return result.rows;
    }

    async deleteScores(token) {
        const validToken = await this._validateToken(token);
        if (validToken != 'Success!') {
            return validToken;
        }

        // Check if token already exists
        if (await this.getUsername(token) == null) {
            return 'Invalid token.';
        }

        const query = {
            text: 'DELETE FROM scores WHERE token = $1',
            values: [token],
        };
        await this.client.query(query);
        return 'Success!';
    }

    async getTopScores() {
        const query = {
            text: 'SELECT * FROM scores ORDER BY score DESC LIMIT 10',
        };

        const result = await this.client.query(query);

        // Replace token with username
        const newTop = [];
        for (let i = 0; i < result.rows.length; i++) {
            const username = await this.getUsername(result.rows[i].token);
            newTop.push({ username: username, score: result.rows[i].score, date: result.rows[i].date });
        }

        return newTop;
    }
}


let database = new Database();
module.exports = database;
