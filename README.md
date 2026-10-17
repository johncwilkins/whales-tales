# Whale’s Tales

A static 3D counting game in the Bitter Radish bar, with one human and up to eight computer players. Includes selectable dolls, animated background pong, voices, optional comic bubbles, and mobile controls.

## Run locally

No build, backend, API key, or dependency installation is required.

```sh
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Deployment is the contents of `dist/` on any static HTTPS host. The current owner-private hosted version remains at https://whales-tales.johncwilkins.chatgpt.site.

## Test

Use Node.js 20 or newer:

```sh
npm test
```

Tests cover counting for 2–9 players, reverse/modulus/oscillating/Olympic rules, golden chairs, keyboard input, pause, ceremonies, quick bonuses, speech lifecycle, varied bot timing, chatter boundaries, and all 21 playable doll models plus Cindy including paddle attachments. Device audio and visual performance still require browser review.

## Controls and opening

- A or Space: Nay.
- Down Arrow: Who.
- S: preview Att’s pose.
- Number row/numeric keypad or onscreen number buttons: call a number.
- Pause works during play and ceremonies and stops speech immediately.
- Help explains all rules and pauses automatically.

The player immediately to your left starts the game and New round: “I’ll start,” the intro, then an automatic number. Subsequent round losers drink and restart. If you are the opener, choose a mode before your first number: Y Olympic, R reverse, O oscillating, M modulus. The choice is announced immediately and locks after the first number.

## Rules

Ordinary calls count clockwise from the caller’s left as 1. The selected player says Nay, the caller asks Who, and the selected player calls another number. Calling the player count selects yourself. Reverse counts counterclockwise. Olympic skips Nay/Who and uses 1.8/1.3/1.0/0.75-second deadlines for Easygoing/Regular/Quick/Real Quick. Oscillating flips direction after every number. Rare modulus calls reach twice the player count. Special rounds normally appear every 10–15 rounds, with a persistent banner.

A golden chair stays in the count while its occupant is away. The caller covers it and counts the next number from the empty chair. Departures and returns only occur between rounds. Short conversations also occur only between rounds, spaced 20–30 rounds apart.

Out-of-turn Nay is peepage. If the rightful player also fails to answer, both drink and the silent player restarts. Quick Who, wrong replies and timeouts are mistakes. Two consecutive round losses earn a flag and crushed cup; three trigger a chug. Another loser or a chug clears the flag/cup.

Correct replies within 0.5/1/1.8 seconds earn 3/2/1 quick points. A fast number call adds 30/20/10 percentage points to the selected computer’s next mistake chance. Computer response times vary; self-calls and Olympic replies remain brisk.

## Cast and display

Twenty-one selectable dolls: Wargo, Pekalsky, Saunders, Rose, Martens, Rueben, Colman, Recker, Att, Wilkins, Graham, Lefko, Levitt, Heard, Dauenheimer, Watson, Rooks, Komar, Brodeur, Tubby and McLaen. The two background pong players are chosen randomly from people absent from the counting table, and refreshed whenever the cast changes. Reference photographs are not included in this repository or served by the game.

Desktop labels follow their players. Mobile labels sit along the edges; Controls only hides the room. Mobile rendering uses reduced pixel ratio, no shadow pass and approximately 30fps. A shared doll factory supplies the counting table and background paddle holders.

## Speech

Uses the device’s speech engine. Available voices and quality vary. A speech line is dispatched once; missing events or errors settle the same job without replaying it. Native resume is used only when the engine reports paused. Short mobile speech has bounded completion, and callbacks are guarded against canceled turns.

## Source

- `dist/game.js`: turn controller, input, ceremonies and UI.
- `dist/rules.mjs`, `modes.mjs`, `timing.mjs`: counting, alternates and response timing.
- `dist/speech.mjs`, `voices.mjs`, `callouts.mjs`, `chatter.mjs`: speech and table dialogue.
- `dist/scene.js`, `roster.mjs`, `table-layout.mjs`: 3D room, dolls and camera/layout.
- `dist/assets/`: room textures.
- `tests/`: Node regression checks.

Three.js 0.169.0 is vendored under its MIT license; see `dist/vendor/THREE-LICENSE.txt`.

Settings remains available throughout ceremonies and peepage and pauses/resumes safely. Ordinary reply limits are Easygoing 9 seconds (former Regular), Regular 4.5 seconds (former Quick), Quick 3 seconds and Real Quick 1.8 seconds. Added more golden-chair excuses, wrong-word/silence/peepage heckles, Les chatter, Watson in a West Point shirt, barbecue chef Rooks, Wargo’s floppy olive outback hat, two central beer pitchers, a black twin-LED Mr. Beams spotlight and small table props.

When Saunders is seated and present, every third mistake (including non-ending peepage) triggers a brief NFL safety pose with both hands together overhead. The pose blends back to his resting arms.

## GitHub Pages

The Pages workflow tests and publishes `dist/` on pushes to `main` or when run manually. It intentionally skips deployment while the repository is private. After changing the repository to public, select **Settings → Pages → Source: GitHub Actions**, then run **Publish Whale's Tales** from Actions.

Rueben raises a tennis racket whenever a chug ceremony begins. Colman occasionally raises a red boxing glove when speaking. Cindy is a standing companion behind Graham (including when he plays background pong), never a selectable or counted player. Patty Prom has been removed.

On chugs, Komar stands and switches to an Army brigadier general’s uniform with a single silver star on each shoulder, then sits and changes back when the ceremony ends.

Rarely between rounds, Tubby volunteers for flags and a sip. This puts him one mistake from a chug while preserving the rightful round opener. Another player’s next mistake clears his flag normally; existing flags are not displaced.

Rooks always has a plate of barbecue ribs beside his beer, with lightweight animated steam and smoke rising from it.

Martens occasionally has a brief flickering cartoon hair fire while speaking. It extinguishes automatically and has a cooldown.

Tubby rarely opts out of an expected response with “Mexican!” and immediately takes the resulting penalty drink. Cindy gently shifts beside Graham’s chair, clear of his label. A small smoking grill stands behind Rooks.

Player menus list names alphabetically. When Tubby says “Mexican!”, the table calls him out for playing the wrong game.

Att poses on chugs with his left hand behind his neck and right arm extended upward at 45 degrees. S previews the pose immediately when Att is seated or playing pong, even while paused. Down Arrow remains Who.
