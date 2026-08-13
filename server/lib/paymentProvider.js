/**
 * Payment provider abstraction.
 *
 * There is currently NO real payment gateway configured anywhere in this
 * project — no Stripe/JazzCash/EasyPaisa credentials, no SDK. The active
 * provider below is `mockProvider`: it never contacts a real payment
 * network and never moves real money. It exists purely so the checkout →
 * subscription → transaction flow can be built and tested end-to-end in
 * local development without pretending a real charge occurred.
 *
 * To wire in a real provider later: implement the same `charge()` contract
 * (same input shape, same `{ success, providerTransactionId,
 * providerCustomerId }` output shape) in a new module, e.g. stripeProvider.js,
 * and switch `getPaymentProvider()` to return it (e.g. based on
 * process.env.PAYMENT_PROVIDER). Nothing in routes/subscriptions.js needs to
 * change — it only ever talks to the interface below.
 */

const mockProvider = {
    name: "mock",
    testMode: true,

    // Always "succeeds" — this is explicitly test/mock mode. The caller
    // (routes/subscriptions.js) is responsible for never describing this as
    // a real charge to the user.
    async charge({ amountCents, currency, method }) {
        return {
            success: true,
            providerTransactionId: `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
            providerCustomerId: null,
        };
    },
};

function getPaymentProvider() {
    // Only "mock" is implemented today — there is nothing to branch on yet.
    // A real integration would read process.env.PAYMENT_PROVIDER here and
    // return the matching provider module.
    return mockProvider;
}

module.exports = { getPaymentProvider };
