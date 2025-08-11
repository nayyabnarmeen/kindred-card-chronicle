-- First check what constraint is blocking us
SELECT conname, consrc FROM pg_constraint WHERE conrelid = 'family_members'::regclass;