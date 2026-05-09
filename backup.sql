--
-- PostgreSQL database dump
--

\restrict c6cKrYOvPfZYMssZmZIbLudkqkh10lR116MrErV5gTm8diGHPHV9nSPFISZKX8h

-- Dumped from database version 15.1
-- Dumped by pg_dump version 17.7

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: OptimizationResult; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."OptimizationResult" (
    id integer NOT NULL,
    mode character varying(50) NOT NULL,
    "optimalK" integer NOT NULL,
    "efficiencyValue" double precision,
    "totalStaffNeeded" integer NOT NULL,
    "supervisoryStaff" integer,
    "managementLevel1" integer,
    "managementLevel2" integer,
    "topManagementStaff" integer,
    lecturers integer,
    "seniorLecturers" integer,
    professors integer,
    "studentPopulation" integer,
    "D" double precision,
    "G" double precision,
    "Y" double precision,
    alpha double precision,
    t1 double precision,
    t2 double precision,
    t3 double precision,
    t4 double precision,
    "S0" double precision,
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public."OptimizationResult" OWNER TO postgres;

--
-- Name: OptimizationResult_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."OptimizationResult_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."OptimizationResult_id_seq" OWNER TO postgres;

--
-- Name: OptimizationResult_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."OptimizationResult_id_seq" OWNED BY public."OptimizationResult".id;


--
-- Name: StaffEstimation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StaffEstimation" (
    id integer NOT NULL,
    "methodType" character varying(50) NOT NULL,
    "staffNeeded" double precision,
    "createdAt" timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    "basicTime" double precision,
    "relaxAllowance" double precision,
    "loadFactor" double precision,
    "numTasks" integer,
    "timePerTask" double precision,
    "availableHoursPerPerson" double precision,
    "observedTime" double precision,
    "estimatedTime" double precision,
    "correctiveFactor" double precision,
    "personsEstimate" double precision,
    "A" double precision,
    "B" double precision,
    "confidenceLimit" double precision,
    "utilizationFactor" double precision,
    "annualManHours" double precision,
    "standardManHours" double precision
);


ALTER TABLE public."StaffEstimation" OWNER TO postgres;

--
-- Name: StaffEstimation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StaffEstimation_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."StaffEstimation_id_seq" OWNER TO postgres;

--
-- Name: StaffEstimation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."StaffEstimation_id_seq" OWNED BY public."StaffEstimation".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: appraisal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appraisal (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    teaching_quality_evaluation numeric,
    research_quality_evaluation numeric,
    administrative_quality_evaluation numeric,
    community_quality_evaluation numeric,
    other_relevant_information numeric,
    dept character varying(255) DEFAULT 'mechanical engineering'::character varying,
    pending boolean DEFAULT false,
    resolve boolean DEFAULT false
);


ALTER TABLE public.appraisal OWNER TO postgres;

--
-- Name: appraisal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appraisal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appraisal_id_seq OWNER TO postgres;

--
-- Name: appraisal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appraisal_id_seq OWNED BY public.appraisal.id;


--
-- Name: auditor_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditor_responses (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    gsm character varying(50) NOT NULL,
    address text NOT NULL,
    dob date NOT NULL,
    image character varying(255),
    responses jsonb NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditor_responses OWNER TO postgres;

--
-- Name: auditor_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditor_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditor_responses_id_seq OWNER TO postgres;

--
-- Name: auditor_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditor_responses_id_seq OWNED BY public.auditor_responses.id;


--
-- Name: auditor_survey_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditor_survey_responses (
    id integer NOT NULL,
    pesuser_name character varying(255),
    org character varying(255),
    section character varying(100),
    question character varying(255),
    response character varying(255),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditor_survey_responses OWNER TO postgres;

--
-- Name: auditor_survey_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditor_survey_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditor_survey_responses_id_seq OWNER TO postgres;

--
-- Name: auditor_survey_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditor_survey_responses_id_seq OWNED BY public.auditor_survey_responses.id;


--
-- Name: badges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.badges (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100),
    sub_category character varying(100),
    image_url character varying(500),
    description text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.badges OWNER TO postgres;

--
-- Name: badges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.badges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.badges_id_seq OWNER TO postgres;

--
-- Name: badges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.badges_id_seq OWNED BY public.badges.id;


--
-- Name: counter_appraisal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counter_appraisal (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    teaching_quality_evaluation numeric(5,2),
    research_quality_evaluation numeric(5,2),
    administrative_quality_evaluation numeric(5,2),
    community_quality_evaluation numeric(5,2),
    other_relevant_information text,
    dept character varying(255),
    pending boolean DEFAULT false
);


ALTER TABLE public.counter_appraisal OWNER TO postgres;

--
-- Name: counter_appraisal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.counter_appraisal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.counter_appraisal_id_seq OWNER TO postgres;

--
-- Name: counter_appraisal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.counter_appraisal_id_seq OWNED BY public.counter_appraisal.id;


--
-- Name: counter_stress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counter_stress (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    dept character varying(255),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    stress_theme integer,
    stress_feeling_frequency integer
);


ALTER TABLE public.counter_stress OWNER TO postgres;

--
-- Name: counter_stress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.counter_stress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.counter_stress_id_seq OWNER TO postgres;

--
-- Name: counter_stress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.counter_stress_id_seq OWNED BY public.counter_stress.id;


--
-- Name: counter_userperformance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.counter_userperformance (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    dept character varying(255),
    competence numeric(5,2),
    integrity numeric(5,2),
    compatibility numeric(5,2),
    use_of_resources numeric(5,2),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    pending boolean DEFAULT false
);


ALTER TABLE public.counter_userperformance OWNER TO postgres;

--
-- Name: counter_userperformance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.counter_userperformance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.counter_userperformance_id_seq OWNER TO postgres;

--
-- Name: counter_userperformance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.counter_userperformance_id_seq OWNED BY public.counter_userperformance.id;


--
-- Name: facilities; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.facilities (
    id integer NOT NULL,
    identification_symbol character varying(100),
    description_of_facility text NOT NULL,
    location text,
    facility_register_id_no character varying(100),
    type character varying(100),
    priority_rating character varying(50),
    remarks text,
    org character varying(255) DEFAULT 'DevSquad inc'::character varying,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.facilities OWNER TO postgres;

--
-- Name: facilities_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.facilities_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.facilities_id_seq OWNER TO postgres;

--
-- Name: facilities_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.facilities_id_seq OWNED BY public.facilities.id;


--
-- Name: first_book_of_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.first_book_of_record (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    achievement character varying(255) NOT NULL,
    category character varying(100),
    date_achieved date,
    image_url character varying(500),
    description text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    sub_category character varying(100)
);


ALTER TABLE public.first_book_of_record OWNER TO postgres;

--
-- Name: first_book_of_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.first_book_of_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.first_book_of_record_id_seq OWNER TO postgres;

--
-- Name: first_book_of_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.first_book_of_record_id_seq OWNED BY public.first_book_of_record.id;


--
-- Name: goals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.goals (
    id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    status integer,
    day_started date,
    due_date date,
    user_id text NOT NULL,
    dept character varying(255) DEFAULT 'mechnical engineering'::character varying
);


ALTER TABLE public.goals OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.goals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.goals_id_seq OWNER TO postgres;

--
-- Name: goals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.goals_id_seq OWNED BY public.goals.id;


--
-- Name: hall_of_fame; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hall_of_fame (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    title character varying(255),
    image_url character varying(500),
    year character varying(4),
    description text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hall_of_fame OWNER TO postgres;

--
-- Name: hall_of_fame_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hall_of_fame_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hall_of_fame_id_seq OWNER TO postgres;

--
-- Name: hall_of_fame_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hall_of_fame_id_seq OWNED BY public.hall_of_fame.id;


--
-- Name: index; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.index (
    id integer NOT NULL,
    redundancy numeric,
    productivity numeric,
    utility numeric,
    dept character varying(255),
    org text
);


ALTER TABLE public.index OWNER TO postgres;

--
-- Name: index_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.index_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.index_id_seq OWNER TO postgres;

--
-- Name: index_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.index_id_seq OWNED BY public.index.id;


--
-- Name: lead_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lead_scores (
    pesuser_name character varying(255) NOT NULL,
    dept character varying(255) NOT NULL,
    competence double precision,
    integrity double precision,
    compatibility double precision,
    use_of_resources double precision
);


ALTER TABLE public.lead_scores OWNER TO postgres;

--
-- Name: motivation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.motivation (
    id integer NOT NULL,
    org text NOT NULL,
    total_score numeric(10,2) NOT NULL,
    rating text NOT NULL,
    thresholds jsonb NOT NULL,
    categories jsonb NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.motivation OWNER TO postgres;

--
-- Name: motivation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.motivation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.motivation_id_seq OWNER TO postgres;

--
-- Name: motivation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.motivation_id_seq OWNED BY public.motivation.id;


--
-- Name: non_academic_appraisal; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.non_academic_appraisal (
    id integer NOT NULL,
    org text NOT NULL,
    output numeric(10,2) NOT NULL,
    quality numeric(10,2) NOT NULL,
    efficiency numeric(10,2) NOT NULL,
    attendance numeric(10,2) NOT NULL,
    teamwork numeric(10,2) NOT NULL,
    total_score numeric(10,2) NOT NULL,
    rating text NOT NULL,
    thresholds jsonb NOT NULL,
    weights jsonb NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.non_academic_appraisal OWNER TO postgres;

--
-- Name: non_academic_appraisal_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.non_academic_appraisal_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.non_academic_appraisal_id_seq OWNER TO postgres;

--
-- Name: non_academic_appraisal_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.non_academic_appraisal_id_seq OWNED BY public.non_academic_appraisal.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    org character varying(255),
    title text NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: org; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    category character varying(100) NOT NULL,
    plan character varying(100) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    evaluation text[] DEFAULT ARRAY[]::text[],
    ongoing boolean DEFAULT false NOT NULL,
    maintenance_model boolean
);


ALTER TABLE public.org OWNER TO postgres;

--
-- Name: org_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.org_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.org_id_seq OWNER TO postgres;

--
-- Name: org_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.org_id_seq OWNED BY public.org.id;


--
-- Name: org_structure_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.org_structure_results (
    id integer NOT NULL,
    org text NOT NULL,
    section integer NOT NULL,
    result numeric(10,4),
    numerator numeric[],
    denominator numeric[],
    extra_data jsonb,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.org_structure_results OWNER TO postgres;

--
-- Name: org_structure_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.org_structure_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.org_structure_results_id_seq OWNER TO postgres;

--
-- Name: org_structure_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.org_structure_results_id_seq OWNED BY public.org_structure_results.id;


--
-- Name: performance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance (
    id integer NOT NULL,
    dept text NOT NULL,
    type text NOT NULL,
    yield text NOT NULL,
    user_id text NOT NULL
);


ALTER TABLE public.performance OWNER TO postgres;

--
-- Name: performance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_id_seq OWNER TO postgres;

--
-- Name: performance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_id_seq OWNED BY public.performance.id;


--
-- Name: performance_result; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.performance_result (
    id integer NOT NULL,
    org text NOT NULL,
    total_score numeric(10,2) NOT NULL,
    rating text NOT NULL,
    thresholds jsonb NOT NULL,
    criteria jsonb NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.performance_result OWNER TO postgres;

--
-- Name: performance_result_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.performance_result_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.performance_result_id_seq OWNER TO postgres;

--
-- Name: performance_result_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.performance_result_id_seq OWNED BY public.performance_result.id;


--
-- Name: permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permission (
    id integer NOT NULL,
    manage_user text,
    access_em text,
    ae_all text,
    ae_sub text,
    ae_sel text,
    define_performance text,
    dp_all text,
    dp_sub text,
    dp_sel text,
    access_hierachy text,
    manage_review text,
    mr_all text,
    mr_sub text,
    mr_sel text,
    user_id character varying(255),
    org character varying(255)
);


ALTER TABLE public.permission OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permission_id_seq OWNER TO postgres;

--
-- Name: permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permission_id_seq OWNED BY public.permission.id;


--
-- Name: personnel_redundancy; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnel_redundancy (
    id integer NOT NULL,
    org text,
    actual_staff integer NOT NULL,
    optimal_staff integer NOT NULL,
    low_threshold integer NOT NULL,
    moderate_threshold integer NOT NULL,
    pr_value numeric(6,2) NOT NULL,
    rating character varying(50) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.personnel_redundancy OWNER TO postgres;

--
-- Name: personnel_redundancy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personnel_redundancy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personnel_redundancy_id_seq OWNER TO postgres;

--
-- Name: personnel_redundancy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personnel_redundancy_id_seq OWNED BY public.personnel_redundancy.id;


--
-- Name: personnel_utilization; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personnel_utilization (
    id integer NOT NULL,
    org text NOT NULL,
    b numeric(10,2),
    w numeric(10,2),
    p0 numeric(6,3),
    t1 numeric(6,3),
    t2 numeric(6,3),
    t3 numeric(6,3),
    t4 numeric(6,3),
    s0 numeric(6,3),
    g numeric(10,2),
    d numeric(10,2),
    y numeric(6,3),
    alpha numeric(6,3),
    lambda numeric(6,3),
    mu numeric(6,3),
    j numeric(10,2),
    kmin integer,
    kmax integer,
    kstar integer,
    hstar numeric(12,6),
    constraints_ok boolean DEFAULT true,
    violations text[],
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.personnel_utilization OWNER TO postgres;

--
-- Name: personnel_utilization_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personnel_utilization_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personnel_utilization_id_seq OWNER TO postgres;

--
-- Name: personnel_utilization_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personnel_utilization_id_seq OWNED BY public.personnel_utilization.id;


--
-- Name: pesuser; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pesuser (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    gsm character varying(50),
    role character varying(50),
    address text,
    faculty_college character varying(255),
    dob date,
    doa date,
    poa character varying(255),
    doc character varying(255),
    post character varying(255),
    dopp date,
    level character varying(50),
    image character varying(255),
    org character varying(255),
    dept character varying(255),
    tier character varying(50) DEFAULT 'bronze'::character varying,
    category character varying(100),
    plan character varying(100)
);


ALTER TABLE public.pesuser OWNER TO postgres;

--
-- Name: pesuser_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pesuser_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pesuser_id_seq OWNER TO postgres;

--
-- Name: pesuser_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pesuser_id_seq OWNED BY public.pesuser.id;


--
-- Name: plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    paypal_plan_id text NOT NULL,
    name text NOT NULL,
    price_cents integer NOT NULL,
    currency_code character varying(10) NOT NULL,
    billing_cycle_interval_unit character varying(10) NOT NULL,
    billing_cycle_interval_count integer NOT NULL,
    trial_days integer DEFAULT 0,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.plans OWNER TO postgres;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    assigned integer,
    org character varying(255)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: second_book_of_record; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.second_book_of_record (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    achievement character varying(255) NOT NULL,
    category character varying(100),
    date_achieved date,
    image_url character varying(500),
    description text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    sub_category character varying(100)
);


ALTER TABLE public.second_book_of_record OWNER TO postgres;

--
-- Name: second_book_of_record_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.second_book_of_record_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.second_book_of_record_id_seq OWNER TO postgres;

--
-- Name: second_book_of_record_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.second_book_of_record_id_seq OWNED BY public.second_book_of_record.id;


--
-- Name: staff_appraisal_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_appraisal_results (
    id integer NOT NULL,
    org text NOT NULL,
    cwh numeric(10,2),
    cbh numeric(10,2),
    hd numeric(10,2),
    oq numeric(10,2),
    wq numeric(10,2),
    points numeric(10,2),
    rtp numeric(10,2),
    computed_appraisal_max_score numeric(10,2),
    hod_max_score numeric(10,2),
    na numeric(10,2),
    ta numeric(10,2),
    wasted_man_hours numeric(10,2),
    wasted_cost numeric(10,2),
    pidle numeric(10,2),
    lost_hours numeric(10,2),
    lost_cost numeric(10,2),
    total_wasted_cost numeric(10,2),
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff_appraisal_results OWNER TO postgres;

--
-- Name: staff_appraisal_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_appraisal_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_appraisal_results_id_seq OWNER TO postgres;

--
-- Name: staff_appraisal_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_appraisal_results_id_seq OWNED BY public.staff_appraisal_results.id;


--
-- Name: staff_motivation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_motivation (
    id integer NOT NULL,
    org integer NOT NULL,
    total_score numeric(10,2) NOT NULL,
    rating text NOT NULL,
    thresholds jsonb NOT NULL,
    categories jsonb NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff_motivation OWNER TO postgres;

--
-- Name: staff_motivation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_motivation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_motivation_id_seq OWNER TO postgres;

--
-- Name: staff_motivation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_motivation_id_seq OWNED BY public.staff_motivation.id;


--
-- Name: staff_survey_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_survey_responses (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    pesuser_email character varying(255) NOT NULL,
    org character varying(255),
    dept character varying(255),
    responses jsonb NOT NULL,
    submitted_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.staff_survey_responses OWNER TO postgres;

--
-- Name: staff_survey_responses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_survey_responses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_survey_responses_id_seq OWNER TO postgres;

--
-- Name: staff_survey_responses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_survey_responses_id_seq OWNED BY public.staff_survey_responses.id;


--
-- Name: stress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stress (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    stress_theme integer,
    stress_feeling_frequency integer,
    dept character varying(255)
);


ALTER TABLE public.stress OWNER TO postgres;

--
-- Name: stress_analysis_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stress_analysis_results (
    id integer NOT NULL,
    org character varying(255),
    group_by character varying(50),
    ssto double precision,
    sstr double precision,
    sse double precision,
    f_statistic double precision,
    critical_value double precision,
    conclusion text,
    df_between integer,
    df_within integer,
    ms_between double precision,
    ms_within double precision,
    mean double precision,
    std_dev double precision,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stress_analysis_results OWNER TO postgres;

--
-- Name: stress_analysis_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stress_analysis_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stress_analysis_results_id_seq OWNER TO postgres;

--
-- Name: stress_analysis_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stress_analysis_results_id_seq OWNED BY public.stress_analysis_results.id;


--
-- Name: stress_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stress_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stress_id_seq OWNER TO postgres;

--
-- Name: stress_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stress_id_seq OWNED BY public.stress.id;


--
-- Name: stress_scores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stress_scores (
    id integer NOT NULL,
    organizational numeric DEFAULT 0,
    student numeric DEFAULT 0,
    administrative numeric DEFAULT 0,
    teacher numeric DEFAULT 0,
    parents numeric DEFAULT 0,
    occupational numeric DEFAULT 0,
    personal numeric DEFAULT 0,
    academic_program numeric DEFAULT 0,
    negative_public_attitude numeric DEFAULT 0,
    misc numeric DEFAULT 0,
    org character varying(255),
    dept character varying(255),
    user_id uuid,
    user_name character varying(255)
);


ALTER TABLE public.stress_scores OWNER TO postgres;

--
-- Name: stress_scores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stress_scores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stress_scores_id_seq OWNER TO postgres;

--
-- Name: stress_scores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stress_scores_id_seq OWNED BY public.stress_scores.id;


--
-- Name: subscription_events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscription_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_type text NOT NULL,
    event_time timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    raw_payload jsonb NOT NULL,
    processed boolean DEFAULT false NOT NULL,
    subscription_id bigint NOT NULL
);


ALTER TABLE public.subscription_events OWNER TO postgres;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions (
    pesuser_id integer NOT NULL,
    plan_id uuid NOT NULL,
    paypal_subscription_id text NOT NULL,
    status character varying(50) NOT NULL,
    start_time timestamp(6) with time zone,
    next_billing_time timestamp(6) with time zone,
    last_billing_time timestamp(6) with time zone,
    cancel_time timestamp(6) with time zone,
    failed_payment_count integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    old_uuid_id uuid,
    id bigint NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_id_seq OWNER TO postgres;

--
-- Name: subscriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_id_seq OWNED BY public.subscriptions.id;


--
-- Name: subscriptions_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subscriptions_info (
    id integer NOT NULL,
    pesuser_email character varying(255) NOT NULL,
    pesuser_name character varying(255),
    org character varying(255),
    plan_code character varying(100) NOT NULL,
    plan_name character varying(100),
    reference character varying(100) NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    amount numeric(12,2),
    paid_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subscriptions_info OWNER TO postgres;

--
-- Name: subscriptions_info_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_info_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_info_id_seq OWNER TO postgres;

--
-- Name: subscriptions_info_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_info_id_seq OWNED BY public.subscriptions_info.id;


--
-- Name: unit_head_overloading; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unit_head_overloading (
    id integer NOT NULL,
    org text NOT NULL,
    actual_hours numeric(10,2) NOT NULL,
    num_subordinates integer NOT NULL,
    extra_complexity numeric(10,2) NOT NULL,
    optimal_hours numeric(10,2) NOT NULL,
    optimal_k numeric(10,2),
    complexity_factor numeric(10,3) NOT NULL,
    overload_ratio numeric(10,3) NOT NULL,
    status character varying(50) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.unit_head_overloading OWNER TO postgres;

--
-- Name: unit_head_overloading_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unit_head_overloading_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.unit_head_overloading_id_seq OWNER TO postgres;

--
-- Name: unit_head_overloading_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unit_head_overloading_id_seq OWNED BY public.unit_head_overloading.id;


--
-- Name: userperformance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userperformance (
    id integer NOT NULL,
    pesuser_name character varying(255) NOT NULL,
    org character varying(255),
    competence numeric,
    integrity numeric,
    compatibility numeric,
    use_of_resources numeric,
    dept character varying(255) DEFAULT 'mechanical engineering'::character varying,
    pending boolean DEFAULT false,
    resolve boolean DEFAULT false
);


ALTER TABLE public.userperformance OWNER TO postgres;

--
-- Name: userperformance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userperformance_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.userperformance_id_seq OWNER TO postgres;

--
-- Name: userperformance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userperformance_id_seq OWNED BY public.userperformance.id;


--
-- Name: OptimizationResult id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OptimizationResult" ALTER COLUMN id SET DEFAULT nextval('public."OptimizationResult_id_seq"'::regclass);


--
-- Name: StaffEstimation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffEstimation" ALTER COLUMN id SET DEFAULT nextval('public."StaffEstimation_id_seq"'::regclass);


--
-- Name: appraisal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appraisal ALTER COLUMN id SET DEFAULT nextval('public.appraisal_id_seq'::regclass);


--
-- Name: auditor_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditor_responses ALTER COLUMN id SET DEFAULT nextval('public.auditor_responses_id_seq'::regclass);


--
-- Name: auditor_survey_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditor_survey_responses ALTER COLUMN id SET DEFAULT nextval('public.auditor_survey_responses_id_seq'::regclass);


--
-- Name: badges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges ALTER COLUMN id SET DEFAULT nextval('public.badges_id_seq'::regclass);


--
-- Name: counter_appraisal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_appraisal ALTER COLUMN id SET DEFAULT nextval('public.counter_appraisal_id_seq'::regclass);


--
-- Name: counter_stress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_stress ALTER COLUMN id SET DEFAULT nextval('public.counter_stress_id_seq'::regclass);


--
-- Name: counter_userperformance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_userperformance ALTER COLUMN id SET DEFAULT nextval('public.counter_userperformance_id_seq'::regclass);


--
-- Name: facilities id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities ALTER COLUMN id SET DEFAULT nextval('public.facilities_id_seq'::regclass);


--
-- Name: first_book_of_record id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.first_book_of_record ALTER COLUMN id SET DEFAULT nextval('public.first_book_of_record_id_seq'::regclass);


--
-- Name: goals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals ALTER COLUMN id SET DEFAULT nextval('public.goals_id_seq'::regclass);


--
-- Name: hall_of_fame id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_of_fame ALTER COLUMN id SET DEFAULT nextval('public.hall_of_fame_id_seq'::regclass);


--
-- Name: index id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.index ALTER COLUMN id SET DEFAULT nextval('public.index_id_seq'::regclass);


--
-- Name: motivation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivation ALTER COLUMN id SET DEFAULT nextval('public.motivation_id_seq'::regclass);


--
-- Name: non_academic_appraisal id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.non_academic_appraisal ALTER COLUMN id SET DEFAULT nextval('public.non_academic_appraisal_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: org id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org ALTER COLUMN id SET DEFAULT nextval('public.org_id_seq'::regclass);


--
-- Name: org_structure_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_structure_results ALTER COLUMN id SET DEFAULT nextval('public.org_structure_results_id_seq'::regclass);


--
-- Name: performance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance ALTER COLUMN id SET DEFAULT nextval('public.performance_id_seq'::regclass);


--
-- Name: performance_result id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_result ALTER COLUMN id SET DEFAULT nextval('public.performance_result_id_seq'::regclass);


--
-- Name: permission id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission ALTER COLUMN id SET DEFAULT nextval('public.permission_id_seq'::regclass);


--
-- Name: personnel_redundancy id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_redundancy ALTER COLUMN id SET DEFAULT nextval('public.personnel_redundancy_id_seq'::regclass);


--
-- Name: personnel_utilization id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_utilization ALTER COLUMN id SET DEFAULT nextval('public.personnel_utilization_id_seq'::regclass);


--
-- Name: pesuser id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesuser ALTER COLUMN id SET DEFAULT nextval('public.pesuser_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: second_book_of_record id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.second_book_of_record ALTER COLUMN id SET DEFAULT nextval('public.second_book_of_record_id_seq'::regclass);


--
-- Name: staff_appraisal_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_appraisal_results ALTER COLUMN id SET DEFAULT nextval('public.staff_appraisal_results_id_seq'::regclass);


--
-- Name: staff_motivation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_motivation ALTER COLUMN id SET DEFAULT nextval('public.staff_motivation_id_seq'::regclass);


--
-- Name: staff_survey_responses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_survey_responses ALTER COLUMN id SET DEFAULT nextval('public.staff_survey_responses_id_seq'::regclass);


--
-- Name: stress id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress ALTER COLUMN id SET DEFAULT nextval('public.stress_id_seq'::regclass);


--
-- Name: stress_analysis_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_analysis_results ALTER COLUMN id SET DEFAULT nextval('public.stress_analysis_results_id_seq'::regclass);


--
-- Name: stress_scores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_scores ALTER COLUMN id SET DEFAULT nextval('public.stress_scores_id_seq'::regclass);


--
-- Name: subscriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_id_seq'::regclass);


--
-- Name: subscriptions_info id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions_info ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_info_id_seq'::regclass);


--
-- Name: unit_head_overloading id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_head_overloading ALTER COLUMN id SET DEFAULT nextval('public.unit_head_overloading_id_seq'::regclass);


--
-- Name: userperformance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userperformance ALTER COLUMN id SET DEFAULT nextval('public.userperformance_id_seq'::regclass);


--
-- Data for Name: OptimizationResult; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."OptimizationResult" (id, mode, "optimalK", "efficiencyValue", "totalStaffNeeded", "supervisoryStaff", "managementLevel1", "managementLevel2", "topManagementStaff", lecturers, "seniorLecturers", professors, "studentPopulation", "D", "G", "Y", alpha, t1, t2, t3, t4, "S0", "createdAt") FROM stdin;
\.


--
-- Data for Name: StaffEstimation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."StaffEstimation" (id, "methodType", "staffNeeded", "createdAt", "basicTime", "relaxAllowance", "loadFactor", "numTasks", "timePerTask", "availableHoursPerPerson", "observedTime", "estimatedTime", "correctiveFactor", "personsEstimate", "A", "B", "confidenceLimit", "utilizationFactor", "annualManHours", "standardManHours") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
1195efd1-b875-4d73-969b-7305ff73412b	089b36a33e8c0aeebe696161fbd4f454b1efb391bb4e0e53fd03b50b8824582e	2026-03-21 12:48:14.984652+01	20260321114813_add_expires_at	\N	\N	2026-03-21 12:48:14.813205+01	1
\.


--
-- Data for Name: appraisal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appraisal (id, pesuser_name, org, teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, other_relevant_information, dept, pending, resolve) FROM stdin;
\.


--
-- Data for Name: auditor_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditor_responses (id, name, email, gsm, address, dob, image, responses, status, created_at) FROM stdin;
\.


--
-- Data for Name: auditor_survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditor_survey_responses (id, pesuser_name, org, section, question, response, created_at) FROM stdin;
\.


--
-- Data for Name: badges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.badges (id, name, category, sub_category, image_url, description, created_at) FROM stdin;
\.


--
-- Data for Name: counter_appraisal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counter_appraisal (id, pesuser_name, org, teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, other_relevant_information, dept, pending) FROM stdin;
\.


--
-- Data for Name: counter_stress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counter_stress (id, pesuser_name, org, dept, created_at, stress_theme, stress_feeling_frequency) FROM stdin;
\.


--
-- Data for Name: counter_userperformance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.counter_userperformance (id, pesuser_name, org, dept, competence, integrity, compatibility, use_of_resources, created_at, pending) FROM stdin;
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.facilities (id, identification_symbol, description_of_facility, location, facility_register_id_no, type, priority_rating, remarks, org, created_at) FROM stdin;
\.


--
-- Data for Name: first_book_of_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.first_book_of_record (id, name, achievement, category, date_achieved, image_url, description, created_at, updated_at, sub_category) FROM stdin;
\.


--
-- Data for Name: goals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.goals (id, name, description, status, day_started, due_date, user_id, dept) FROM stdin;
1	appraisal	Time for the Due Date  of the execution	70	1990-01-01	2026-04-30	user admin	mechnical engineering
2	appraisal	Set for use	70	1990-01-01	2026-05-16	user admin	mechnical engineering
3	performance	Set for use	70	1990-01-01	2026-05-16	user admin	mechnical engineering
4	performance	Set for use	70	1990-01-01	2026-05-16	user admin	mechnical engineering
6	stress	Set for use	70	1990-01-01	2026-05-16	user admin	mechnical engineering
\.


--
-- Data for Name: hall_of_fame; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hall_of_fame (id, name, title, image_url, year, description, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: index; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.index (id, redundancy, productivity, utility, dept, org) FROM stdin;
\.


--
-- Data for Name: lead_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lead_scores (pesuser_name, dept, competence, integrity, compatibility, use_of_resources) FROM stdin;
\.


--
-- Data for Name: motivation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.motivation (id, org, total_score, rating, thresholds, categories, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: non_academic_appraisal; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.non_academic_appraisal (id, org, output, quality, efficiency, attendance, teamwork, total_score, rating, thresholds, weights, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, org, title, message, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: org; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org (id, name, category, plan, created_at, updated_at, evaluation, ongoing, maintenance_model) FROM stdin;
1	test org	academic	premium	2026-03-21 11:49:44.061	2026-03-21 11:49:44.061	{}	f	f
\.


--
-- Data for Name: org_structure_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.org_structure_results (id, org, section, result, numerator, denominator, extra_data, created_at) FROM stdin;
\.


--
-- Data for Name: performance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance (id, dept, type, yield, user_id) FROM stdin;
\.


--
-- Data for Name: performance_result; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.performance_result (id, org, total_score, rating, thresholds, criteria, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permission (id, manage_user, access_em, ae_all, ae_sub, ae_sel, define_performance, dp_all, dp_sub, dp_sel, access_hierachy, manage_review, mr_all, mr_sub, mr_sel, user_id, org) FROM stdin;
1	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	22	test org
2	\N	on	on	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	28	HOOAIJ
3	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	29	HOOAIJ
4	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	30	HOOAIJ
5	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	31	HOOAIJ
6	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	32	HOOAIJ
7	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	33	HOOAIJ
8	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	34	HOOAIJ
9	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	35	HOOAIJ
10	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	38	test org
11	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	41	test org
12	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	42	test org
13	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	43	test org
14	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	44	test org
15	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	45	test org
16	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	46	test org
17	\N	on	\N	on	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	47	test org
\.


--
-- Data for Name: personnel_redundancy; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel_redundancy (id, org, actual_staff, optimal_staff, low_threshold, moderate_threshold, pr_value, rating, created_at) FROM stdin;
\.


--
-- Data for Name: personnel_utilization; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personnel_utilization (id, org, b, w, p0, t1, t2, t3, t4, s0, g, d, y, alpha, lambda, mu, j, kmin, kmax, kstar, hstar, constraints_ok, violations, created_at) FROM stdin;
\.


--
-- Data for Name: pesuser; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pesuser (id, name, email, password, gsm, role, address, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org, dept, tier, category, plan) FROM stdin;
1	user admin	oti.dev@gmail.com	$2b$10$tBv2jeSAewTSWTnm3gopu.xmDF7xdoVXT8GfZFCBl.El6aDIoqFT6	\N	admin	\N	\N	\N	\N	\N	\N	\N	\N	\N	https://res.cloudinary.com/duvqe45ds/image/upload/v1774092909/pes/logo/txoglgwaadbllg4dc3by.jpg	test org	\N	bronze	academic	premium
2	Alice Johnson	alice.johnson@test.org	password123	08012345678	Staff	123 Main St	Engineering	1985-01-12	2010-05-01	Dept Head	PhD	Professor	2015-08-01	Senior		test org	Computer Science	bronze	academic	standard
3	Bob Smith	bob.smith@test.org	password123	08023456789	Staff	456 Elm St	Engineering	1980-03-25	2008-09-15	Lecturer	MSc	Senior Lecturer	2016-02-12	Senior		test org	Computer Science	bronze	academic	standard
4	Charlie Brown	charlie.brown@test.org	password123	08034567890	Staff	789 Oak St	Engineering	1978-07-10	2005-01-20	Dept Officer	PhD	Professor	2017-03-18	Senior		test org	Computer Science	bronze	academic	standard
5	Diana Prince	diana.prince@test.org	password123	08045678901	Staff	101 Maple St	Engineering	1982-11-05	2009-06-12	Coordinator	MSc	Lecturer	2018-05-20	Senior		test org	Computer Science	bronze	academic	standard
6	Ethan Hunt	ethan.hunt@test.org	password123	08056789012	Staff	202 Pine St	Engineering	1975-12-30	2003-03-10	Dept Head	PhD	Professor	2015-09-01	Senior		test org	Computer Science	bronze	academic	standard
7	Fiona Gallagher	fiona.gallagher@test.org	password123	08067890123	Staff	303 Birch St	Engineering	1987-08-18	2012-11-01	Coordinator	MSc	Lecturer	2019-07-22	Senior		test org	Computer Science	bronze	academic	standard
8	George Miller	george.miller@test.org	password123	08078901234	Staff	404 Cedar St	Engineering	1981-05-14	2007-02-17	Dept Officer	PhD	Professor	2016-12-01	Senior		test org	Computer Science	bronze	academic	standard
9	Hannah Lee	hannah.lee@test.org	password123	08089012345	Staff	505 Walnut St	Engineering	1984-09-22	2010-07-11	Lecturer	MSc	Senior Lecturer	2017-04-15	Senior		test org	Computer Science	bronze	academic	standard
10	Ian Wright	ian.wright@test.org	password123	08090123456	Staff	606 Cherry St	Engineering	1979-04-02	2006-10-05	Dept Officer	PhD	Professor	2015-11-10	Senior		test org	Computer Science	bronze	academic	standard
11	Jane Doe	jane.doe@test.org	password123	08001234567	Staff	707 Spruce St	Engineering	1983-06-27	2009-08-19	Coordinator	MSc	Lecturer	2018-01-30	Senior		test org	Computer Science	bronze	academic	standard
12	Kevin Hart	kevin.hart@test.org	password123	08012309876	Staff	808 Fir St	Engineering	1980-02-11	2008-05-14	Lecturer	MSc	Senior Lecturer	2016-03-22	Senior		test org	Computer Science	bronze	academic	standard
13	Laura King	laura.king@test.org	password123	08023410987	Staff	909 Palm St	Engineering	1985-10-03	2011-04-20	Dept Officer	PhD	Professor	2017-06-18	Senior		test org	Computer Science	bronze	academic	standard
14	Michael Scott	michael.scott@test.org	password123	08034521098	Staff	111 Redwood St	Engineering	1977-01-17	2004-09-12	Dept Head	PhD	Professor	2015-10-05	Senior		test org	Computer Science	bronze	academic	standard
15	Nancy Drew	nancy.drew@test.org	password123	08045632109	Staff	222 Sequoia St	Engineering	1982-03-28	2009-11-21	Coordinator	MSc	Lecturer	2018-02-14	Senior		test org	Computer Science	bronze	academic	standard
16	Oscar Wilde	oscar.wilde@test.org	password123	08056743210	Staff	333 Aspen St	Engineering	1986-12-12	2012-06-03	Lecturer	MSc	Senior Lecturer	2019-09-09	Senior		test org	Computer Science	bronze	academic	standard
17	Paula Abdul	paula.abdul@test.org	password123	08067854321	Staff	444 Cypress St	Engineering	1981-09-19	2007-01-05	Dept Officer	PhD	Professor	2016-05-11	Senior		test org	Computer Science	bronze	academic	standard
18	Quincy Adams	quincy.adams@test.org	password123	08078965432	Staff	555 Magnolia St	Engineering	1979-11-23	2005-12-15	Dept Head	PhD	Professor	2015-07-20	Senior		test org	Computer Science	bronze	academic	standard
19	Rachel Green	rachel.green@test.org	password123	08089076543	Staff	666 Willow St	Engineering	1984-07-08	2010-03-08	Coordinator	MSc	Lecturer	2017-01-22	Senior		test org	Computer Science	bronze	academic	standard
20	Steve Rogers	steve.rogers@test.org	password123	08090187654	Staff	777 Hawthorn St	Engineering	1980-05-30	2008-07-14	Dept Officer	PhD	Professor	2016-09-17	Senior		test org	Computer Science	bronze	academic	standard
35	Henry Omoregbee	homoregbe@unilag.edu.ng	Lwc5&#Se	+234 803 580 908	lecturer	44 Ajuwon	Engineering	2026-04-18	2026-04-03	\N	2026-04-15 01:00:00+01	Lecturer 1	2026-04-08	Senior lecturer	\N	HOOAIJ	\N	bronze	\N	\N
47	Omoregbee Henry Ogbemudia	omoregbeeogbemudia54@gmail.com	$2b$10$bESy4K/Ii69joHgr1gfGjep7A0d4ktXSvSU5le6MdTk8gm9lqyp32	+234 803 580 9083	lecturer	14 Ayinde close, Ajuwon	Engineering	1995-09-01	2000-06-24	\N	2004-02-28 01:00:00+01	Lecturer 1	2007-06-15	Senior Lecturer	\N	test org	Mechanical	bronze	\N	\N
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.plans (id, paypal_plan_id, name, price_cents, currency_code, billing_cycle_interval_unit, billing_cycle_interval_count, trial_days, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, assigned, org) FROM stdin;
\.


--
-- Data for Name: second_book_of_record; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.second_book_of_record (id, name, achievement, category, date_achieved, image_url, description, created_at, updated_at, sub_category) FROM stdin;
\.


--
-- Data for Name: staff_appraisal_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_appraisal_results (id, org, cwh, cbh, hd, oq, wq, points, rtp, computed_appraisal_max_score, hod_max_score, na, ta, wasted_man_hours, wasted_cost, pidle, lost_hours, lost_cost, total_wasted_cost, created_at) FROM stdin;
\.


--
-- Data for Name: staff_motivation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_motivation (id, org, total_score, rating, thresholds, categories, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: staff_survey_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff_survey_responses (id, pesuser_name, pesuser_email, org, dept, responses, submitted_at) FROM stdin;
\.


--
-- Data for Name: stress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stress (id, pesuser_name, org, stress_theme, stress_feeling_frequency, dept) FROM stdin;
1	Alice Johnson	test org	3	4	Computer Science
2	Bob Smith	test org	2	5	Mathematics
3	Charlie Brown	test org	4	3	Physics
4	Diana Prince	test org	1	2	Biology
5	Ethan Hunt	test org	5	5	Chemistry
6	Fiona Gallagher	test org	3	4	Engineering
7	George Miller	test org	2	3	Economics
8	Hannah Lee	test org	4	5	Statistics
9	Ian Wright	test org	1	2	Medicine
10	Jane Doe	test org	5	4	Law
11	Kevin Hart	test org	3	3	Philosophy
12	Laura King	test org	2	4	Sociology
13	Michael Scott	test org	4	5	History
14	Nancy Drew	test org	1	2	Geography
15	Oscar Wilde	test org	5	5	Architecture
16	Paula Abdul	test org	3	4	Music
17	Quincy Adams	test org	2	3	Art
18	Rachel Green	test org	4	5	Theatre
19	Steve Rogers	test org	1	2	Political Science
20	Tony Stark	test org	5	5	Education
\.


--
-- Data for Name: stress_analysis_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stress_analysis_results (id, org, group_by, ssto, sstr, sse, f_statistic, critical_value, conclusion, df_between, df_within, ms_between, ms_within, mean, std_dev, created_at) FROM stdin;
\.


--
-- Data for Name: stress_scores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stress_scores (id, organizational, student, administrative, teacher, parents, occupational, personal, academic_program, negative_public_attitude, misc, org, dept, user_id, user_name) FROM stdin;
1	4.5	3.2	2.1	3.8	2.5	4.0	3.0	3.5	2.2	1.5	test org	Computer Science	72837a98-c059-4127-a00b-f94c4eb2d847	Alice Johnson
2	2.0	4.1	3.5	2.8	3.2	3.7	2.9	4.2	3.3	2.0	test org	Mathematics	be81a7cb-582c-4ed1-a707-1a258956bbbc	Bob Smith
3	3.8	2.7	4.0	3.5	2.1	3.2	4.4	3.0	2.9	1.8	test org	Physics	7917e86e-5128-43c3-862c-28d94d287223	Charlie Brown
4	1.5	3.9	2.6	4.1	3.8	2.4	3.3	2.8	4.0	2.1	test org	Biology	078fa721-6b71-4869-976a-061b9dcd2e33	Diana Prince
5	3.2	4.5	3.8	2.9	2.7	4.3	3.1	3.6	2.5	2.2	test org	Chemistry	98fb47c7-0934-46ba-a6ad-0edbab0a1c86	Ethan Hunt
6	2.9	3.1	4.2	3.3	3.6	2.8	4.1	2.5	3.9	1.9	test org	Engineering	385155be-40da-4ef6-b528-88c9c3e957a2	Fiona Gallagher
7	4.1	2.8	3.7	4.4	2.9	3.5	3.8	2.7	3.1	2.3	test org	Economics	892452bb-93e9-4e56-ae8b-0e64b0accb26	George Miller
8	3.6	4.2	2.9	3.1	4.0	2.6	3.5	4.3	2.4	1.7	test org	Statistics	3f378b9b-e531-4034-91df-cb8af333bf24	Hannah Lee
9	2.4	3.7	3.3	4.2	2.8	4.1	3.6	2.9	3.5	2.0	test org	Medicine	1397442a-b0be-42ba-9ffc-dbedeba212b2	Ian Wright
10	4.3	2.5	4.1	3.7	3.4	3.0	4.2	3.8	2.6	1.6	test org	Law	3985b8d9-2d05-45b8-b012-2a261e59b900	Jane Doe
11	3.0	3.3	2.7	4.0	3.9	2.5	3.7	4.1	2.8	2.4	test org	Philosophy	fdf6b862-0349-487a-b414-5e8c5b87c17e	Kevin Hart
12	2.7	4.4	3.9	2.6	2.3	4.2	3.4	2.8	3.7	2.1	test org	Sociology	d3333a08-1fb1-41dd-a19c-5637e121d7a9	Laura King
13	4.0	2.6	3.5	4.3	3.1	3.9	2.7	3.2	2.5	1.8	test org	History	6f53ad69-ea18-42d8-9b44-d73e17173f59	Michael Scott
14	3.5	3.8	2.4	3.6	4.2	2.9	3.3	4.0	3.1	2.6	test org	Geography	defe74d8-2a15-4954-8723-409e12292324	Nancy Drew
15	2.8	4.0	3.6	2.7	3.5	4.4	3.9	2.6	3.8	2.3	test org	Architecture	b153365f-5539-4470-bb60-3bb1541db761	Oscar Wilde
16	3.9	2.9	4.3	3.4	2.6	3.8	4.0	3.1	2.7	1.9	test org	Music	536f3251-0de2-4b72-99cf-df784c900212	Paula Abdul
17	2.6	3.5	3.1	4.1	3.7	2.7	3.8	4.2	2.9	2.0	test org	Art	adb74949-6810-4000-960f-348a4939ee90	Quincy Adams
18	4.2	2.4	3.8	3.0	2.9	4.1	3.2	3.7	2.3	1.5	test org	Theatre	02f591da-eb15-46ce-ab23-db02aee7b2d6	Rachel Green
19	3.1	4.3	2.5	3.9	4.1	2.8	3.6	2.7	3.4	2.2	test org	Political Science	12e639be-d1a2-4d59-9c67-d65a1ecf0939	Steve Rogers
20	2.5	3.6	4.0	2.8	3.3	4.2	3.5	4.1	2.6	1.7	test org	Education	f7386d67-db3a-4f56-b3d1-31ade807f348	Tony Stark
\.


--
-- Data for Name: subscription_events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscription_events (id, event_type, event_time, raw_payload, processed, subscription_id) FROM stdin;
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions (pesuser_id, plan_id, paypal_subscription_id, status, start_time, next_billing_time, last_billing_time, cancel_time, failed_payment_count, metadata, created_at, updated_at, old_uuid_id, id) FROM stdin;
\.


--
-- Data for Name: subscriptions_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subscriptions_info (id, pesuser_email, pesuser_name, org, plan_code, plan_name, reference, status, amount, paid_at, created_at, expires_at) FROM stdin;
1	oti.dev@gmail.com	user admin	test org	PLN_bquiv8u3t2otwuh	premium	PES_07bdf345-0952-41e8-8347-06569019a2b9	success	\N	2026-03-21 11:49:44.148	2026-03-21 11:49:44.158	2027-03-21 11:49:44.148
\.


--
-- Data for Name: unit_head_overloading; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unit_head_overloading (id, org, actual_hours, num_subordinates, extra_complexity, optimal_hours, optimal_k, complexity_factor, overload_ratio, status, created_at) FROM stdin;
\.


--
-- Data for Name: userperformance; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.userperformance (id, pesuser_name, org, competence, integrity, compatibility, use_of_resources, dept, pending, resolve) FROM stdin;
1	Alice Johnson	test org	4.5	4.8	4.2	4.0	Computer Science	f	t
2	Bob Smith	test org	3.8	4.0	3.5	3.7	Computer Science	f	t
3	Charlie Brown	test org	4.2	4.5	4.1	4.3	Computer Science	f	t
4	Diana Prince	test org	3.5	3.8	3.9	3.6	Computer Science	f	f
5	Ethan Hunt	test org	4.7	4.9	4.5	4.8	Computer Science	f	t
6	Fiona Gallagher	test org	4.0	4.2	3.8	4.1	Computer Science	f	t
7	George Miller	test org	3.6	3.9	3.7	3.5	Computer Science	f	f
8	Hannah Lee	test org	4.3	4.4	4.0	4.2	Computer Science	f	t
9	Ian Wright	test org	3.7	3.8	3.6	3.9	Computer Science	f	f
10	Jane Doe	test org	4.1	4.3	4.0	4.1	Computer Science	f	t
11	Kevin Hart	test org	3.9	4.0	3.8	3.7	Computer Science	f	t
12	Laura King	test org	4.4	4.5	4.2	4.3	Computer Science	f	t
13	Michael Scott	test org	4.0	4.1	3.9	4.0	Computer Science	f	f
14	Nancy Drew	test org	3.8	3.9	3.7	3.6	Computer Science	f	t
15	Oscar Wilde	test org	4.5	4.7	4.3	4.6	Computer Science	f	t
16	Paula Abdul	test org	4.2	4.3	4.0	4.1	Computer Science	f	t
17	Quincy Adams	test org	3.9	4.0	3.8	3.7	Computer Science	f	f
18	Rachel Green	test org	4.3	4.4	4.1	4.2	Computer Science	f	t
19	Steve Rogers	test org	4.1	4.2	3.9	4.0	Computer Science	f	t
20	Tony Stark	test org	4.6	4.8	4.4	4.7	Computer Science	f	t
\.


--
-- Name: OptimizationResult_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."OptimizationResult_id_seq"', 1, false);


--
-- Name: StaffEstimation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."StaffEstimation_id_seq"', 1, false);


--
-- Name: appraisal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appraisal_id_seq', 1, false);


--
-- Name: auditor_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditor_responses_id_seq', 1, false);


--
-- Name: auditor_survey_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditor_survey_responses_id_seq', 1, false);


--
-- Name: badges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.badges_id_seq', 1, false);


--
-- Name: counter_appraisal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.counter_appraisal_id_seq', 1, false);


--
-- Name: counter_stress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.counter_stress_id_seq', 1, false);


--
-- Name: counter_userperformance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.counter_userperformance_id_seq', 1, false);


--
-- Name: facilities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.facilities_id_seq', 1, false);


--
-- Name: first_book_of_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.first_book_of_record_id_seq', 1, false);


--
-- Name: goals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.goals_id_seq', 6, true);


--
-- Name: hall_of_fame_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hall_of_fame_id_seq', 1, false);


--
-- Name: index_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.index_id_seq', 1, false);


--
-- Name: motivation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.motivation_id_seq', 1, false);


--
-- Name: non_academic_appraisal_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.non_academic_appraisal_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: org_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.org_id_seq', 1, true);


--
-- Name: org_structure_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.org_structure_results_id_seq', 1, false);


--
-- Name: performance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_id_seq', 1, false);


--
-- Name: performance_result_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.performance_result_id_seq', 1, false);


--
-- Name: permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permission_id_seq', 17, true);


--
-- Name: personnel_redundancy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_redundancy_id_seq', 1, false);


--
-- Name: personnel_utilization_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personnel_utilization_id_seq', 1, false);


--
-- Name: pesuser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pesuser_id_seq', 47, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: second_book_of_record_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.second_book_of_record_id_seq', 1, false);


--
-- Name: staff_appraisal_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_appraisal_results_id_seq', 1, false);


--
-- Name: staff_motivation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_motivation_id_seq', 1, false);


--
-- Name: staff_survey_responses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.staff_survey_responses_id_seq', 1, false);


--
-- Name: stress_analysis_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stress_analysis_results_id_seq', 1, false);


--
-- Name: stress_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stress_id_seq', 1, false);


--
-- Name: stress_scores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stress_scores_id_seq', 1, false);


--
-- Name: subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_id_seq', 1, false);


--
-- Name: subscriptions_info_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subscriptions_info_id_seq', 1, true);


--
-- Name: unit_head_overloading_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unit_head_overloading_id_seq', 1, false);


--
-- Name: userperformance_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.userperformance_id_seq', 20, true);


--
-- Name: OptimizationResult OptimizationResult_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."OptimizationResult"
    ADD CONSTRAINT "OptimizationResult_pkey" PRIMARY KEY (id);


--
-- Name: StaffEstimation StaffEstimation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StaffEstimation"
    ADD CONSTRAINT "StaffEstimation_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: appraisal appraisal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appraisal
    ADD CONSTRAINT appraisal_pkey PRIMARY KEY (id);


--
-- Name: auditor_responses auditor_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditor_responses
    ADD CONSTRAINT auditor_responses_pkey PRIMARY KEY (id);


--
-- Name: auditor_survey_responses auditor_survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditor_survey_responses
    ADD CONSTRAINT auditor_survey_responses_pkey PRIMARY KEY (id);


--
-- Name: badges badges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.badges
    ADD CONSTRAINT badges_pkey PRIMARY KEY (id);


--
-- Name: counter_appraisal counter_appraisal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_appraisal
    ADD CONSTRAINT counter_appraisal_pkey PRIMARY KEY (id);


--
-- Name: counter_stress counter_stress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_stress
    ADD CONSTRAINT counter_stress_pkey PRIMARY KEY (id);


--
-- Name: counter_userperformance counter_userperformance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.counter_userperformance
    ADD CONSTRAINT counter_userperformance_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: first_book_of_record first_book_of_record_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.first_book_of_record
    ADD CONSTRAINT first_book_of_record_pkey PRIMARY KEY (id);


--
-- Name: goals goals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.goals
    ADD CONSTRAINT goals_pkey PRIMARY KEY (id);


--
-- Name: hall_of_fame hall_of_fame_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hall_of_fame
    ADD CONSTRAINT hall_of_fame_pkey PRIMARY KEY (id);


--
-- Name: index index_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.index
    ADD CONSTRAINT index_pkey PRIMARY KEY (id);


--
-- Name: lead_scores lead_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lead_scores
    ADD CONSTRAINT lead_scores_pkey PRIMARY KEY (pesuser_name, dept);


--
-- Name: motivation motivation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivation
    ADD CONSTRAINT motivation_pkey PRIMARY KEY (id);


--
-- Name: non_academic_appraisal non_academic_appraisal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.non_academic_appraisal
    ADD CONSTRAINT non_academic_appraisal_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: org org_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT org_pkey PRIMARY KEY (id);


--
-- Name: org_structure_results org_structure_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org_structure_results
    ADD CONSTRAINT org_structure_results_pkey PRIMARY KEY (id);


--
-- Name: performance performance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance
    ADD CONSTRAINT performance_pkey PRIMARY KEY (id);


--
-- Name: performance_result performance_result_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.performance_result
    ADD CONSTRAINT performance_result_pkey PRIMARY KEY (id);


--
-- Name: permission permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permission
    ADD CONSTRAINT permission_pkey PRIMARY KEY (id);


--
-- Name: personnel_redundancy personnel_redundancy_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_redundancy
    ADD CONSTRAINT personnel_redundancy_pkey PRIMARY KEY (id);


--
-- Name: personnel_utilization personnel_utilization_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personnel_utilization
    ADD CONSTRAINT personnel_utilization_pkey PRIMARY KEY (id);


--
-- Name: pesuser pesuser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesuser
    ADD CONSTRAINT pesuser_pkey PRIMARY KEY (id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (name);


--
-- Name: second_book_of_record second_book_of_record_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.second_book_of_record
    ADD CONSTRAINT second_book_of_record_pkey PRIMARY KEY (id);


--
-- Name: staff_appraisal_results staff_appraisal_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_appraisal_results
    ADD CONSTRAINT staff_appraisal_results_pkey PRIMARY KEY (id);


--
-- Name: staff_motivation staff_motivation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_motivation
    ADD CONSTRAINT staff_motivation_pkey PRIMARY KEY (id);


--
-- Name: staff_survey_responses staff_survey_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_survey_responses
    ADD CONSTRAINT staff_survey_responses_pkey PRIMARY KEY (id);


--
-- Name: stress_analysis_results stress_analysis_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_analysis_results
    ADD CONSTRAINT stress_analysis_results_pkey PRIMARY KEY (id);


--
-- Name: stress stress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress
    ADD CONSTRAINT stress_pkey PRIMARY KEY (id);


--
-- Name: stress_scores stress_scores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stress_scores
    ADD CONSTRAINT stress_scores_pkey PRIMARY KEY (id);


--
-- Name: subscription_events subscription_events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_pkey PRIMARY KEY (id);


--
-- Name: subscriptions_info subscriptions_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions_info
    ADD CONSTRAINT subscriptions_info_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: unit_head_overloading unit_head_overloading_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unit_head_overloading
    ADD CONSTRAINT unit_head_overloading_pkey PRIMARY KEY (id);


--
-- Name: userperformance userperformance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userperformance
    ADD CONSTRAINT userperformance_pkey PRIMARY KEY (id);


--
-- Name: appraisal_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX appraisal_unique ON public.appraisal USING btree (pesuser_name, org, dept);


--
-- Name: appraisal_user_dept_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX appraisal_user_dept_unique ON public.appraisal USING btree (pesuser_name, dept);


--
-- Name: auditor_responses_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX auditor_responses_email_key ON public.auditor_responses USING btree (email);


--
-- Name: idx_first_book_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_first_book_category ON public.first_book_of_record USING btree (category);


--
-- Name: idx_first_book_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_first_book_date ON public.first_book_of_record USING btree (date_achieved);


--
-- Name: idx_hall_of_fame_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hall_of_fame_name ON public.hall_of_fame USING btree (name);


--
-- Name: idx_hall_of_fame_year; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_hall_of_fame_year ON public.hall_of_fame USING btree (year);


--
-- Name: idx_second_book_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_second_book_category ON public.second_book_of_record USING btree (category);


--
-- Name: idx_second_book_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_second_book_date ON public.second_book_of_record USING btree (date_achieved);


--
-- Name: org_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX org_name_key ON public.org USING btree (name);


--
-- Name: pesuser_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pesuser_email_key ON public.pesuser USING btree (email);


--
-- Name: pesuser_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX pesuser_id_unique ON public.pesuser USING btree (id);


--
-- Name: plans_paypal_plan_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX plans_paypal_plan_id_key ON public.plans USING btree (paypal_plan_id);


--
-- Name: subscriptions_info_reference_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscriptions_info_reference_key ON public.subscriptions_info USING btree (reference);


--
-- Name: subscriptions_paypal_subscription_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX subscriptions_paypal_subscription_id_key ON public.subscriptions USING btree (paypal_subscription_id);


--
-- Name: unique_user_per_dept_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_per_dept_org ON public.pesuser USING btree (name, dept, org);


--
-- Name: userperformance_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX userperformance_unique ON public.userperformance USING btree (pesuser_name, org, dept);


--
-- Name: notifications fk_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.pesuser(id) ON DELETE CASCADE;


--
-- Name: subscription_events subscription_events_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscription_events
    ADD CONSTRAINT subscription_events_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: subscriptions subscriptions_pesuser_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pesuser_id_fkey FOREIGN KEY (pesuser_id) REFERENCES public.pesuser(id);


--
-- Name: subscriptions subscriptions_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict c6cKrYOvPfZYMssZmZIbLudkqkh10lR116MrErV5gTm8diGHPHV9nSPFISZKX8h

