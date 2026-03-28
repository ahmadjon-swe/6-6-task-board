DROP DATABASE IF EXISTS task_board;
CREATE DATABASE task_board;

\c task_board

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE task_status_types AS ENUM(
  'Pending', 'In Progress', 'Partial', 'Completed'
);

CREATE TYPE user_roles AS ENUM(
  'user', 'admin'
);

-- USERS
CREATE TABLE users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_username VARCHAR(50) NOT NULL UNIQUE,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  user_role user_roles DEFAULT 'user',  -- vergul qo'shildi
  user_created_at TIMESTAMP DEFAULT now(),
  user_updated_at TIMESTAMP DEFAULT now()
);

-- BOARDS (Trellodagi asosiy board)
CREATE TABLE boards(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_title VARCHAR(50) NOT NULL,
  board_desc VARCHAR(255),
  board_created_by UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  board_created_at TIMESTAMP DEFAULT now(),
  board_updated_at TIMESTAMP DEFAULT now()
);

-- BOARD MEMBERS (foydalanuvchi qaysi boardga a'zo)
CREATE TABLE board_members(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bm_board_id UUID REFERENCES boards(id) ON DELETE CASCADE ON UPDATE CASCADE,
  bm_user_id UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  bm_joined_at TIMESTAMP DEFAULT now(),
  UNIQUE(bm_board_id, bm_user_id)  -- bir boardga ikki marta a'zo bo'lmasin
);

-- TASKS (Trellodagi card, task_status = kolonka)
CREATE TABLE tasks(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_board_id UUID REFERENCES boards(id) ON DELETE CASCADE ON UPDATE CASCADE,
  task_created_by UUID REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  task_assigned_to UUID REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,  -- kimga topshirilgan
  task_title VARCHAR(50) NOT NULL,
  task_desc VARCHAR(255),
  task_status task_status_types DEFAULT 'Pending',
  task_due_date TIMESTAMP,           -- muddati
  task_completed_at TIMESTAMP,
  task_created_at TIMESTAMP DEFAULT now(),
  task_updated_at TIMESTAMP DEFAULT now()
);

-- =========================================
-- TRIGGERS
-- =========================================

-- task_status = Completed bo'lsa completed_at qo'yadi
CREATE OR REPLACE FUNCTION fn_set_completed_at()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- tasks updated_at
CREATE OR REPLACE FUNCTION fn_set_task_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
  NEW.task_updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_task_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION fn_set_task_updated_at();

-- users updated_at
CREATE OR REPLACE FUNCTION fn_set_user_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
  NEW.user_updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_user_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION fn_set_user_updated_at();

-- boards updated_at
CREATE OR REPLACE FUNCTION fn_set_board_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS
$$
BEGIN
  NEW.board_updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_set_board_updated_at
BEFORE UPDATE ON boards
FOR EACH ROW
EXECUTE FUNCTION fn_set_board_updated_at();