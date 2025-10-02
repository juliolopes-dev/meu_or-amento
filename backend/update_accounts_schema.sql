-- Add icon and color columns to accounts table
ALTER TABLE accounts 
ADD COLUMN icon VARCHAR(50) DEFAULT 'wallet',
ADD COLUMN color VARCHAR(50) DEFAULT 'purple';

-- Update existing accounts with default values
UPDATE accounts SET icon = 'wallet', color = 'purple' WHERE icon IS NULL;
