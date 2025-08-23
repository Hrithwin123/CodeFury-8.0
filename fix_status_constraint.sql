-- Fix the status constraint in distributor_bids table to include 'replaced' status
-- First, drop the existing constraint
ALTER TABLE distributor_bids 
DROP CONSTRAINT IF EXISTS distributor_bids_status_check;

-- Recreate the constraint with all valid statuses including 'replaced'
ALTER TABLE distributor_bids 
ADD CONSTRAINT distributor_bids_status_check 
CHECK (status IN ('pending', 'accepted', 'rejected', 'replaced'));

-- Verify the constraint was created correctly
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'distributor_bids'::regclass 
AND contype = 'c';
