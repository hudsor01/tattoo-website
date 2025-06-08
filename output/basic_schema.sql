-- Basic schema analysis queries
\pset tuples_only off
\pset format aligned

\echo '\n--- DATABASE INFO ---\n'
SELECT current_database() AS database, version() AS version;

\echo '\n--- SCHEMAS ---\n'
SELECT schema_name, schema_owner
FROM information_schema.schemata
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

\echo '\n--- EXTENSIONS ---\n'
SELECT extname AS extension, extversion AS version
FROM pg_extension
ORDER BY extname;

\echo '\n--- TABLES ---\n'
SELECT
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

\echo '\n--- COLUMNS SAMPLE (first 20) ---\n'
SELECT
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position
LIMIT 20;

\echo '\n--- TABLE NAMING ANALYSIS ---\n'
SELECT 
    c.relname AS table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = c.relname AND column_name = 'createdAt') THEN 'camelCase'
        WHEN EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = c.relname AND column_name = 'createdAt') THEN 'snake_case'
        ELSE 'unknown'
    END AS timestamp_naming_convention
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
AND n.nspname NOT IN ('pg_catalog', 'information_schema')
LIMIT 10;

\echo '\n--- VIEWS ---\n'
SELECT schemaname, viewname
FROM pg_views
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');

\echo '\n--- FUNCTIONS SAMPLE (first 10) ---\n'
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    CASE p.prokind
        WHEN 'f' THEN 'FUNCTION'
        WHEN 'p' THEN 'PROCEDURE'
        WHEN 'a' THEN 'AGGREGATE'
        WHEN 'w' THEN 'WINDOW'
    END AS type
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, p.proname
LIMIT 10;

\echo '\n--- TRIGGERS SAMPLE (first 10) ---\n'
SELECT
    event_object_schema AS table_schema,
    event_object_table AS table_name,
    trigger_name
FROM information_schema.triggers
LIMIT 10;

\echo '\n--- RLS POLICIES ---\n'
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    pol.polname AS policy_name
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, pol.polname;

\echo '\n--- AUTH TABLES ---\n'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'auth' AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo '\n--- STORAGE TABLES ---\n'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'storage' AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo '\n--- ENUM TYPES ---\n'
SELECT
    n.nspname AS schema_name,
    t.typname AS enum_name
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE t.typtype = 'e'
AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, t.typname;

\echo '\n--- TIMESTAMP COLUMN NAMING CONVENTIONS ---\n'
SELECT
    table_schema,
    table_name,
    string_agg(column_name, ', ') FILTER (WHERE column_name IN ('createdAt', 'createdAt')) AS created_timestamp,
    string_agg(column_name, ', ') FILTER (WHERE column_name IN ('updatedAt', 'updatedAt')) AS updated_timestamp
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
AND (column_name LIKE '%created%' OR column_name LIKE '%updated%')
GROUP BY table_schema, table_name
ORDER BY table_schema, table_name
LIMIT 10;
