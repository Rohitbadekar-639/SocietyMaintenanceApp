-- Allow dynamic plan lengths on subscription payments and societies.
-- Required for: QUARTERLY (3 months), SIX_MONTHS, YEARLY.
-- Hibernate ddl-auto=update does NOT rewrite existing CHECK constraints.

ALTER TABLE subscription_payments
    DROP CONSTRAINT IF EXISTS subscription_payments_billing_period_check;

ALTER TABLE subscription_payments
    ADD CONSTRAINT subscription_payments_billing_period_check
    CHECK (billing_period IS NULL OR billing_period IN ('QUARTERLY', 'SIX_MONTHS', 'YEARLY'));

ALTER TABLE societies
    DROP CONSTRAINT IF EXISTS societies_billing_period_check;

ALTER TABLE societies
    ADD CONSTRAINT societies_billing_period_check
    CHECK (billing_period IS NULL OR billing_period IN ('QUARTERLY', 'SIX_MONTHS', 'YEARLY'));
