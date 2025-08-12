-- Drop the restrictive relation constraint
ALTER TABLE public.family_members DROP CONSTRAINT family_members_relation_check;

-- Insert sample family data with proper relationships
INSERT INTO public.family_members (name, gender, birth_date, is_deceased, death_date, relation, parent_id, spouse_id, is_head, user_id, marriage_date, picture_url) VALUES
-- Grandparents
('William Johnson', 'male', '1940-03-15', false, null, 'head', null, null, true, null, '1965-06-20', null),
('Margaret Johnson', 'female', '1942-08-22', false, null, 'mother', null, null, false, null, null, null),

-- Parents (Children of grandparents)  
('Robert Johnson', 'male', '1970-05-15', false, null, 'father', null, null, false, null, '1995-04-10', null),
('Mary Johnson', 'female', '1972-08-22', false, null, 'mother', null, null, false, null, null, null),

-- Grandchildren
('John Johnson', 'male', '1995-03-10', false, null, 'son', null, null, false, null, null, null),
('Sarah Johnson', 'female', '1998-12-05', false, null, 'daughter', null, null, false, null, null, null),

-- Another family
('Frank Smith', 'male', '1938-11-30', true, '2020-01-15', 'head', null, null, true, null, '1960-05-12', null),
('Helen Smith', 'female', '1940-04-18', false, null, 'mother', null, null, false, null, null, null),

-- Their children
('Michael Smith', 'male', '1965-11-30', false, null, 'father', null, null, false, null, '1990-07-08', null),
('Lisa Smith', 'female', '1968-04-18', false, null, 'mother', null, null, false, null, null, null);