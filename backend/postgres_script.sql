BEGIN;


CREATE TABLE IF NOT EXISTS public.users
(
    id serial NOT NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    password_hash VARCHAR(255) NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.posts
(
    id serial NOT NULL,
    title VARCHAR(200) NOT NULL,
    content text NOT NULL,
    summary text,
    image_url VARCHAR(255),
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
    last_viewed timestamp with time zone,
    PRIMARY KEY (id)
);

ALTER TABLE IF EXISTS public.stats
    ADD CONSTRAINT stats_postid_fkey FOREIGN KEY (post_id)
    REFERENCES public.posts (id) ON UPDATE CASCADE ON DELETE CASCADE;
   
END;
