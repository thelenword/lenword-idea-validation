-- Enums
CREATE TYPE user_role AS ENUM ('founder', 'investor', 'admin');
CREATE TYPE startup_status AS ENUM ('draft', 'active', 'inactive');
CREATE TYPE deck_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Profiles (synced with auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'founder',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Startups (owned by founders)
CREATE TABLE startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  one_liner TEXT,
  status startup_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questionnaire Responses (1-to-1 with startups)
CREATE TABLE questionnaire_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL UNIQUE,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Validation Reports (mapped to Pydantic model)
CREATE TABLE validation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID REFERENCES startups(id) ON DELETE CASCADE NOT NULL,
  -- We'll store the complex nested structures as JSONB
  meta JSONB NOT NULL,
  scorecard JSONB NOT NULL,
  dimensions JSONB NOT NULL,
  assumptions_risk_matrix JSONB NOT NULL,
  failure_modes JSONB NOT NULL,
  risk_flags JSONB NOT NULL,
  next_moves JSONB NOT NULL,
  swot JSONB NOT NULL,
  market_validation JSONB NOT NULL,
  solution_feasibility JSONB NOT NULL,
  competitive_landscape JSONB NOT NULL,
  product_roadmap JSONB NOT NULL,
  deep_narrative_summary TEXT NOT NULL,
  provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pitch Deck Uploads (for LENWORD Insight)
CREATE TABLE pitch_deck_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  startup_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status deck_status NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Investor Reports (for LENWORD Insight)
CREATE TABLE investor_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pitch_deck_id UUID REFERENCES pitch_deck_uploads(id) ON DELETE CASCADE NOT NULL UNIQUE,
  executive_summary TEXT,
  market_analysis JSONB,
  financial_projections JSONB,
  team_evaluation JSONB,
  risk_assessment JSONB,
  investment_verdict TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_startups_updated_at BEFORE UPDATE ON startups FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_questionnaire_responses_updated_at BEFORE UPDATE ON questionnaire_responses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_pitch_deck_uploads_updated_at BEFORE UPDATE ON pitch_deck_uploads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Trigger for new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'founder'::public.user_role)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX idx_startups_founder_id ON startups(founder_id);
CREATE INDEX idx_validation_reports_startup_id ON validation_reports(startup_id);
CREATE INDEX idx_pitch_deck_uploads_investor_id ON pitch_deck_uploads(investor_id);
CREATE INDEX idx_investor_reports_pitch_deck_id ON investor_reports(pitch_deck_id);
