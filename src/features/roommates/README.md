# Roommate backend contract

The roommate UI communicates through `roommateService`, which delegates to the configured provider. The mock provider is the current implementation; a future FastAPI provider should implement the same provider contract.

Expected backend operations:

- `POST /api/v1/matches/requests` - create a request for a target student.
- `POST /api/v1/matches/requests/{id}/accept` - accept as the explicitly supplied acting user; the request becomes `matched` only after both participants accept.
- `POST /api/v1/matches/requests/{id}/decline` - decline as a participant.
- `POST /api/v1/matches/requests/{id}/cancel` - cancel as the requester.
- `GET /api/v1/matches/requests` - retrieve requests visible to the authenticated student.
- `GET /api/v1/matches/confirmed` - retrieve confirmed matches for either participant.

Confirmed matches contain both participant IDs and the originating request ID. The provider is responsible for rejecting unauthorized actors, invalid transitions, and duplicate confirmed matches.