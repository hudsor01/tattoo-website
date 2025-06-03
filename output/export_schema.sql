-- Export basic schema information

-- Tables
\o tables.csv
\qecho "Table Schema,Table Name,Table Type"
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Columns
\o columns.csv
\qecho "Table Schema,Table Name,Column Name,Data Type,Is Nullable"
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name, ordinal_position;

-- Extensions
\o extensions.csv
\qecho "Extension Name,Extension Version"
SELECT 
    extname,
    extversion
FROM pg_extension
ORDER BY extname;

-- Functions
\o functions.csv
\qecho "Schema,Function Name,Function Type"
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
ORDER BY n.nspname, p.proname;

-- Triggers
\o triggers.csv
\qecho "Schema,Table,Trigger Name"
SELECT
    event_object_schema,
    event_object_table,
    trigger_name
FROM information_schema.triggers
ORDER BY event_object_schema, event_object_table, trigger_name;

-- RLS Policies
\o policies.csv
\qecho "Schema,Table,Policy Name"
SELECT
    n.nspname AS schema_name,
    c.relname AS table_name,
    pol.polname AS policy_name
FROM pg_policy pol
JOIN pg_class c ON c.oid = pol.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname, pol.polname;
