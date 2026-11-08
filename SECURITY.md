# Security policy

Stakely is a hackathon prototype running on Solana devnet. It is not audited and is not ready for real funds or customer data.

## Supported versions

Only the `main` branch is supported. There are no maintained release branches.

## Reporting a vulnerability

Use GitHub private vulnerability reporting:

https://github.com/maxxexee/Stakely/security/advisories/new

Do not open a public issue for a security problem. Do not include private keys, wallet keypairs, service role keys, or customer data in a report. Use a minimal reproduction and redact sensitive values.

## Scope

In scope:

- The Anchor escrow program in `escrow/`
- The keeper and settlement path in `api/src/lib/escrow.ts` and `api/src/lib/poller.ts`
- Wallet authentication in `api/src/middleware/auth.ts`
- Secrets exposure in the repository, the API bundle, or the frontend bundle
- Cross-site scripting through challenge, profile, or receipt content

Out of scope:

- Solana devnet, Supabase, Railway, or TxLINE outages
- The mock TxLINE data path used while a token is being resolved
- Known limitations already listed in [MAINNET_READINESS.md](MAINNET_READINESS.md)
- Reports that require a compromised host, browser, or cloud account

## Response

This is a small project. Reports are handled on a best effort basis. There is no service level agreement.

If the report is valid, the fix and disclosure timing will be coordinated with the reporter.
