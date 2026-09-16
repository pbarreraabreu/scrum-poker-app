# Security Policy

## Reporting Security Concerns

Please do not publish suspected vulnerabilities in public issues before they are reviewed.

To report a security concern, contact the repository owner through GitHub or open a private communication channel if one is provided in the repository profile. Include:

- A short description of the issue.
- Steps to reproduce.
- Potential impact.
- Any suggested mitigation.

I will make a good-faith effort to review and respond to valid reports.

## Secrets and Credentials

Do not commit:

- `.env` files
- Firebase service account JSON files
- Private keys
- Access tokens
- API secrets
- CI/CD credentials

The repository includes `.env.example` with placeholders only.

## Firebase Web Config

Firebase web app configuration is public by design. Values such as Firebase API key, project ID, auth domain, and app ID are expected to be visible in a browser bundle.

Security must be enforced with:

- Firebase Authentication
- Firestore security rules
- Realtime Database rules
- Principle-of-least-privilege document design
- Optional Firebase App Check

## Firebase App Check

Firebase App Check is recommended for production abuse protection. It can help reduce scripted traffic that does not originate from the deployed web app. App Check should be rolled out gradually:

1. Add App Check initialization.
2. Deploy without enforcement.
3. Monitor App Check metrics.
4. Enable enforcement for Firestore and Realtime Database when legitimate traffic is verified.

## Responsible Disclosure

Please provide enough time to investigate and remediate a reported issue before public disclosure. Do not access, modify, or delete data that does not belong to you while testing.
