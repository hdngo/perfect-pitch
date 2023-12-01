// Variables
// ==============================================================================================================
const delay = ms => new Promise(res => setTimeout(res, ms));

let eventListenersRegistered = false;
let preloaded = false;
let noteList = ['C4', 'Db4', 'D4', 'Eb4', 'E4', 'F4', 'Gb4', 'G4', 'Ab4', 'A4', 'Bb4', 'B4'];
let soundFiles = {};

let currentScreen = 1;
let bgColors = [0xd0f4de, 0xa9def9, 0xf7ccbe];
let areaBgColors = [0x61f299, 0x54c6ff, 0xffab91];

let token = "";
let guestMode = false;

let lives = 3;
let score = 0;
let time = 0;
let gameStarted = false;
let answer = -1;
let timer = null;
let lastSaved = new Date();

let enableSFX = true;
let bgm = new Audio('sounds/bgm.mp3');
bgm.volume = 0.4;
bgm.addEventListener('ended', function () {
    this.currentTime = 0;
    this.play();
}, false);

// HTML elements
// ==============================================================================================================
const container = document.getElementById('container');
const tokenForm = document.getElementById('tokenForm');
const gameArea = document.getElementById('gameArea');
const area1 = document.getElementById('area-1');
const area1Content = document.getElementById('area-1-content');
const area2 = document.getElementById('area-2');
const area2Content = document.getElementById('area-2-content');
const area3 = document.getElementById('area-3');
const area3Content = document.getElementById('area-3-content');
const areas = [area1, area2, area3];
const leftArrow = document.getElementById('left-arrow');
const rightArrow = document.getElementById('right-arrow');
const settingsParent = document.getElementById('settingsParent');
const startScreen = document.getElementById('startScreen');
const endScreen = document.getElementById('endScreen');
const playArea = document.getElementById('playArea');
const scoreElements = document.getElementsByClassName('score');
const serverLeaderboard = document.getElementById('server-leaderboard');
const header = document.getElementById('header');
const tokenElement = document.getElementById('token');
const usernameElement = document.getElementById('username');
const muteBackground = document.getElementById('mute-background');
const unmuteBackground = document.getElementById('unmute-background');

// Functions
// ==============================================================================================================
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16),
        amt = Math.round(2.55 * percent),
        R = (num >> 16) - amt,
        G = (num >> 8 & 0x00FF) - amt,
        B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

function clearFocus() {
    area1.classList.remove('unfocused');
    area2.classList.remove('unfocused');
    area3.classList.remove('unfocused');
    area1.classList.remove('focused');
    area2.classList.remove('focused');
    area3.classList.remove('focused');
}

function focusAt(index) {
    clearFocus();

    for (let i = 0; i < areas.length; i++) {
        if (i < index) {
            areas[i].classList.add('unfocused');
            areas[i].style.backgroundColor = '#' + areaBgColors[i + 1].toString(16);
            areas[i].style.opacity = 0.3;
        } else if (i == index) {
            areas[i].classList.add('focused');
            areas[i].style.backgroundColor = '#' + areaBgColors[i].toString(16);
            areas[i].style.opacity = 1;
            leftArrow.style.stroke = '#' + areaBgColors[i].toString(16);
            rightArrow.style.stroke = '#' + areaBgColors[i].toString(16);
            settingsParent.style.backgroundColor = '#' + areaBgColors[i].toString(16);
            header.style.color = darkenColor('#' + areaBgColors[i].toString(16), 20);
        } else {
            areas[i].classList.add('unfocused');
            areas[i].style.backgroundColor = '#' + areaBgColors[i - 1].toString(16);
            areas[i].style.opacity = 0.3;
        }
    }

    let unfocusedScale = 0.8;
    let focusedScale = 1;

    if (index == 0) {
        area1.style.transform = 'translateX(64.2%)';
        area1Content.style.opacity = 1;
        area1Content.style.transform = `scale(${focusedScale})`;
        area2.style.transform = 'translateX(100%)';
        area2Content.style.opacity = 0;
        area2Content.style.transform = `scale(${unfocusedScale})`;
        area3.style.transform = 'translateX(200%)';
        area3Content.style.opacity = 0;
        area3Content.style.transform = `scale(${unfocusedScale})`;
        leftArrow.style.opacity = 0;
        leftArrow.style.cursor = 'default';
        rightArrow.style.opacity = 1;
        rightArrow.style.cursor = 'pointer';
    } else if (index == 1) {
        area1.style.transform = 'translateX(0%)';
        area1Content.style.opacity = 0;
        area1Content.style.transform = `scale(${unfocusedScale})`;
        area2.style.transform = 'translateX(0%)';
        area2Content.style.opacity = 1;
        area2Content.style.transform = `scale(${focusedScale})`;
        area3.style.transform = 'translateX(0%)';
        area3Content.style.opacity = 0;
        area3Content.style.transform = `scale(${unfocusedScale})`;
        leftArrow.style.opacity = 1;
        leftArrow.style.cursor = 'pointer';
        rightArrow.style.opacity = 1;
        rightArrow.style.cursor = 'pointer';
    } else if (index == 2) {
        area1.style.transform = 'translateX(-200%)';
        area1Content.style.opacity = 0;
        area2Content.style.transform = `scale(${unfocusedScale})`;
        area2.style.transform = 'translateX(-100%)';
        area2Content.style.opacity = 0;
        area2Content.style.transform = `scale(${unfocusedScale})`;
        area3.style.transform = 'translateX(-64.2%)';
        area3Content.style.opacity = 1;
        area3Content.style.transform = `scale(${focusedScale})`;
        leftArrow.style.opacity = 1;
        leftArrow.style.cursor = 'pointer';
        rightArrow.style.opacity = 0;
        rightArrow.style.cursor = 'default';
    }
}

function changeScreen(screen) {
    currentScreen = screen;
    document.body.style.backgroundColor = '#' + bgColors[currentScreen].toString(16);
    focusAt(screen);
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (e) {
        alert('Local storage unavailable. Token / local score data will not be saved locally.')
    }
}

function getFromLocalStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        alert('Local storage unavailable. Token / local score data will not be saved locally.')
        return null;
    }
}

function removeFromLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        alert('Local storage unavailable. Token / local score data will not be saved locally.')
    }
}

async function fetchFrom(url, method, headers, body) {
    try {
        const resp = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        }).then(response => response.json());


        if (resp.error != null) {
            alert(resp.error);
            return null;
        }

        if (resp.status != null && resp.status != 'Success!') {
            alert(resp.status);
            return null;
        }

        return resp;
    } catch (e) {
        alert('Server connection failed. Scores will not be saved and retrieved.')
        return null;
    }
}

function registerKeyDownEvents() {
    if (eventListenersRegistered) {
        return;
    }

    document.addEventListener('keydown', function (event) {
        if (event.key == 'ArrowLeft') {
            event.preventDefault();
            if (currentScreen > 0) {
                playClick();
                changeScreen(currentScreen - 1);
            }
        }

        if (event.key == 'ArrowRight') {
            event.preventDefault();
            if (currentScreen < 2) {
                playClick();
                changeScreen(currentScreen + 1);
            }
        }
    });

    eventListenersRegistered = true;
}

function updateScores() {
    for (let i = 0; i < scoreElements.length; i++) {
        scoreElements[i].innerHTML = score;
    }
}

function preloadSoundFiles() {
    if (preloaded) {
        return;
    }

    noteList.forEach(note => {
        soundFiles[note] = `sounds/Piano.ff.${note}.mp3`;
    });
    preloaded = true;
}

function updateLives() {
    document.getElementById('lives').innerHTML = lives;
}

function playNote(note) {
    const audio = new Audio(soundFiles[note]);
    audio.play();
}

async function saveScore() {
    if (new Date() - lastSaved < 1000) {
        return;
    }
    if (guestMode) {
        let scoreRecords = getFromLocalStorage('scoreRecords') !== null ? JSON.parse(getFromLocalStorage('scoreRecords')) : [];
        let today = new Date();

        scoreRecords.push({ score: score, date: today.toISOString() });
        saveToLocalStorage('scoreRecords', JSON.stringify(scoreRecords));
    } else {
        let headers = {
            'Content-Type': 'application/json'
        }

        let body = JSON.stringify({
            token: token,
            score: score
        });

        await fetchFrom('/submitScore', 'POST', headers, body);
    }

    lastSaved = new Date();
}

async function updateHighscores() {
    let scoreRecords = null;

    if (guestMode) {
        scoreRecords = JSON.parse(getFromLocalStorage('scoreRecords'));
    } else {
        let headers = {
            'Content-Type': 'application/json'
        }

        let body = JSON.stringify({
            token: token
        });

        scoreRecords = await fetchFrom('/getScores', 'POST', headers, body);
        scoreRecords = scoreRecords.scores;
    }

    if (scoreRecords == null) {
        scoreRecords = [];
    }

    let gameCount = scoreRecords.length;
    let dailyGameCount = scoreRecords.filter(record => {
        return record.date.slice(0, 10) == new Date().toISOString().slice(0, 10);
    }).length;
    let highestScore = scoreRecords.reduce((max, record) => {
        return record.score > max ? record.score : max;
    }, 0);
    let dailyHighestScore = scoreRecords.filter(record => {
        return record.date.slice(0, 10) == new Date().toISOString().slice(0, 10);
    }).reduce((max, record) => {
        return record.score > max ? record.score : max;
    }, 0);

    document.getElementById('games-life').innerHTML = gameCount;
    document.getElementById('games-daily').innerHTML = dailyGameCount;
    document.getElementById('highscore-daily').innerHTML = dailyHighestScore;
    document.getElementById('highscore-life').innerHTML = highestScore;
    document.getElementById('highscore').innerHTML = highestScore;

    await fetch('/getTopScores').then(async response => {
        let topScores = await response.json();
        topScores = topScores.scores;

        if (topScores == null || topScores == undefined) {
            serverLeaderboard.innerHTML = '<tr><td colspan="4">Unable to get scores from server.</td></tr>';
            return;
        }

        if (topScores.length == 0) {
            serverLeaderboard.innerHTML = '<tr><td colspan="4">No scores found.</td></tr>';
            return;
        } else {
            let leaderboardHTML = '';
            for (let i = 0; i < topScores.length; i++) {
                leaderboardHTML += `<tr><td>${i + 1}</td><td>${topScores[i].username}</td><td>${topScores[i].score}</td><td>${topScores[i].date.slice(0, 10)}</td></tr>`;
            }
            serverLeaderboard.innerHTML = leaderboardHTML;
        }
    });
}

async function updateUsernameAndToken() {
    if (guestMode) {
        tokenElement.innerHTML = 'N/A';
        usernameElement.innerHTML = 'Guest';
    } else {
        let headers = {
            'Content-Type': 'application/json'
        }

        let body = JSON.stringify({
            token: token
        });

        await fetchFrom('/getUsername', 'POST', headers, body).then(resp => {
            if (resp == null) {
                return;
            }

            tokenElement.innerHTML = token;
            usernameElement.innerHTML = resp.username;
        });
    }
}

function playClick() {
    if (enableSFX) {
        const audio = new Audio('sounds/click.mp3');
        audio.volume = 0.3;
        audio.play();
    }

}

function playBGM() {
    if (enableSFX) {
        bgm.play();
    }
}

// Initializations
// ==============================================================================================================
document.body.style.backgroundColor = '#' + areaBgColors[currentScreen].toString(16);
gameArea.style.display = 'none';

if (getFromLocalStorage('token') !== null) {
    document.getElementById('tokenInput').value = getFromLocalStorage('token');
}

if (getFromLocalStorage('enableSFX') !== null) {
    enableSFX = getFromLocalStorage('enableSFX') === 'true';
}

if (enableSFX) {
    muteBackground.style.display = 'block';
    unmuteBackground.style.display = 'none';
} else {
    muteBackground.style.display = 'none';
    unmuteBackground.style.display = 'block';
}

preloadSoundFiles();

// Event Listeners
// ==============================================================================================================
document.getElementById('tokenSubmit').addEventListener('click', async function (event) {
    event.preventDefault();
    playClick();
    playBGM();

    let rawToken = document.getElementById('tokenInput').value.trim();
    // Check if token is valid
    let headers = {
        'Content-Type': 'application/json'
    }

    let body = JSON.stringify({
        token: rawToken
    });

    if (!rawToken.match(/^[a-zA-Z0-9]+$/)) {
        alert('Invalid token.');
        return;
    }

    await fetchFrom('/getUsername', 'POST', headers, body).then(resp => {
        if (resp == null) {
            return;
        }

        token = rawToken;
        saveToLocalStorage('token', token);
        guestMode = false;
        updateUsernameAndToken();

        tokenForm.style.display = 'none';
        gameArea.style.display = 'flex';

        updateHighscores();

        changeScreen(1);

        registerKeyDownEvents();
    });
});

document.getElementById('tokenCreate').addEventListener('click', async function (event) {
    event.preventDefault();
    playClick();
    playBGM();

    let headers = {
        'Content-Type': 'application/json'
    }

    await fetchFrom('/createUser', 'GET', headers, null).then(resp => {
        if (resp == null) {
            return;
        }

        token = resp.token;
        saveToLocalStorage('token', token);
        guestMode = false;
        updateUsernameAndToken();

        tokenForm.style.display = 'none';
        gameArea.style.display = 'flex';

        updateHighscores();

        changeScreen(1);

        registerKeyDownEvents();
    });
})

document.getElementById('guestMode').addEventListener('click', function (event) {
    event.preventDefault();
    playClick();
    playBGM();
    guestMode = true;

    // Hide username form, show game area
    tokenForm.style.display = 'none';
    gameArea.style.display = 'flex';

    updateUsernameAndToken();

    updateHighscores();

    changeScreen(1);

    registerKeyDownEvents();
});

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', async function () {
        playNote(this.getAttribute('data-note'));

        if (gameStarted) {
            if (this.getAttribute('data-note') == noteList[answer]) {
                if (score < 10) { // 10 guesses
                    time = 30;
                    score += 1;
                } else if (score < 30) { // 20 guesses = 10 + 2*10 = 30
                    time = 20;
                    score += 2;
                } else if (score < 60) { // 30 guesses = 10 + 2*10 + 3*10 = 60
                    time = 10;
                    score += 3;
                } else {
                    time = 5;
                    score += 4;
                }

                updateScores();
                answer = Math.floor(Math.random() * 12);

                this.style.backgroundColor = '#7aff83';
                await delay(300);
                this.style.backgroundColor = null;
            } else {
                lives -= 1;
                updateLives();
                this.style.backgroundColor = '#ff4a4a';
                await delay(300);
                this.style.backgroundColor = null;

                if (lives <= 0) {
                    gameStarted = false;
                    clearInterval(timer);
                    document.getElementById('time').innerHTML = 0;
                    playArea.classList.remove('d-block');
                    playArea.classList.add('d-none');
                    endScreen.classList.remove('d-none');
                    endScreen.classList.add('d-block');
                    await saveScore();
                    updateHighscores();
                }
            }
        }
    });
});

document.getElementById('left-arrow').addEventListener('click', function () {
    playClick();
    if (currentScreen > 0) {
        changeScreen(currentScreen - 1);
    }
});

document.getElementById('right-arrow').addEventListener('click', function () {
    playClick();
    if (currentScreen < 2) {
        changeScreen(currentScreen + 1);
    }
});

document.getElementById('log-out').addEventListener('click', function () {
    let answer = confirm('Are you sure you want to log out?');

    if (!answer) {
        return;
    }

    token = "";
    document.getElementById('tokenInput').value = "";
    guestMode = false;
    removeFromLocalStorage('token');
    tokenForm.style.display = 'block';
    gameArea.style.display = 'none';
    document.body.style.backgroundColor = '#' + areaBgColors[1].toString(16);
});

document.getElementById('delete-account').addEventListener('click', function () {
    if (guestMode) {
        alert('You cannot delete your account as a guest!');
        return;
    }

    let answer = confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (!answer) {
        return;
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    let body = JSON.stringify({
        token: token
    });

    fetchFrom('/deleteUser', 'POST', headers, body).then(resp => {
        if (resp == null) {
            return;
        }

        token = "";
        document.getElementById('tokenInput').value = "";
        guestMode = false;
        removeFromLocalStorage('token');
        tokenForm.style.display = 'block';
        gameArea.style.display = 'none';
        document.body.style.backgroundColor = '#' + areaBgColors[1].toString(16);
    });
});

document.getElementById('username').addEventListener('click', async function () {
    if (guestMode) {
        alert('You cannot change your name as a guest!');
        return;
    }

    let newUsername = prompt('Enter new username (alphanumeric only):');

    if (newUsername == null) {
        return;
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    let body = JSON.stringify({
        token: token,
        username: newUsername
    });

    await fetchFrom('/setUsername', 'POST', headers, body).then(resp => {
        if (resp == null) {
            return;
        }

        updateUsernameAndToken();
        updateHighscores();
    });
});

document.getElementById('startGame').addEventListener('click', async function () {
    playClick();

    // Reveal play area
    playArea.classList.remove('d-none');
    playArea.classList.add('d-block');
    startScreen.classList.remove('d-block');
    startScreen.classList.add('d-none');

    // Initialization
    time = 30;
    lives = 3;
    score = 0;

    updateScores();
    updateLives();

    // Start timer
    document.getElementById('time').innerHTML = 30;
    timer = setInterval(async function () {
        document.getElementById('time').innerHTML = time;

        time -= 1;

        if (time < 0) {
            clearInterval(timer);
            document.getElementById('time').innerHTML = 0;
            playArea.classList.remove('d-block');
            playArea.classList.add('d-none');
            endScreen.classList.remove('d-none');
            endScreen.classList.add('d-block');
            gameStarted = false;

            await saveScore();
            updateHighscores();
        }
    }, 1000);

    // Start game
    gameStarted = true;

    answer = Math.floor(Math.random() * 12);
});

document.getElementById('playSound').addEventListener('click', async function () {
    if (gameStarted) {
        playNote(noteList[answer]);
        this.style.transform = 'scale(0.85)';
        await delay(100);
        this.style.transform = null;
    }
})

document.getElementById('endGame').addEventListener('click', function () {
    playClick();

    startScreen.classList.remove('d-none');
    startScreen.classList.add('d-block');
    endScreen.classList.remove('d-block');
    endScreen.classList.add('d-none');
})

document.getElementById('resetButton').addEventListener('click', async function () {
    playClick();
    let answer = confirm('Are you sure you want to reset your scores? This action cannot be undone.');

    if (!answer) {
        return;
    }

    if (guestMode) {
        removeFromLocalStorage('scoreRecords');
    } else {
        let headers = {
            'Content-Type': 'application/json'
        }

        let body = JSON.stringify({
            token: token
        });

        await fetchFrom('/deleteScores', 'POST', headers, body);
    }

    updateHighscores();
});

muteBackground.addEventListener('click', async function () {
    enableSFX = false;
    muteBackground.style.display = 'none';
    unmuteBackground.style.display = 'block';
    bgm.pause();
    saveToLocalStorage('enableSFX', enableSFX);
});

unmuteBackground.addEventListener('click', async function () {
    playClick();
    enableSFX = true;
    muteBackground.style.display = 'block';
    unmuteBackground.style.display = 'none';
    bgm.play();
    saveToLocalStorage('enableSFX', enableSFX);
});