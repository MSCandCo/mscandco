-- STEP 1: Add the missing enum value (must be run separately)

ALTER TYPE user_role_enum ADD VALUE 'distribution_partner';

SELECT 'Added distribution_partner to enum' as status;
