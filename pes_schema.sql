--
-- PostgreSQL database dump
--

\restrict 1xipIigraIwEdKfhtzsNoCg54TaiwxfH8sY9QqDZv5fpvbltS8OCIPNaJprYkLx

-- Dumped from database version 17.4
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
    "createdAt" timestamp without time zone DEFAULT now()
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
    "createdAt" timestamp without time zone DEFAULT now(),
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT now(),
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
    created_at timestamp without time zone DEFAULT now(),
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    created_at timestamp with time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    evaluation text[] DEFAULT '{}'::text[] NOT NULL,
    ongoing boolean DEFAULT false NOT NULL
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
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
    submitted_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
    event_time timestamp with time zone DEFAULT now() NOT NULL,
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
    start_time timestamp with time zone,
    next_billing_time timestamp with time zone,
    last_billing_time timestamp with time zone,
    cancel_time timestamp with time zone,
    failed_payment_count integer DEFAULT 0,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    old_uuid_id uuid,
    id bigint NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO postgres;

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
    paid_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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
-- Name: subscriptions_new_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subscriptions_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscriptions_new_id_seq OWNER TO postgres;

--
-- Name: subscriptions_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subscriptions_new_id_seq OWNED BY public.subscriptions.id;


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
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
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

ALTER TABLE ONLY public.subscriptions ALTER COLUMN id SET DEFAULT nextval('public.subscriptions_new_id_seq'::regclass);


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
-- Name: appraisal appraisal_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appraisal
    ADD CONSTRAINT appraisal_pkey PRIMARY KEY (id);


--
-- Name: appraisal appraisal_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appraisal
    ADD CONSTRAINT appraisal_unique UNIQUE (pesuser_name, org, dept);


--
-- Name: appraisal appraisal_user_dept_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appraisal
    ADD CONSTRAINT appraisal_user_dept_unique UNIQUE (pesuser_name, dept);


--
-- Name: auditor_responses auditor_responses_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditor_responses
    ADD CONSTRAINT auditor_responses_email_key UNIQUE (email);


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
-- Name: org org_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.org
    ADD CONSTRAINT org_name_key UNIQUE (name);


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
-- Name: pesuser pesuser_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesuser
    ADD CONSTRAINT pesuser_email_key UNIQUE (email);


--
-- Name: pesuser pesuser_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesuser
    ADD CONSTRAINT pesuser_id_unique UNIQUE (id);


--
-- Name: pesuser pesuser_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pesuser
    ADD CONSTRAINT pesuser_pkey PRIMARY KEY (id);


--
-- Name: plans plans_paypal_plan_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_paypal_plan_id_key UNIQUE (paypal_plan_id);


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
-- Name: subscriptions_info subscriptions_info_reference_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions_info
    ADD CONSTRAINT subscriptions_info_reference_key UNIQUE (reference);


--
-- Name: subscriptions subscriptions_paypal_subscription_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_paypal_subscription_id_key UNIQUE (paypal_subscription_id);


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
-- Name: userperformance userperformance_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userperformance
    ADD CONSTRAINT userperformance_unique UNIQUE (pesuser_name, org, dept);


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
-- Name: unique_user_per_dept_org; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_user_per_dept_org ON public.pesuser USING btree (name, dept, org);


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
-- PostgreSQL database dump complete
--

\unrestrict 1xipIigraIwEdKfhtzsNoCg54TaiwxfH8sY9QqDZv5fpvbltS8OCIPNaJprYkLx

