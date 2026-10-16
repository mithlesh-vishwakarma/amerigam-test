# Amerigam assessment MVP

A local, full-stack implementation of the supplied Amerigam reference screens. It uses Node's built-in HTTP server and a versioned frontend, so it has no install-time dependency or external service prerequisite.

## Run

```powershell
npm start
```

Open `http://localhost:3000`. The seed login is `creator` / `demo123`. Use `npm test` for API integration checks.

## Implemented

- Reference-inspired desktop home/feed, creator panel, post detail, and responsive layouts.
- Creation experience with Post, Reel, and Blog selectors, character limits, upload preview/replacement, validation, and publish feedback.
- Local JSON persistence (`data/db.json` created at runtime), session authentication, protected create/upload/delete endpoints.
- Persistent media uploads under `uploads/`, post fetching, search, likes, comments, ownership enforcement, and share/copy behavior.

## Notes

The initial repository did not contain an existing application, database, dependencies, assets, or environment configuration. The project therefore uses local persistence suitable for an assessment/demo rather than a production database. Set `PORT` in `.env` or the shell to change the server port. `SESSION_SECRET` is reserved for a production session implementation.
