# Phase 5 booking boundary

The booking UI uses `bookingService`, which delegates to `BookingProvider`. The mock provider stores only request state for local development. It can create `pending` requests and withdraw them while pending; it cannot approve, confirm, fund, release, refund, or dispute a transaction.

Payment and escrow fields are display contracts, not frontend authority. `initializePayment` remains unavailable in the mock provider, and payment/escrow status is never fabricated as successful. A future FastAPI provider should implement the same provider contract after backend authorization and payment-provider contracts are agreed.

Owner approval, Scout booking activity, payment processing, escrow release, refunds, disputes, webhook reconciliation, and backend-confirmed booking transitions remain intentionally deferred because the repository has no existing contracts for them.

Future Paystack integration belongs behind the provider boundary. The backend must own checkout initialization, server-side verification, webhook authenticity and idempotency, provider-reference storage, payment-event audit records, booking/payment eligibility checks, and all authoritative transaction transitions. No Paystack secret or private payment credential belongs in this frontend.

Business decisions still required include the authoritative rent snapshot and pricing version, approval timing, the proposed seven-day hold trigger and release conditions, Scout commission eligibility, and any platform-fee responsibility. No commission percentage, platform fee, balance, settlement, or escrow release is represented here.