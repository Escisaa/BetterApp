-- BetterApp Cloud Sync Tables
-- Run this in your Supabase SQL Editor

-- User Tracked Apps
CREATE TABLE IF NOT EXISTS user_tracked_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  app_id TEXT NOT NULL,
  app_data JSONB NOT NULL,
  tracked_since TIMESTAMPTZ DEFAULT NOW(),
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  snapshots JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- User Keywords
CREATE TABLE IF NOT EXISTS user_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  keyword TEXT NOT NULL,
  source TEXT DEFAULT 'manual',
  position INTEGER,
  position_change INTEGER,
  last_checked TIMESTAMPTZ,
  notes JSONB DEFAULT '[]'::jsonb,
  popularity INTEGER,
  difficulty INTEGER,
  apps_in_ranking JSONB DEFAULT '[]'::jsonb,
  total_apps_in_ranking INTEGER,
  previous_position INTEGER,
  history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, keyword_id)
);

-- User Analyses
CREATE TABLE IF NOT EXISTS user_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id TEXT NOT NULL,
  app_id TEXT NOT NULL,
  app_name TEXT NOT NULL,
  app_icon TEXT,
  analysis_data JSONB NOT NULL,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analysis_id)
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_country TEXT DEFAULT 'US',
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_tracked_apps_user ON user_tracked_apps(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_user ON user_keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_keywords_app ON user_keywords(user_id, app_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON user_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_settings_user ON user_settings(user_id);

-- Enable Row Level Security
ALTER TABLE user_tracked_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own tracked apps" ON user_tracked_apps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tracked apps" ON user_tracked_apps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tracked apps" ON user_tracked_apps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tracked apps" ON user_tracked_apps
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own keywords" ON user_keywords
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own keywords" ON user_keywords
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own keywords" ON user_keywords
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own keywords" ON user_keywords
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses" ON user_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analyses" ON user_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own analyses" ON user_analyses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own analyses" ON user_analyses
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT ALL ON user_tracked_apps TO authenticated;
GRANT ALL ON user_keywords TO authenticated;
GRANT ALL ON user_analyses TO authenticated;
GRANT ALL ON user_settings TO authenticated;

