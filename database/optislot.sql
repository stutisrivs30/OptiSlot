--
-- PostgreSQL database dump
--

\restrict 9zPl8gn5u7A4gV1yndEzfML7pnTxbhz0X4QesmD94rKEhlfYmbEYssqei3sCMxu

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-23 21:33:48

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 16433)
-- Name: availability_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.availability_slots (
    id bigint NOT NULL,
    interviewer_id bigint NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status character varying(20) DEFAULT 'available'::character varying NOT NULL,
    CONSTRAINT availability_slots_check CHECK ((end_time > start_time)),
    CONSTRAINT availability_slots_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'booked'::character varying, 'blocked'::character varying])::text[])))
);


ALTER TABLE public.availability_slots OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16432)
-- Name: availability_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.availability_slots ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.availability_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 221 (class 1259 OID 16406)
-- Name: candidate_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_profiles (
    user_id bigint NOT NULL,
    application_number character varying(50),
    resume_url text
);


ALTER TABLE public.candidate_profiles OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16421)
-- Name: interviewer_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviewer_profiles (
    user_id bigint NOT NULL,
    department character varying(100)
);


ALTER TABLE public.interviewer_profiles OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16454)
-- Name: interviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviews (
    id bigint NOT NULL,
    candidate_id bigint NOT NULL,
    interviewer_id bigint NOT NULL,
    slot_id bigint NOT NULL,
    status character varying(20) DEFAULT 'scheduled'::character varying NOT NULL,
    meeting_link text,
    notes text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT interviews_status_check CHECK (((status)::text = ANY ((ARRAY['scheduled'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'no_show'::character varying])::text[])))
);


ALTER TABLE public.interviews OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 16453)
-- Name: interviews_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.interviews ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.interviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16390)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    full_name character varying(100) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'interviewer'::character varying, 'candidate'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16389)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5061 (class 0 OID 16433)
-- Dependencies: 224
-- Data for Name: availability_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.availability_slots (id, interviewer_id, start_time, end_time, status) FROM stdin;
1	2	2026-10-23 01:52:45.137306+05:30	2026-10-23 02:22:45.137306+05:30	available
\.


--
-- TOC entry 5058 (class 0 OID 16406)
-- Dependencies: 221
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_profiles (user_id, application_number, resume_url) FROM stdin;
1	APP-001	\N
\.


--
-- TOC entry 5059 (class 0 OID 16421)
-- Dependencies: 222
-- Data for Name: interviewer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviewer_profiles (user_id, department) FROM stdin;
2	Computer Science
\.


--
-- TOC entry 5063 (class 0 OID 16454)
-- Dependencies: 226
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, candidate_id, interviewer_id, slot_id, status, meeting_link, notes, created_at) FROM stdin;
1	1	2	1	scheduled	\N	\N	2026-10-22 01:52:45.137306+05:30
\.


--
-- TOC entry 5057 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password_hash, role, created_at) FROM stdin;
1	Test Candidate	candidate@test.com	test_hash	candidate	2026-10-22 01:52:45.137306+05:30
2	Test Interviewer	interviewer@test.com	test_hash	interviewer	2026-10-22 01:52:45.137306+05:30
\.


--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 223
-- Name: availability_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.availability_slots_id_seq', 1, true);


--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 225
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, true);


--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4893 (class 2606 OID 16447)
-- Name: availability_slots availability_slots_interviewer_id_start_time_end_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_interviewer_id_start_time_end_time_key UNIQUE (interviewer_id, start_time, end_time);


--
-- TOC entry 4895 (class 2606 OID 16445)
-- Name: availability_slots availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 4887 (class 2606 OID 16415)
-- Name: candidate_profiles candidate_profiles_application_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_application_number_key UNIQUE (application_number);


--
-- TOC entry 4889 (class 2606 OID 16413)
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4891 (class 2606 OID 16426)
-- Name: interviewer_profiles interviewer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_profiles
    ADD CONSTRAINT interviewer_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4901 (class 2606 OID 16468)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4883 (class 2606 OID 16405)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4885 (class 2606 OID 16403)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4897 (class 1259 OID 16486)
-- Name: idx_interviews_candidate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_candidate ON public.interviews USING btree (candidate_id);


--
-- TOC entry 4898 (class 1259 OID 16487)
-- Name: idx_interviews_interviewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_interviewer ON public.interviews USING btree (interviewer_id);


--
-- TOC entry 4899 (class 1259 OID 16488)
-- Name: idx_interviews_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_status ON public.interviews USING btree (status);


--
-- TOC entry 4896 (class 1259 OID 16485)
-- Name: idx_slots_interviewer_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_slots_interviewer_time ON public.availability_slots USING btree (interviewer_id, start_time);


--
-- TOC entry 4902 (class 1259 OID 16484)
-- Name: unique_active_interview_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_interview_slot ON public.interviews USING btree (slot_id) WHERE ((status)::text <> 'cancelled'::text);


--
-- TOC entry 4905 (class 2606 OID 16448)
-- Name: availability_slots availability_slots_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.interviewer_profiles(user_id);


--
-- TOC entry 4903 (class 2606 OID 16416)
-- Name: candidate_profiles candidate_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4904 (class 2606 OID 16427)
-- Name: interviewer_profiles interviewer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_profiles
    ADD CONSTRAINT interviewer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4906 (class 2606 OID 16469)
-- Name: interviews interviews_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(user_id);


--
-- TOC entry 4907 (class 2606 OID 16474)
-- Name: interviews interviews_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.interviewer_profiles(user_id);


--
-- TOC entry 4908 (class 2606 OID 16479)
-- Name: interviews interviews_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.availability_slots(id);


-- Completed on 2026-10-23 21:33:48

--
-- PostgreSQL database dump complete
--

\unrestrict 9zPl8gn5u7A4gV1yndEzfML7pnTxbhz0X4QesmD94rKEhlfYmbEYssqei3sCMxu

