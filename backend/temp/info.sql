DROP DATABASE IF EXISTS task_board;
CREATE DATABASE task_board;

\C task_board

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE task_status_types AS ENUM(
  'Pending', 'In Progress', 'Partial', 'Completed'
);

CREATE TABLE boards(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_title VARCHAR(50) NOT NULL,
  board_desc VARCHAR(255),
  board_created_at TIMESTAMP DEFAULT now(),
  board_updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE tasks(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_board_id UUID REFERENCES boards(id) ON DELETE CASCADE ON UPDATE CASCADE,
  task_title VARCHAR(50) NOT NULL,
  task_desc VARCHAR(255),
  task_status task_status_types DEFAULT 'Pending',
  task_completed_at TIMESTAMP,
  task_created_at TIMESTAMP DEFAULT now(),
  task_updated_at TIMESTAMP DEFAULT now()
);

-- COMPLETED AT'NI QO'SHADI
CREATE OR REPLACE FUNCTION fn_set_completed_at()
RETURNS TRIGGER
language plpgsql
AS
$$
BEGIN
  IF NEW.task_status = 'Completed' THEN
    NEW.task_completed_at := now();
  ELSE
    NEW.task_completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$;


CREATE TRIGGER tr_set_completed_at
BEFORE UPDATE OF task_status ON tasks
FOR EACH ROW
EXECUTE FUNCTION fn_set_completed_at();

-- UPDATED AT'NI YANGILAB TURADI
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER
language plpgsql
AS
$$
BEGIN
  NEW.task_updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION fn_set_updated_at();