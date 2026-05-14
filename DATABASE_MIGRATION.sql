-- Database Migration for Password Reset Functionality
-- Run this script to add password reset support to the PES application

-- Add password reset fields to pesuser table
ALTER TABLE pesuser 
ADD COLUMN IF NOT EXISTS resetToken VARCHAR(255),
ADD COLUMN IF NOT EXISTS resetTokenExpiry TIMESTAMP;

-- Add index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_pesuser_resetToken ON pesuser(resetToken);

-- Add index for token expiry queries
CREATE INDEX IF NOT EXISTS idx_pesuser_resetTokenExpiry ON pesuser(resetTokenExpiry);

-- Optional: Add updated_at timestamp if not exists
ALTER TABLE pesuser 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_pesuser_updated_at ON pesuser;
CREATE TRIGGER update_pesuser_updated_at 
    BEFORE UPDATE ON pesuser 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pesuser'
AND column_name IN ('resetToken', 'resetTokenExpiry', 'updated_at');

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Password reset fields added to pesuser table.';
END $$;
