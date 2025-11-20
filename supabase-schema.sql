-- Supabase Schema for License & Subscription Management

-- Subscriptions table (tracks Stripe subscriptions)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_customer_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Licenses table (license keys for desktop app)
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT UNIQUE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  device_id TEXT, -- Optional: track which device is using this license
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking (optional: track API calls, analyses, etc.)
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT REFERENCES licenses(license_key),
  feature TEXT NOT NULL, -- 'ai_analysis', 'keyword_tracking', etc.
  usage_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_licenses_key ON licenses(license_key);
CREATE INDEX idx_licenses_subscription ON licenses(subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);

-- Function to generate license key
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
BEGIN
  -- Generate format: XXXX-XXXX-XXXX-XXXX (16 chars, 4 groups)
  key := UPPER(
    SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 5 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 9 FOR 4) || '-' ||
    SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 13 FOR 4)
  );
  RETURN key;
END;
$$ LANGUAGE plpgsql;

-- Function to create license when subscription is created
CREATE OR REPLACE FUNCTION create_license_for_subscription()
RETURNS TRIGGER AS $$
DECLARE
  new_license_key TEXT;
  expiry_date TIMESTAMPTZ;
BEGIN
  -- Generate license key
  new_license_key := generate_license_key();
  
  -- Set expiry to subscription period end
  expiry_date := NEW.current_period_end;
  
  -- Create license
  INSERT INTO licenses (license_key, subscription_id, expires_at, is_active)
  VALUES (new_license_key, NEW.id, expiry_date, true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-create license when subscription is created
CREATE TRIGGER create_license_on_subscription
  AFTER INSERT ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION create_license_for_subscription();

-- Function to update license expiry when subscription renews
CREATE OR REPLACE FUNCTION update_license_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Update license expiry when subscription period extends
  IF NEW.current_period_end > OLD.current_period_end THEN
    UPDATE licenses
    SET expires_at = NEW.current_period_end,
        updated_at = NOW()
    WHERE subscription_id = NEW.id;
  END IF;
  
  -- Deactivate license if subscription is canceled
  IF NEW.status = 'canceled' AND OLD.status != 'canceled' THEN
    UPDATE licenses
    SET is_active = false,
        updated_at = NOW()
    WHERE subscription_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update license when subscription changes
CREATE TRIGGER update_license_on_subscription_change
  AFTER UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_license_expiry();

