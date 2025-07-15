This is the Dama webapp project by Yasmin Zaraket for Imperial College London's Dyson School of Design Engineering Computing 2 Applications coursework submission inherited from the submission template.

### Install dependencies locally
This template relies on a a few packages from the Node Package Manager, npm.
To install them run the following commands in the terminal.
```properties
npm install
npm install --prefix ./web-app/common
```
These won't be uploaded to your repository because of the `.gitignore`.
I'll run the same commands when I download your repos.

### Game Module – API
* My API includes start_board, piece_can_capture, queen_can_capture, possible_moves, make_move, who_has_won, is_queen_promotable, compute_move. 
- In addition, I created board and move utilities that are commonly used across implementations and that are polymorphic using currying, Ramda, and arrays of functions.
- Simplifying and unifying the return of piece_can_capture, queen_can_capture, and possible_moves to return sets of paths for a specific piece, made the game easy to program. 
- All these functions are pure functions. This helped with writing the code as if I'm writing maths which naturally led to less errors.

### Game Module – Implementation
* Implementation Highlights
- Switching from typical programming to writing pure functions and leveraging functoinal programming with Ramda was instrumental to reducing bugs and making the code efficient.
- piece_capture_count and queen_capture_count are recursive implementations that compute sequences of capture moves. Using Ramda with recursion made implementing a sophisticated recursion less challenging and more mathematical. Testing it is now direct and very well defined.
- onclick manages the control of the game which transitions between three states for two players: pick a piece to move, pick a target spot, and endgame.
- redraw_board reflects the control changes on the board with the styles of the cells separating styling from logic.
- The only place looping was needed was to detect sequences with variable lengths for queen captures that I found hard to code with Ramda. 

### Unit Tests – Specification
* Writing the test suites was very helpful flushing all logical mistakes as well as javascript code that wouldn't compile for specific situations. 
- Dama.test.js tests the validity of the boards and a two-depth move 
  - It also tests the throw_if_invalid function just to make sure that the testing is working and it's not passing accidentally 
- Behaviour.test.js performs thorough testing for each of the core functions of the game. Each one of the tests helped clean the code and defend against additional errors as previous tests fail when I'm writing new code, leading me to directly correct potential logical mistakes.

### Web Application
- Notes on AXE checks:
  - Need review: 52 checks are for color contrast
    - I computed the contrast ratio to be 10.98:1 (WebAIM.org) for 16 of these complaints which satisfies
    WCAG 2 AA contrast ratio thresholds 
    - For 64 cells, the cell does not have text and its background is contrasted against another background.
     Apparently AXE couldn't detect that automatically. The cells feature the same 10.98:1 contrast ratio
    - AXE only reported 49 out of the 80 similar issues.
    - I checked the reported overlapping areas and they do not block the visible text. They are needed for logical reasons. (e.g. helperText)
  - No serious issues reports and fixed all other moderate issues

- Gameboard Cell Legend:
  - Moveable pieces 
  - Target spots
  - Forced ply (including target spots)
  - Regular spots/pieces
  - Queens

- Basic game moves:
  - L1: If forced ply exists, Player must select one of the forced ply target spots
  - L2: Otherwise, Player selects a piece to move from highlighted moveable pieces
    - All possible plys with target spots are highlighted
    - If player selects other piece to move, go to L2
    - Otherwise, Player selects a target spot
  - Commit select ply: update board in code, update display 
  - Switch player
    - Current player's icon is highlighted
  - Check if game is a win
    - If not, Go to L1
    - If yes, update statistics and display end game text

- Interact with the server using promises to update statistics and select icons and add players
  - Presistent Data on the server side: (commented out for potential security threat)
    - It saves the data in the AppData directory using the fs. I don't think this is a security threat because it is happening on the server side and the user has no way to control what and where to write.
  
- For accessibility, at any point during the game, current player can:
  - Request draw
    - If other player accepts, game ends with a draw
  - Request a take back
    - If other player accepts, board and display are updated
    - This reduces intimidation/competition and helps the player learn
  - Resign
    - Game ends with current player losing
    - This speeds up obvious result board losses
  - Resize the window and play normally with a adjusted screen display
  - Access hints to guide new players what actions to take
  - All actions are keyboard accessible 
      - Tab through the page works
      - Arrow keys (up, down, left, right) navigate across cells
      - To go to a specific cell, type its letter-number coordinate
      - Enter and space work as click
  - Access to a tutorial of how to navigate the web application
  - About page to give a brief background on the game
  - Change their player icon 
  - Entering a new player name creates a new player
    - You can revert back to your old player by inputting the same name

### Finally
- Finally, I liked working on this game so much so that I am planning a future feature called "History" in DE_Dama v.0.0.2
  - Players will have the chance to go through their previous games and step into them to see the evolution of the game moves
  - Who knows, this might grow into a Dama social engine where people exchange Dama joy and wisdom
