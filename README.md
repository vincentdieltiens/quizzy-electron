# Quizzy

Quizzy is a quiz game to play with friends using buzzers.

This game needs two monitors :
- One for the game that all the players will see (ideally a TV)
- One for the master that only the master player will see (ideally a laptop)


## 1. Development

Quizzy is uses :

- Typescript ([Angular](https://angular.io/))
- NodeJS + [Electron](https://www.electronjs.org/)
- A Buzzer connected via USB and speaking with the game using [HID](https://en.wikipedia.org/wiki/Human_interface_device)

### 1.1 Folder structure

The code is composed of two apps :

- An electron app that opens two windows
- An angular app that runs in each of the two windows (so the app is bootstraped twice)

Here are the folder structure explained :

- **app/** The directory of the code to run the Electron application
    - **buzzer/** The code of the buzzer using `node-hid` to speak with the buzzer
- **src/** The directory of the Angular application. It is the same application run twice (using `src/game.html` and `src/master` files)

### 1.2 Notes about Angular.

Since V5, Webpack (used by angular) does not automatically pollyfill the node libraries.
To allow using node in the angular app (used to speak with the main (electron) process), it is needed to make some changes to the webpack configuration.

This is the purpose of the file `angular-webpack.js` (that is referenced in `angular.json`)

All the communication between the angular app and the electron app is done using the angular service `ElectronService`.

### 1.3 Game Design

Electron creates a main process that creates one window for the game (rendered), another for the master (rendered).

The master manages the game state (teams, scores, questions, ...) and send his state to the game that changes his display according to the state.
It is also the master that receives the buzzer status and buzzer events (buzzer pressed).

The communication between the master and the game is done using Electron's `ipcMain` and `ipcRenderer` events.



