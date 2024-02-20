create type Results as (
  inputCode text,
  outputCode text,
  originalReportURL text
);

create table
  GitTranslateUsers (
    id bigint primary key generated always as identity,
    git_id int,
    username text,
    name text,
    avatar_url text,
    web_url text,
    email text,
    ResultList Results[]
  );