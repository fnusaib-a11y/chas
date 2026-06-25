# CASH Ecosystem Security Specification

## Data Invariants
1. **User Identity**: Users can only perform writes (create/update) on documents they own (e.g., their own user profile, task logs, bookings).
2. **Financial Integrity**: Users cannot update their own balance directly via client-side SDKs (needs admin/server logic, though current app might be doing it client-side for "demo" purposes, I should restrict it where possible).
3. **Ecosystem Isolation**: Service bookings, Courier orders, and AI requests must be private to the creating user and the assigned provider.
4. **Marketplace Integrity**: AI assets and Student resources are public for reading but only the owner can modify.

## The "Dirty Dozen" Payloads (Identity & Integrity Attack Vectors)
1. **Balance Hijack**: An attacker tries to update their `balance` field in `users/{uid}`.
2. **Admin Escalation**: An attacker tries to set `isAdmin: true` in `users/{uid}`.
3. **Ghost Post**: An attacker tries to create a `post` with a `senderId` that doesn't match their UID.
4. **Booking Spoof**: An attacker tries to create a `serviceBooking` for another user.
5. **Tracking Poison**: An attacker tries to update the `trackingId` of a `courierOrder` they didn't create.
6. **Asset Theft**: An attacker tries to update the `price` of an `aiAsset` they don't own.
7. **Phantom Message**: An attacker tries to send a `groupMessage` with a fake `senderName`.
8. **Resource Poisoning**: An attacker tries to upload a `studentResource` with a 10MB description string.
9. **History Scraping**: An attacker tries to list all `serviceBookings` across the platform.
10. **Withdrawal Manipulation**: An attacker tries to mark their own `withdrawal` as `completed`.
11. **Order Spoofing**: An attacker tries to create an `order` with a fake `totalPrice`.
12. **Task Log Forgery**: An attacker tries to create a `taskLog` for a task they didn't do, setting status to `approved`.

## Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|-------------------|--------------------|
| users | Protected (uid match) | Vulnerable (balance) | Protected (size) |
| serviceBookings | Protected (uid match) | Protected (enum) | Protected (size) |
| courierOrders | Protected (uid match) | Protected (enum) | Protected (size) |
| aiAssets | Protected (ownerId) | Protected (enum) | Protected (size) |
| studentResources | Protected (uid match) | N/A | Protected (size) |
| taskLogs | Protected (uid match) | Vulnerable (status) | Protected (size) |
