--
-- PostgreSQL database dump
--

\restrict 6JMSHla1YoW7MT2aRN8MuwFK3qJLJEhGuWnWaTYH466oee25nKOekSevWGclvb7

-- Dumped from database version 18.6
-- Dumped by pg_dump version 18.6

-- Started on 2026-10-23 22:39:07

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
    CONSTRAINT availability_slots_status_check CHECK (((status)::text = ANY ((ARRAY['available'::character varying, 'booked'::character varying, 'blocked'::character varying])::text[]))),
    CONSTRAINT chk_availability_time CHECK ((end_time > start_time))
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
-- TOC entry 232 (class 1259 OID 16534)
-- Name: candidate_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_availability (
    id bigint NOT NULL,
    candidate_id bigint NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    CONSTRAINT candidate_availability_check CHECK ((end_time > start_time))
);


ALTER TABLE public.candidate_availability OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16533)
-- Name: candidate_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.candidate_availability ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.candidate_availability_id_seq
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
-- TOC entry 239 (class 1259 OID 16612)
-- Name: candidate_round_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_round_progress (
    candidate_id bigint NOT NULL,
    round_id character varying(50) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT candidate_round_progress_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'passed'::character varying, 'failed'::character varying])::text[])))
);


ALTER TABLE public.candidate_round_progress OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16499)
-- Name: candidate_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.candidate_skills (
    candidate_id bigint NOT NULL,
    skill_id bigint NOT NULL
);


ALTER TABLE public.candidate_skills OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 16577)
-- Name: interview_rounds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interview_rounds (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    duration_minutes integer NOT NULL,
    required_room_capacity integer DEFAULT 1 NOT NULL,
    sort_order integer NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT interview_rounds_duration_minutes_check CHECK ((duration_minutes > 0)),
    CONSTRAINT interview_rounds_required_room_capacity_check CHECK ((required_room_capacity > 0)),
    CONSTRAINT interview_rounds_sort_order_check CHECK ((sort_order > 0))
);


ALTER TABLE public.interview_rounds OWNER TO postgres;

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
-- TOC entry 230 (class 1259 OID 16516)
-- Name: interviewer_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.interviewer_skills (
    interviewer_id bigint NOT NULL,
    skill_id bigint NOT NULL
);


ALTER TABLE public.interviewer_skills OWNER TO postgres;

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
-- TOC entry 236 (class 1259 OID 16562)
-- Name: room_availability; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.room_availability (
    id bigint NOT NULL,
    room_id bigint NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    CONSTRAINT room_availability_check CHECK ((end_time > start_time))
);


ALTER TABLE public.room_availability OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 16561)
-- Name: room_availability_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.room_availability ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.room_availability_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 234 (class 1259 OID 16550)
-- Name: rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rooms (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    CONSTRAINT rooms_capacity_check CHECK ((capacity > 0))
);


ALTER TABLE public.rooms OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 16549)
-- Name: rooms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.rooms ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.rooms_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 238 (class 1259 OID 16595)
-- Name: round_required_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.round_required_skills (
    round_id character varying(50) NOT NULL,
    skill_id bigint NOT NULL
);


ALTER TABLE public.round_required_skills OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16490)
-- Name: skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skills (
    id bigint NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.skills OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16489)
-- Name: skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.skills ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.skills_id_seq
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
-- TOC entry 5151 (class 0 OID 16433)
-- Dependencies: 224
-- Data for Name: availability_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.availability_slots (id, interviewer_id, start_time, end_time, status) FROM stdin;
1	2	2026-10-23 01:52:45.137306+05:30	2026-10-23 02:22:45.137306+05:30	available
\.


--
-- TOC entry 5159 (class 0 OID 16534)
-- Dependencies: 232
-- Data for Name: candidate_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_availability (id, candidate_id, start_time, end_time) FROM stdin;
\.


--
-- TOC entry 5148 (class 0 OID 16406)
-- Dependencies: 221
-- Data for Name: candidate_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_profiles (user_id, application_number, resume_url) FROM stdin;
1	APP-001	\N
\.


--
-- TOC entry 5166 (class 0 OID 16612)
-- Dependencies: 239
-- Data for Name: candidate_round_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_round_progress (candidate_id, round_id, status, updated_at) FROM stdin;
\.


--
-- TOC entry 5156 (class 0 OID 16499)
-- Dependencies: 229
-- Data for Name: candidate_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.candidate_skills (candidate_id, skill_id) FROM stdin;
\.


--
-- TOC entry 5164 (class 0 OID 16577)
-- Dependencies: 237
-- Data for Name: interview_rounds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interview_rounds (id, name, duration_minutes, required_room_capacity, sort_order, is_active) FROM stdin;
CODING	Coding Round	60	2	1	t
TECHNICAL	Technical Round	60	2	2	t
HR	HR Round	30	2	3	t
\.


--
-- TOC entry 5149 (class 0 OID 16421)
-- Dependencies: 222
-- Data for Name: interviewer_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviewer_profiles (user_id, department) FROM stdin;
2	Computer Science
\.


--
-- TOC entry 5157 (class 0 OID 16516)
-- Dependencies: 230
-- Data for Name: interviewer_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviewer_skills (interviewer_id, skill_id) FROM stdin;
\.


--
-- TOC entry 5153 (class 0 OID 16454)
-- Dependencies: 226
-- Data for Name: interviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.interviews (id, candidate_id, interviewer_id, slot_id, status, meeting_link, notes, created_at) FROM stdin;
1	1	2	1	scheduled	\N	\N	2026-10-22 01:52:45.137306+05:30
\.


--
-- TOC entry 5163 (class 0 OID 16562)
-- Dependencies: 236
-- Data for Name: room_availability; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.room_availability (id, room_id, start_time, end_time) FROM stdin;
\.


--
-- TOC entry 5161 (class 0 OID 16550)
-- Dependencies: 234
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rooms (id, name, capacity) FROM stdin;
\.


--
-- TOC entry 5165 (class 0 OID 16595)
-- Dependencies: 238
-- Data for Name: round_required_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.round_required_skills (round_id, skill_id) FROM stdin;
TECHNICAL	1
CODING	1
CODING	2
TECHNICAL	3
HR	4
HR	5
\.


--
-- TOC entry 5155 (class 0 OID 16490)
-- Dependencies: 228
-- Data for Name: skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skills (id, name) FROM stdin;
1	JavaScript
2	Algorithms
3	System Design
4	Communication
5	HR
\.


--
-- TOC entry 5147 (class 0 OID 16390)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, full_name, email, password_hash, role, created_at) FROM stdin;
1	Test Candidate	candidate@test.com	test_hash	candidate	2026-10-22 01:52:45.137306+05:30
2	Test Interviewer	interviewer@test.com	test_hash	interviewer	2026-10-22 01:52:45.137306+05:30
\.


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 223
-- Name: availability_slots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.availability_slots_id_seq', 1, true);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 231
-- Name: candidate_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.candidate_availability_id_seq', 1, false);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 225
-- Name: interviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.interviews_id_seq', 1, true);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 235
-- Name: room_availability_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.room_availability_id_seq', 1, false);


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 233
-- Name: rooms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.rooms_id_seq', 1, false);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 227
-- Name: skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.skills_id_seq', 5, true);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- TOC entry 4945 (class 2606 OID 16447)
-- Name: availability_slots availability_slots_interviewer_id_start_time_end_time_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_interviewer_id_start_time_end_time_key UNIQUE (interviewer_id, start_time, end_time);


--
-- TOC entry 4947 (class 2606 OID 16445)
-- Name: availability_slots availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_pkey PRIMARY KEY (id);


--
-- TOC entry 4966 (class 2606 OID 16543)
-- Name: candidate_availability candidate_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_availability
    ADD CONSTRAINT candidate_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 16415)
-- Name: candidate_profiles candidate_profiles_application_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_application_number_key UNIQUE (application_number);


--
-- TOC entry 4941 (class 2606 OID 16413)
-- Name: candidate_profiles candidate_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4982 (class 2606 OID 16623)
-- Name: candidate_round_progress candidate_round_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_round_progress
    ADD CONSTRAINT candidate_round_progress_pkey PRIMARY KEY (candidate_id, round_id);


--
-- TOC entry 4962 (class 2606 OID 16505)
-- Name: candidate_skills candidate_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_pkey PRIMARY KEY (candidate_id, skill_id);


--
-- TOC entry 4976 (class 2606 OID 16592)
-- Name: interview_rounds interview_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_rounds
    ADD CONSTRAINT interview_rounds_pkey PRIMARY KEY (id);


--
-- TOC entry 4978 (class 2606 OID 16594)
-- Name: interview_rounds interview_rounds_sort_order_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interview_rounds
    ADD CONSTRAINT interview_rounds_sort_order_key UNIQUE (sort_order);


--
-- TOC entry 4943 (class 2606 OID 16426)
-- Name: interviewer_profiles interviewer_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_profiles
    ADD CONSTRAINT interviewer_profiles_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4964 (class 2606 OID 16522)
-- Name: interviewer_skills interviewer_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_skills
    ADD CONSTRAINT interviewer_skills_pkey PRIMARY KEY (interviewer_id, skill_id);


--
-- TOC entry 4955 (class 2606 OID 16468)
-- Name: interviews interviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_pkey PRIMARY KEY (id);


--
-- TOC entry 4974 (class 2606 OID 16571)
-- Name: room_availability room_availability_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_availability
    ADD CONSTRAINT room_availability_pkey PRIMARY KEY (id);


--
-- TOC entry 4969 (class 2606 OID 16560)
-- Name: rooms rooms_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_name_key UNIQUE (name);


--
-- TOC entry 4971 (class 2606 OID 16558)
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- TOC entry 4980 (class 2606 OID 16601)
-- Name: round_required_skills round_required_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_required_skills
    ADD CONSTRAINT round_required_skills_pkey PRIMARY KEY (round_id, skill_id);


--
-- TOC entry 4958 (class 2606 OID 16498)
-- Name: skills skills_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_name_key UNIQUE (name);


--
-- TOC entry 4960 (class 2606 OID 16496)
-- Name: skills skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skills
    ADD CONSTRAINT skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4935 (class 2606 OID 16405)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4937 (class 2606 OID 16403)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4967 (class 1259 OID 16637)
-- Name: idx_candidate_availability_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_candidate_availability_time ON public.candidate_availability USING btree (candidate_id, start_time, end_time);


--
-- TOC entry 4949 (class 1259 OID 16486)
-- Name: idx_interviews_candidate; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_candidate ON public.interviews USING btree (candidate_id);


--
-- TOC entry 4950 (class 1259 OID 16635)
-- Name: idx_interviews_candidate_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_candidate_status ON public.interviews USING btree (candidate_id, status);


--
-- TOC entry 4951 (class 1259 OID 16487)
-- Name: idx_interviews_interviewer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_interviewer ON public.interviews USING btree (interviewer_id);


--
-- TOC entry 4952 (class 1259 OID 16636)
-- Name: idx_interviews_interviewer_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_interviewer_status ON public.interviews USING btree (interviewer_id, status);


--
-- TOC entry 4953 (class 1259 OID 16488)
-- Name: idx_interviews_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_interviews_status ON public.interviews USING btree (status);


--
-- TOC entry 4972 (class 1259 OID 16638)
-- Name: idx_room_availability_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_room_availability_time ON public.room_availability USING btree (room_id, start_time, end_time);


--
-- TOC entry 4948 (class 1259 OID 16485)
-- Name: idx_slots_interviewer_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_slots_interviewer_time ON public.availability_slots USING btree (interviewer_id, start_time);


--
-- TOC entry 4956 (class 1259 OID 16484)
-- Name: unique_active_interview_slot; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_active_interview_slot ON public.interviews USING btree (slot_id) WHERE ((status)::text <> 'cancelled'::text);


--
-- TOC entry 4985 (class 2606 OID 16448)
-- Name: availability_slots availability_slots_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.interviewer_profiles(user_id);


--
-- TOC entry 4993 (class 2606 OID 16544)
-- Name: candidate_availability candidate_availability_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_availability
    ADD CONSTRAINT candidate_availability_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 4983 (class 2606 OID 16416)
-- Name: candidate_profiles candidate_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_profiles
    ADD CONSTRAINT candidate_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 16624)
-- Name: candidate_round_progress candidate_round_progress_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_round_progress
    ADD CONSTRAINT candidate_round_progress_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 4998 (class 2606 OID 16629)
-- Name: candidate_round_progress candidate_round_progress_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_round_progress
    ADD CONSTRAINT candidate_round_progress_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.interview_rounds(id);


--
-- TOC entry 4989 (class 2606 OID 16506)
-- Name: candidate_skills candidate_skills_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 16511)
-- Name: candidate_skills candidate_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.candidate_skills
    ADD CONSTRAINT candidate_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 4984 (class 2606 OID 16427)
-- Name: interviewer_profiles interviewer_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_profiles
    ADD CONSTRAINT interviewer_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 4991 (class 2606 OID 16523)
-- Name: interviewer_skills interviewer_skills_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_skills
    ADD CONSTRAINT interviewer_skills_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.interviewer_profiles(user_id) ON DELETE CASCADE;


--
-- TOC entry 4992 (class 2606 OID 16528)
-- Name: interviewer_skills interviewer_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviewer_skills
    ADD CONSTRAINT interviewer_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


--
-- TOC entry 4986 (class 2606 OID 16469)
-- Name: interviews interviews_candidate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_candidate_id_fkey FOREIGN KEY (candidate_id) REFERENCES public.candidate_profiles(user_id);


--
-- TOC entry 4987 (class 2606 OID 16474)
-- Name: interviews interviews_interviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_interviewer_id_fkey FOREIGN KEY (interviewer_id) REFERENCES public.interviewer_profiles(user_id);


--
-- TOC entry 4988 (class 2606 OID 16479)
-- Name: interviews interviews_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.interviews
    ADD CONSTRAINT interviews_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.availability_slots(id);


--
-- TOC entry 4994 (class 2606 OID 16572)
-- Name: room_availability room_availability_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.room_availability
    ADD CONSTRAINT room_availability_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE CASCADE;


--
-- TOC entry 4995 (class 2606 OID 16602)
-- Name: round_required_skills round_required_skills_round_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_required_skills
    ADD CONSTRAINT round_required_skills_round_id_fkey FOREIGN KEY (round_id) REFERENCES public.interview_rounds(id) ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 16607)
-- Name: round_required_skills round_required_skills_skill_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.round_required_skills
    ADD CONSTRAINT round_required_skills_skill_id_fkey FOREIGN KEY (skill_id) REFERENCES public.skills(id) ON DELETE CASCADE;


-- Completed on 2026-10-23 22:39:07

--
-- PostgreSQL database dump complete
--

\unrestrict 6JMSHla1YoW7MT2aRN8MuwFK3qJLJEhGuWnWaTYH466oee25nKOekSevWGclvb7

