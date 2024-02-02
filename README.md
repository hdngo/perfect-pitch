# Perfect Pitch!
🎹 Train your pitch recognition skill through this small web game!

https://github.com/hdngo/perfect-pitch/assets/23444654/e8aa4f52-e7c4-4848-92df-dd9403a12c7d

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Key Features](#key-features)
3. [Usage Instructions](#usage-instructions)
4. [Setting Up Locally](#setting-up-locally)

## Project Architecture

**Perfect Pitch!** is a web app developed to help users train their pitch recognition ability. The application is designed with a user-friendly interface and interactive gameplay to make the learning process more engaging and enjoyable. The two main architectures of the app are its front-end and back-end sections.

The front-end (`client` folder) is developed using HTML, CSS and JavaScript. It houses the highly interactive interface while handling all game logic and communication with the back-end.  Since the application aims to replicate a game screen, Bootstrap is used to quickly define flex boxes and provide centering to those elements. Aside from that, however, most styling and all scripts/animations are provided solely through homegrown CSS and JavaScript.

The back-end (`server` folder) is developed using Node.js and Express.js. It provides an API for communicating with the front-end, and is also responsible for the handling of storage and retrieval of user/score data from the configured PostgreSQL database. Additionally, to combat against SQL injection and similar attacks, all user-submitted data is also validated through the back-end.

## Key Features

1.	**Authentication**: Token-based login system and guest mode allows users to start playing as fast as possible, while also providing a quick and easy way to save and keep track of their scores. 

2.	**Highly Interactive & Engaging**: Gameplay has a timer and lives system, and gets harder as the user progresses, which adds an element of challenge and excitement.

3.	**Statistics & Server Leaderboard**: Users may want to work towards a certain score milestone or position in the leaderboard, which gives them an incentive to keep on training their skills every day.


## Usage Instructions

Using **Perfect Pitch!** is straightforward and intuitive:

1.	**Access the Application**: Using your favorite browser, access the URL of the server where the application is hosted. If hosting locally on default settings, this will be at https://localhost:3000.

2.	**Authenticate**: The application distinguishes players using “tokens”, which are uniquely assigned to each account. Decide if you want to play as a registered user or a guest. If you want to register, choose the “No Token? Create one!” option to generate a new unique token and start playing right away. If you already have a token, enter it in the token field and click “Log in with Token!” to log in. To play as a guest, just choose the “Guest Mode” option.

    _Note: there are a number of limitations to the guest mode, including the inability to set your username and delete your account, as well as having your scores existing only on that browser and not tracked by the server, which means those scores will not show up on the server leaderboard._

3.	**Play the Game**: Click the “START!” button to begin playing. Click the play button on the screen and a note will be played. Your task is to click on the note on the piano that matches the pitch you hear. As the game progresses, your score will increase substantially, however, your time to answer each note will also be reduced. You have 3 lives, and when you lose all 3 or the timer is up, the game will end, and your final score will be displayed.

4.	**Navigating Screens**: Click the left/right arrow on the screen or on your keyboard to navigate across different screens. The “Statistics” screen features your daily and all-time stats, including the number of games played and the highest score. It also gives you an option to reset your progress or, in other words, remove all your past scores. The “Server Leaderboard” screen shows the top 10 scores submitted across all accounts.

5.	**Account Settings**: On the top you’ll find a text that gives you information about your account including your username and token. To log out or delete your account, click the corresponding text. To change your username, click on your bolded username and the application will present you with a form to do so. Note that usernames are strictly between 1 and 20 characters long (inclusive), and must be alphanumeric.

6.	**Settings**: You can turn off the button sound effects as well as the background music by clicking the pair of earphones in the bottom middle of the screen. This setting will be remembered the next time you visit the website.

## Setting Up Locally
Follow these steps to set up and run the server locally on your machine!

0. **Install Node.js**

    Please visit [Node.js](https://nodejs.org/en/download) to install the latest version of Node for your device.

1.	**Clone the project repository**

    If you don’t already have the project files, please clone them from the project’s GitHub repository using the following command:
  	
    `git clone https://github.com/hdngo/perfect-pitch.git`

3.	**Install dependencies**

    Navigate to the cloned project directory in your terminal using the command:
  	
    `cd perfect-pitch`
  	
    and then install the project’s dependencies using the command:
  	
    `npm install`

4.	**Configure database**

    This project was developed with ElephantDB as the back-end database system, however, you can use any PostgreSQL provider of your choice by simply replacing the connection string in the settings.json file with one of your database provider.

    Note that you will have to create your database using these commands (in order) to adhere to the required structure of this project’s data:
  	
    ```
    CREATE TABLE users (
       token VARCHAR(50) PRIMARY KEY,
       username VARCHAR(50)
    );
    
    CREATE TABLE scores (
       id SERIAL PRIMARY KEY,
       token VARCHAR(50),
       score INT,
       date VARCHAR(50),
       FOREIGN KEY (token) REFERENCES users(token)
    );
    ```

6.	Start the application!

    Once you configure the port in the settings.json file and everything is set up, run the following command at the project root directory (the directory containing the 2 folders client and server):
  	
    `npm start`

    If everything goes right, you should see these messages being logged:
  	
    ```
    Server started at http://localhost:<your-configured-port>
    db connected
    ```

Congratulations! You have successfully completed the setup!
