# Technical Summary for Reviewers

This document provides a concise technical overview of EstimateCards / Scrum Poker for external reviewers who want to understand the product, implementation approach, and engineering practices demonstrated in the public repository.

## Project Overview

EstimateCards / Scrum Poker is a web application for collaborative agile estimation. It allows a facilitator to create a planning room, invite participants with a short room code or link, collect hidden estimates, and reveal the results when the team is ready.

The project is implemented as a React single-page application backed by Firebase services for authentication, data storage, realtime updates, presence tracking, and hosting.

## Problem Solved

Distributed agile teams need a simple way to estimate work without exposing votes too early or adding meeting overhead. EstimateCards provides a focused Planning Poker workflow that supports remote and hybrid estimation sessions with minimal setup.

## Target Users

- Agile software development teams
- Scrum Masters and facilitators
- Product owners and engineering leads
- Remote or hybrid teams running story estimation sessions

## Main User Flow

1. A facilitator creates a room and receives a room code.
2. Participants join with the code or shared link.
3. The facilitator starts a voting round.
4. Participants choose cards from a Fibonacci-style deck.
5. Votes remain hidden while voting is active.
6. The facilitator reveals the round.
7. The app displays revealed votes and basic statistics.

## Technical Stack

- React for the frontend UI
- TypeScript for type safety
- Vite for local development and production builds
- TailwindCSS for styling
- React Router for client-side navigation
- Firebase Hosting for static site hosting
- Firebase Anonymous Authentication for participant identity
- Cloud Firestore for rooms, participants, rounds, votes, and room-code lookup
- Firebase Realtime Database for presence tracking
- ESLint, Vitest, and GitHub Actions for quality checks

## Architecture Summary

The application is a client-rendered React app served from Firebase Hosting. Browser clients authenticate anonymously and interact directly with Firebase using the web SDK. Firestore stores durable collaboration state, while Realtime Database stores ephemeral presence state.

The app keeps the backend small by relying on Firebase security rules to enforce room-scoped access, participant ownership, facilitator permissions, and valid vote values. This design fits a lightweight collaboration tool while keeping operational complexity low.

## Firebase Services Used and Why

- Firebase Hosting: serves the production single-page application.
- Anonymous Authentication: gives each browser a stable user ID without requiring login.
- Cloud Firestore: stores room metadata, participants, rounds, votes, and room-code lookup documents.
- Realtime Database: tracks online and recently-left participant presence with connection-aware updates.

## Security Model Summary

Room access is based on Firebase Anonymous Auth and membership in a room's participants collection. Firestore rules limit reads of session internals to joined participants, restrict participant and vote writes to the authenticated user's own UID, validate supported vote values, and reserve room control actions for the facilitator.

Room codes and join links function as invitations. Firebase web configuration is not treated as a secret; access control is enforced by security rules rather than by hiding client configuration.

## Realtime Collaboration Aspects

Firestore snapshot listeners keep room state, participant lists, active rounds, and votes synchronized across connected clients. Realtime Database presence updates track connection state and help the UI identify participants who are online, transiently disconnected, or have left recently.

The voting workflow intentionally hides individual vote values until the facilitator reveals the round, while still showing that participants have voted.

## Testing and CI Summary

The repository includes:

- ESLint configuration for the React and TypeScript source.
- Vitest tests for lightweight rendering and pure voting logic.
- GitHub Actions CI that runs lint, tests, and production build checks on pull requests and pushes to `main`.
- A manual test checklist for collaboration, security smoke checks, responsive layout, and theme behavior.

## Engineering Decisions

- Use anonymous authentication to reduce friction while retaining rule-enforceable user identity.
- Store durable room data in Firestore and presence state in Realtime Database because presence benefits from connection-aware semantics.
- Keep vote statistics as client-side derived data because they are lightweight and based on already-authorized room data.
- Prefer Firebase security rules for authorization instead of relying on client-only checks.
- Keep the UI focused on the core estimation workflow rather than adding account management or project-management scope.

## Known Limitations

- Room codes act as invitations, so anyone with a valid code can attempt to join.
- There is no full account system or persistent team workspace.
- End-to-end browser automation is not configured yet.
- Room lifecycle cleanup and archival are future improvements.
- Firebase App Check is recommended for additional abuse protection but is not yet enabled.

## Future Improvements

- Add Firebase App Check.
- Add optional story title or issue-link support for each round.
- Add automated end-to-end tests for core room workflows.
- Improve room lifecycle cleanup and archival.
- Add facilitator controls for removing inactive participants.
- Consider dependency upgrades that require migration planning, such as future React Router major versions.

## Technical Capabilities Demonstrated

- React/TypeScript frontend development
- Firebase-based cloud architecture
- Firestore data modeling
- Anonymous authentication
- Realtime collaboration
- Presence tracking
- Security rules
- CI/CD quality practices
- Documentation and open-source readiness
- Product thinking for agile teams
