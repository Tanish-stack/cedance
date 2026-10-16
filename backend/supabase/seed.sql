-- ============================================================================
-- AI Group Project Coordinator — Phase 1 Seed Data
-- Run AFTER migration.sql in the Supabase SQL Editor
-- ============================================================================
-- 1 project, 4 users (1 manager + 3 members), 6 tasks, 2 dependencies

-- ============================================================================
-- Users
-- ============================================================================
INSERT INTO users (id, name, role, invite_token)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Adii',   'manager', 'manager'),
    ('00000000-0000-0000-0000-000000000002', 'Kabir',  'member',  'kabir'),
    ('00000000-0000-0000-0000-000000000003', 'Aisha',  'member',  'aisha'),
    ('00000000-0000-0000-0000-000000000004', 'Ravi',   'member',  'ravi');

-- ============================================================================
-- Project
-- ============================================================================
INSERT INTO projects (id, name, deadline, manager_id)
VALUES
    ('00000000-0000-0000-0001-000000000001', 'Cadence', '2026-10-25',
     '00000000-0000-0000-0000-000000000001');

-- ============================================================================
-- Tasks  (6 tasks across 3 members)
-- ============================================================================
INSERT INTO tasks
    (id, project_id, title, description, owner_id, status,
     progress_pct, deadline, acceptance_criteria, evidence_required,
     next_followup_at)
VALUES
    -- Kabir's tasks
    ('00000000-0000-0000-0002-000000000001',
     '00000000-0000-0000-0001-000000000001',
     'Connect the payment API',
     'Integrate the Stripe test-mode API into the backend and expose a /pay endpoint.',
     '00000000-0000-0000-0000-000000000002',
     'Assigned', 0, '2026-10-22',
     'A payment request succeeds in test mode and the PR link is shared.',
     'link',
     now() + interval '1 day'),

    ('00000000-0000-0000-0002-000000000002',
     '00000000-0000-0000-0001-000000000001',
     'Write payment unit tests',
     'Add unit tests for the payment module with at least 80% coverage.',
     '00000000-0000-0000-0000-000000000002',
     'Assigned', 0, '2026-10-23',
     'Tests pass in CI with >= 80% coverage report attached.',
     'link',
     now() + interval '2 days'),

    -- Aisha's tasks
    ('00000000-0000-0000-0002-000000000003',
     '00000000-0000-0000-0001-000000000001',
     'Design the checkout page',
     'Create the checkout page UI with cart summary, payment form and order confirmation.',
     '00000000-0000-0000-0000-000000000003',
     'Assigned', 0, '2026-10-21',
     'Figma link shared and approved by the team lead.',
     'link',
     now() + interval '1 day'),

    ('00000000-0000-0000-0002-000000000004',
     '00000000-0000-0000-0001-000000000001',
     'Build the checkout frontend',
     'Implement the checkout page in Next.js based on the approved Figma design.',
     '00000000-0000-0000-0000-000000000003',
     'Assigned', 0, '2026-10-24',
     'Checkout page is live on the staging URL and matches the approved design.',
     'link',
     now() + interval '3 days'),

    -- Ravi's tasks
    ('00000000-0000-0000-0002-000000000005',
     '00000000-0000-0000-0001-000000000001',
     'Set up CI/CD pipeline',
     'Configure GitHub Actions for lint, test, build, and deploy to staging.',
     '00000000-0000-0000-0000-000000000004',
     'Assigned', 0, '2026-10-20',
     'A push to main triggers lint, test, build and deploys to the staging URL.',
     'link',
     now() + interval '1 day'),

    ('00000000-0000-0000-0002-000000000006',
     '00000000-0000-0000-0001-000000000001',
     'Write project README',
     'Document setup steps, architecture diagram, tech stack, and demo instructions.',
     '00000000-0000-0000-0000-000000000004',
     'Assigned', 0, '2026-10-25',
     'README exists with setup steps, architecture diagram, and demo instructions.',
     'text',
     now() + interval '4 days');

-- ============================================================================
-- Task Dependencies (2 dependencies)
-- ============================================================================
-- "Write payment unit tests" depends on "Connect the payment API"
INSERT INTO task_dependencies (task_id, depends_on_task_id)
VALUES
    ('00000000-0000-0000-0002-000000000002',
     '00000000-0000-0000-0002-000000000001');

-- "Build the checkout frontend" depends on "Design the checkout page"
INSERT INTO task_dependencies (task_id, depends_on_task_id)
VALUES
    ('00000000-0000-0000-0002-000000000004',
     '00000000-0000-0000-0002-000000000003');
