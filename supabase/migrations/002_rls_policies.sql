-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE pitch_deck_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_reports ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view, insert, and update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Startups: Founders can CRUD their own startups
CREATE POLICY "Founders can view own startups" ON startups FOR SELECT USING (auth.uid() = founder_id);
CREATE POLICY "Founders can insert own startups" ON startups FOR INSERT WITH CHECK (auth.uid() = founder_id);
CREATE POLICY "Founders can update own startups" ON startups FOR UPDATE USING (auth.uid() = founder_id);
CREATE POLICY "Founders can delete own startups" ON startups FOR DELETE USING (auth.uid() = founder_id);

-- Questionnaire Responses: Founders can CRUD for their own startups
CREATE POLICY "Founders can view own questionnaire responses" ON questionnaire_responses FOR SELECT USING (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = questionnaire_responses.startup_id AND startups.founder_id = auth.uid())
);
CREATE POLICY "Founders can insert own questionnaire responses" ON questionnaire_responses FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = startup_id AND startups.founder_id = auth.uid())
);
CREATE POLICY "Founders can update own questionnaire responses" ON questionnaire_responses FOR UPDATE USING (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = startup_id AND startups.founder_id = auth.uid())
);
CREATE POLICY "Founders can delete own questionnaire responses" ON questionnaire_responses FOR DELETE USING (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = startup_id AND startups.founder_id = auth.uid())
);

-- Validation Reports: Founders can view reports for their own startups.
CREATE POLICY "Founders can view own validation reports" ON validation_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = validation_reports.startup_id AND startups.founder_id = auth.uid())
);
CREATE POLICY "Founders can insert own validation reports" ON validation_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM startups WHERE startups.id = startup_id AND startups.founder_id = auth.uid())
);

-- Pitch Deck Uploads: Investors can CRUD their own uploads
CREATE POLICY "Investors can view own pitch decks" ON pitch_deck_uploads FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Investors can insert own pitch decks" ON pitch_deck_uploads FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "Investors can update own pitch decks" ON pitch_deck_uploads FOR UPDATE USING (auth.uid() = investor_id);
CREATE POLICY "Investors can delete own pitch decks" ON pitch_deck_uploads FOR DELETE USING (auth.uid() = investor_id);

-- Investor Reports: Investors can view reports for their own uploads
CREATE POLICY "Investors can view own reports" ON investor_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM pitch_deck_uploads WHERE pitch_deck_uploads.id = investor_reports.pitch_deck_id AND pitch_deck_uploads.investor_id = auth.uid())
);
CREATE POLICY "Investors can insert own reports" ON investor_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pitch_deck_uploads WHERE pitch_deck_uploads.id = pitch_deck_id AND pitch_deck_uploads.investor_id = auth.uid())
);
