-- +goose Up
-- +goose StatementBegin

CREATE DATABASE chapiteau;

CREATE TABLE users (
    id uuid NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id)
);

CREATE TABLE api_keys (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    name varchar(100) NOT NULL,
    expire_at bigint NOT NULL,
    CONSTRAINT pk_api_keys PRIMARY KEY (id)
);

CREATE TABLE projects (
    id uuid NOT NULL,
    name varchar(100) NOT NULL,
    CONSTRAINT pk_projects PRIMARY KEY (id)
);

CREATE TABLE user_projects (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    project_id uuid NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    CONSTRAINT pk_user_projects PRIMARY KEY (id)
);

CREATE TABLE runs (
    id uuid NOT NULL,
    project_id uuid NOT NULL,
    workers bigint DEFAULT 0,
    started_at timestamp NOT NULL,
    finished_at timestamp NOT NULL,
    duration bigint DEFAULT 0 NOT NULL,
    created_at timestamp NOT NULL,
    created_by varchar(100),
    report_url varchar(100),
    build_name varchar(100),
    build_url varchar(100),
    total bigint DEFAULT 0 NOT NULL,
    expected bigint DEFAULT 0 NOT NULL,
    unexpected bigint DEFAULT 0 NOT NULL,
    flaky bigint DEFAULT 0 NOT NULL,
    skipped bigint DEFAULT 0 NOT NULL,
    ok boolean DEFAULT false NOT NULL,
    CONSTRAINT pk_runs PRIMARY KEY (id)
);

CREATE TABLE files (
    id uuid NOT NULL,
    run_id uuid NOT NULL,
    project_id uuid NOT NULL,
    name varchar(100),
    file_id varchar(100),
    total bigint DEFAULT 0 NOT NULL,
    expected bigint DEFAULT 0 NOT NULL,
    unexpected bigint DEFAULT 0 NOT NULL,
    flaky bigint DEFAULT 0 NOT NULL,
    skipped bigint DEFAULT 0 NOT NULL,
    ok boolean DEFAULT false NOT NULL,
    CONSTRAINT pk_files PRIMARY KEY (id)
);

CREATE TABLE tests (
    id uuid NOT NULL,
    file_id uuid NOT NULL,
    run_id uuid NOT NULL,
    project_id uuid NOT NULL,
    location varchar(100),
    test_id varchar(100),
    title varchar(100),
    pw_project_name varchar(100),
    duration bigint DEFAULT 0 NOT NULL,
    outcome varchar(100) NOT NULL,
    path varchar(100) NOT NULL,
    CONSTRAINT pk_tests PRIMARY KEY (id)
);

CREATE TABLE test_attachments (
    id uuid NOT NULL,
    run_id uuid NOT NULL,
    test_id uuid NOT NULL,
    attempt bigint DEFAULT 0 NOT NULL,
    name varchar(100),
    content_type varchar(100),
    path varchar(100),
    CONSTRAINT pk_test_attachments PRIMARY KEY (id)
);

ALTER TABLE api_keys ADD CONSTRAINT fk_apiKey_user FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE user_projects ADD CONSTRAINT fk_userProject_user FOREIGN KEY (user_id) REFERENCES users (id);
ALTER TABLE user_projects ADD CONSTRAINT fk_userProject_project FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE runs ADD CONSTRAINT fk_run_project FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE files ADD CONSTRAINT fk_files_project FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE files ADD CONSTRAINT fk_files_run FOREIGN KEY (run_id) REFERENCES runs (id);
ALTER TABLE tests ADD CONSTRAINT fk_test_project FOREIGN KEY (project_id) REFERENCES projects (id);
ALTER TABLE tests ADD CONSTRAINT fk_test_run FOREIGN KEY (run_id) REFERENCES runs (id);
ALTER TABLE tests ADD CONSTRAINT fk_test_file FOREIGN KEY (file_id) REFERENCES files (id);
ALTER TABLE test_attachments ADD CONSTRAINT fk_testAttachment_run FOREIGN KEY (run_id) REFERENCES runs (id);
ALTER TABLE test_attachments ADD CONSTRAINT fk_testAttachment_test FOREIGN KEY (test_id) REFERENCES tests (id);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS test_attachments;
DROP TABLE IF EXISTS tests;
DROP TABLE IF EXISTS files;
DROP TABLE IF EXISTS runs;
DROP TABLE IF EXISTS user_projects;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS api_keys;
DROP TABLE IF EXISTS users;

DROP DATABASE IF EXISTS chapiteau;
-- +goose StatementEnd
