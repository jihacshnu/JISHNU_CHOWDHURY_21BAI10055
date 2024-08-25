# Chess-like Game

This project is a chess-like game featuring custom characters with distinct movement and attack abilities. Players can select their characters and compete in a turn-based game with real-time multiplayer functionality using WebSockets.

## Project Structure

- **`public/`** - Contains the client-side code (HTML, CSS, JavaScript) and static assets like images.
- **`server/`** - Contains the server-side code (Node.js with Express and WebSocket).






    




## Run Locally

1. **Clone the project**

```bash
  git clone https://github.com/jihacshnu/JISHNU_CHOWDHURY_21BAI10055.git
```

2. **Go to the project directory**

```bash
  cd my-project
```

3. **Install dependencies**

   Install the necessary packages for the server using npm:

   ```bash
   npm install
    ```

4. **Start the server**

   Start the server with the following command:

   ```bash
   node server.js
   ```
   The server will be accessible at:

   HTTP: http://localhost:3000

4. **Navigate to the Client Directory**

   The client-side code is served statically by the server, so no separate client setup is required.

5.  **Access the Client**
 Once the server is running, open a web browser and navigate to:

   ```bash
   http://localhost:3000

   ```
  


 
## Features

- Character Selection: Players can choose characters including Pawn, Hero1, Hero2, and Hero3.

- Real-time Gameplay: Moves and game state updates are transmitted in real-time using WebSockets.
- Turn-based Mechanics: The game alternates turns between players.
- Game End Handling: When a player wins, a message is displayed, and a "Start Again" button is provided to reset the game.

## Character Movement and Rules

- Pawn: Moves one block in any direction (Left, Right, Forward, Backward).


- Hero1: Moves two blocks straight in any direction; kills opponents in its path.

- Hero2: Moves two blocks diagonally; kills opponents in its path.

- Hero3: Moves 2 steps straight and 1 step to the side in any direction; kills only the character at its final landing position.


## Screenshots

![App Screenshot](https://github.com/jihacshnu/JISHNU_CHOWDHURY_21BAI10055/blob/1e7965d6a027528969a15eb6f35792c55742dc27/image/Screenshot%20from%202024-08-26%2002-03-01.png)


![App Screenshot](https://github.com/jihacshnu/JISHNU_CHOWDHURY_21BAI10055/blob/1e7965d6a027528969a15eb6f35792c55742dc27/image/Screenshot%20from%202024-08-26%2002-36-22.png)
## License

[MIT](https://choosealicense.com/licenses/mit/)

## Contact
 For any questions or issues, please contact jishnuchowdhury30@gmail.com
