BEGIN;


CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    username "char"[],
    email "char"[],
    password_hash "char"[] NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.posts
(
    id serial NOT NULL,
    title "char"[] NOT NULL,
    content text NOT NULL,
    summary text,
    image_url "char"[],
    read_time integer,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.stats
(
    id serial NOT NULL,
    post_id integer NOT NULL,
    views integer,
    likes integer,
    shares integer,
    last_viewed integer,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.stats
    ADD CONSTRAINT stats_postid_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE NO ACTION
    NOT VALID;

END;
