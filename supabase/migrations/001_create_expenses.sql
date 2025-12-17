-- =========================================
-- Supabase Migration: Create expenses table
-- =========================================
CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -------------------------
-- Indexes
-- -------------------------
CREATE INDEX IF NOT EXISTS expenses_created_at_idx
  ON expenses (created_at DESC);

CREATE INDEX IF NOT EXISTS expenses_user_id_idx
  ON expenses (user_id);

CREATE INDEX IF NOT EXISTS expenses_category_idx
  ON expenses (category);

CREATE INDEX IF NOT EXISTS expenses_expense_date_idx
  ON expenses (expense_date);

-- -------------------------
-- Row Level Security
-- -------------------------
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- -------------------------
-- Drop existing policies (safe re-run)
-- -------------------------
DROP POLICY IF EXISTS "Users can view their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update their own expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON expenses;

-- -------------------------
-- Policies (STRICT: auth only)
-- -------------------------
CREATE POLICY "Users can view their own expenses"
  ON expenses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own expenses"
  ON expenses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses"
  ON expenses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses"
  ON expenses
  FOR DELETE
  USING (auth.uid() = user_id);