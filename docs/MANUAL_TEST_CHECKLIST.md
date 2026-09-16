# Manual Test Checklist

Use this checklist before merging user-facing changes or deploying security-rule changes.

## Room Creation

- [ ] Open the home page.
- [ ] Navigate to Create Room.
- [ ] Enter a room name.
- [ ] Enter a facilitator name.
- [ ] Create the room.
- [ ] Confirm the room page loads.
- [ ] Confirm the room code is visible.

## Join by Code

- [ ] Open a second browser or private window.
- [ ] Navigate to Join Room.
- [ ] Enter the room code.
- [ ] Enter a nickname.
- [ ] Join as a player.
- [ ] Confirm the participant appears in the room.

## Join by Link

- [ ] Copy the join link from the room.
- [ ] Open it in another browser or private window.
- [ ] Confirm the code is prefilled.
- [ ] Enter a nickname and join.

## Facilitator Starts Round

- [ ] Confirm only the facilitator sees the Start Round button.
- [ ] Start a round.
- [ ] Confirm the status changes to Voting.

## Participant Voting

- [ ] Vote as the facilitator.
- [ ] Vote as a player.
- [ ] Confirm cards show voted state but not values before reveal.
- [ ] Join as a spectator.
- [ ] Confirm spectator voting is not allowed by rules or UI behavior.

## Reveal and Statistics

- [ ] Reveal as facilitator.
- [ ] Confirm vote values become visible.
- [ ] Confirm min, max, average, and mode display for numeric votes.
- [ ] Confirm non-numeric votes do not break statistics.

## Presence and Leave Behavior

- [ ] Close a participant tab.
- [ ] Confirm the participant eventually appears as left/offline.
- [ ] Rejoin with the same browser.
- [ ] Confirm presence updates again.

## Responsive and Theme Checks

- [ ] Check desktop layout.
- [ ] Check mobile viewport layout.
- [ ] Toggle dark mode.
- [ ] Toggle light mode.

## Repository Checks

- [ ] Run `npm run lint`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.

## Invalid Inputs

- [ ] Try an invalid room code.
- [ ] Try a non-existent room code.
- [ ] Try long room names and nicknames.
- [ ] Confirm user-facing errors are reasonable.

## Security Smoke Checks

- [ ] Confirm unauthenticated Firestore reads fail outside the app.
- [ ] Confirm non-participants cannot read session internals.
- [ ] Confirm users cannot write votes for another UID.
- [ ] Confirm users cannot write presence for another UID.
