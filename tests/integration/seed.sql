-- Fixture data for the integration tests and the CI build. FAKE DATA ONLY: never copy real member
-- rows in here. Dates are relative to CURRENT_DATE so fixtures never expire.
--
-- trip_count (member) and lead_count (trip_leader) start at 0 and are driven by the trip_roster
-- triggers, exactly like production.

INSERT INTO member (member_id, name, pronouns, email, phone, dues_data, first_aid_data, car_data,
                    driver_data, emergency_data, policy_agreement, waiver_agreement, school_year,
                    medical_data, holds, signup_count, years_active, campus)
VALUES
  -- Active: paid dues, both agreements, no holds, current first aid, car with hitch, current license.
  (1, 'Alice Anderson', 'she/her', 'alice@purdue.edu', '765-555-0001',
   json_build_object('Type', 'Annual', 'Expires', (CURRENT_DATE + 180)::text, 'Paid', true),
   json_build_object('Type', 'WFA', 'Expires', (CURRENT_DATE + 365)::text, 'Verified', true),
   json_build_object('Model', 'Subaru Outback', 'Nickname', 'Blue', 'Color', 'Blue', 'Capacity', '5', 'Hitch', true),
   json_build_object('License', 'X123', 'State', 'IN', 'Expires', (CURRENT_DATE + 365)::text, 'Verified', true),
   json_build_object('Name', 'Pat Anderson', 'Email', 'pat@example.com', 'Phone', '765-555-1001', 'Relation', 'Parent'),
   true, true, 'Senior',
   json_build_object('Allergies', 'None', 'Conditions', 'None', 'Medications', 'None'),
   NULL, 3, '3', 'West Lafayette'),

  -- Expired dues, expired first aid, car without hitch, expired license.
  (2, 'Bob Brown', 'he/him', 'bob@purdue.edu', '765-555-0002',
   json_build_object('Type', 'Semester', 'Expires', (CURRENT_DATE - 30)::text, 'Paid', true),
   json_build_object('Type', 'CPR', 'Expires', (CURRENT_DATE - 1)::text, 'Verified', true),
   json_build_object('Model', 'Honda Civic', 'Nickname', 'Zippy', 'Color', 'Red', 'Capacity', '4', 'Hitch', false),
   json_build_object('License', 'Y456', 'State', 'IN', 'Expires', (CURRENT_DATE - 10)::text, 'Verified', true),
   NULL, true, true, 'Junior', NULL, NULL, 5, '2', 'West Lafayette'),

  -- Never paid dues, agreements never answered.
  (3, 'Carol Clark', 'they/them', 'carol@purdue.edu', NULL,
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Sophomore', NULL, NULL, 1, '1', 'West Lafayette'),

  -- Paid and signed but has a hold.
  (4, 'Dave Davis', 'he/him', 'dave@purdue.edu', '765-555-0004',
   json_build_object('Type', 'Annual', 'Expires', (CURRENT_DATE + 90)::text, 'Paid', true),
   NULL, NULL, NULL, NULL, true, true, 'Senior', NULL, 'Unreturned gear', 0, '4', 'West Lafayette'),

  (5, 'Erin Evans', 'she/her', 'erin@purdue.edu', '765-555-0005',
   json_build_object('Type', 'Annual', 'Expires', (CURRENT_DATE + 180)::text, 'Paid', true),
   NULL, NULL, NULL, NULL, true, true, 'Freshman', NULL, NULL, 2, '1', 'Indianapolis'),

  (6, 'Frank Fisher', 'he/him', 'frank@purdue.edu', '765-555-0006',
   json_build_object('Type', 'Annual', 'Expires', (CURRENT_DATE + 180)::text, 'Paid', true),
   NULL, NULL, NULL, NULL, true, true, 'Graduate', NULL, NULL, 0, '2', 'West Lafayette'),

  -- The club's service account. Excluded from the member directory.
  (7, 'Purdue Outing Club', NULL, 'poc@purdue.edu', NULL,
   json_build_object('Type', 'Annual', 'Expires', (CURRENT_DATE + 180)::text, 'Paid', true),
   NULL, NULL, NULL, NULL, true, true, NULL, NULL, NULL, 0, NULL, 'West Lafayette');

SELECT setval('member_id_seq', (SELECT max(member_id) FROM member));

INSERT INTO officer (member_id, position, year, officer_data) VALUES
  (1, 'Webmaster', 2026, '{"ImagePath": "placeholder.png"}'),
  (2, 'Club Goober', 2026, '{"ImagePath": "placeholder.png"}'),
  (4, 'President', 2026, '{"ImagePath": "placeholder.png"}'),
  (5, 'Gear Lord', 2026,
   '{"ImagePath": "placeholder.png", "GearHours": [{"day": "Monday", "time": "5-7pm"}]}'),
  (6, 'Secretary of Outreach', 2026, '{"ImagePath": "placeholder.png"}'),
  (6, 'Fundraising & Sponsorship', 2026, '{"ImagePath": "placeholder.png"}'),
  (6, 'Diversity & Community Outreach', 2026, '{"ImagePath": "placeholder.png"}');

INSERT INTO trip_leader (member_id, sport, process, lead_count, gmail) VALUES
  (1, 'Backpacking, Caving', '{"shadow": true, "approved": true, "certified": true}', 0, 'alice@gmail.com'),
  (3, 'Climbing', '{"shadow": true, "approved": false, "certified": false}', 0, 'carol@gmail.com');

INSERT INTO trip (trip_id, name, startdate, enddate, category, sport, location, description, signup, difficulty)
VALUES
  (1, 'Red River Gorge Climbing', CURRENT_DATE + 14, CURRENT_DATE + 16, 'Weekend', 'Climbing',
   'Red River Gorge, KY', 'Sport climbing weekend.', true, 2),
  (2, 'Smokies Backpacking', CURRENT_DATE - 60, CURRENT_DATE - 55, 'Break', 'Backpacking',
   'Great Smoky Mountains, TN', 'Five days on the AT.', false, 3),
  (3, 'Mammoth Cave', CURRENT_DATE - 30, CURRENT_DATE - 29, 'Weekend', 'Caving',
   'Mammoth Cave, KY', 'Wild cave tour.', false, 1),
  (4, 'Weekly Meeting', CURRENT_DATE - 7, CURRENT_DATE - 7, 'Weekly', 'Meeting',
   'WALC', NULL, false, NULL);

SELECT setval('trip_trip_id_seq', (SELECT max(trip_id) FROM trip));

-- Resulting trip_count: Bob 4, Alice 3, Erin 2, Carol 1. lead_count: Alice 2, Carol 1.
INSERT INTO trip_roster (trip_id, member_id, is_leader) VALUES
  (1, 2, false), (1, 5, false),
  (2, 1, true), (2, 2, false), (2, 5, false),
  (3, 1, true), (3, 3, true), (3, 2, false),
  (4, 1, false), (4, 2, false);
