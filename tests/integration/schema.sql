--
-- PostgreSQL database dump
--

-- Dumped from database version 14.22
-- Dumped by pg_dump version 14.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: handle_lead_count_deletion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_lead_count_deletion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrement lead count if the member was a leader on this trip
    IF OLD.is_leader THEN
        UPDATE trip_leader
        SET lead_count = lead_count - 1
        WHERE member_id = OLD.member_id;
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: handle_lead_count_insertion(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_lead_count_insertion() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Increment lead count if the member is a leader on this trip
    IF NEW.is_leader THEN
        UPDATE trip_leader
        SET lead_count = lead_count + 1
        WHERE member_id = NEW.member_id;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: set_verified_false_if_expired(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_verified_false_if_expired() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if the member is part of the driver_expired view
    IF ((NEW.driver_data ->> 'Expires')::date < CURRENT_DATE) THEN
        -- Update the Verified field to false
        NEW.driver_data = jsonb_set(NEW.driver_data::jsonb, '{Verified}', 'false'::jsonb)::json;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: update_certified_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_certified_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- If `verified` is true, set `certified` to true in `trip_leader`
    IF NEW.first_aid_data->>'Verified' = 'true' THEN
        UPDATE trip_leader
        SET process = jsonb_set(process::jsonb, '{certified}', 'true'::jsonb)
        WHERE trip_leader.member_id = NEW.member_id;

    -- If `verified` is false, set `certified` to false in `trip_leader`
    ELSIF NEW.first_aid_data->>'Verified' = 'false' THEN
        UPDATE trip_leader
        SET process = jsonb_set(process::jsonb, '{certified}', 'false'::jsonb)
        WHERE trip_leader.member_id = NEW.member_id;
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: update_trip_count_after_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_trip_count_after_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE member
    SET trip_count = trip_count - 1
    WHERE member_id = OLD.member_id;
    RETURN OLD;
END;
$$;


--
-- Name: update_trip_count_after_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_trip_count_after_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE member
    SET trip_count = trip_count + 1
    WHERE member_id = NEW.member_id;
    RETURN NEW;
END;
$$;


--
-- Name: member_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.member_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: member; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.member (
    member_id integer DEFAULT nextval('public.member_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    pronouns character varying(255),
    email character varying(255) NOT NULL,
    phone character varying(255),
    dues_data json,
    first_aid_data json,
    car_data json,
    driver_data json,
    emergency_data json,
    policy_agreement boolean,
    waiver_agreement boolean,
    school_year character varying(255),
    medical_data json,
    trip_count integer DEFAULT 0,
    holds character varying,
    signup_count integer DEFAULT 0,
    years_active character varying(255),
    campus character varying(25)
);


--
-- Name: active_members; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.active_members AS
 SELECT (member.name)::text AS "Name",
    (member.email)::text AS "Email",
    (member.phone)::text AS "Phone",
    concat('Yes ', to_char((((CURRENT_DATE)::text)::date)::timestamp with time zone, 'MM/DD'::text)) AS "Active",
        CASE
            WHEN (((member.first_aid_data ->> 'Expires'::text))::date > CURRENT_DATE) THEN concat((member.first_aid_data ->> 'Type'::text), ' ', to_char((((member.first_aid_data ->> 'Expires'::text))::date)::timestamp with time zone, 'MM/YYYY'::text))
            ELSE NULL::text
        END AS "First Aid",
        CASE
            WHEN (((member.driver_data ->> 'Expires'::text))::date > CURRENT_DATE) THEN concat('Valid ', to_char((((member.driver_data ->> 'Expires'::text))::date)::timestamp with time zone, 'MM/YYYY'::text))
            ELSE NULL::text
        END AS "Driver",
        CASE
            WHEN (member.car_data IS NOT NULL) THEN concat((member.car_data ->> 'Model'::text), ' ', (member.car_data ->> 'Capacity'::text), ' ', (member.car_data ->> 'Nickname'::text))
            ELSE NULL::text
        END AS "Car",
        CASE
            WHEN (member.medical_data IS NOT NULL) THEN 'Info Available'::text
            ELSE NULL::text
        END AS "Medical",
    (member.emergency_data ->> 'Email'::text) AS "Emergency Email",
    (member.emergency_data ->> 'Phone'::text) AS "Emergency Phone",
    member.campus
   FROM public.member
  WHERE ((((member.dues_data ->> 'Expires'::text))::date > CURRENT_DATE) AND (member.waiver_agreement = true) AND (member.policy_agreement = true) AND (NOT ((member.email)::text = 'poc@purdue.edu'::text)))
  ORDER BY member.name;


--
-- Name: all_members; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.all_members AS
 SELECT (member.name)::text AS "Name",
    (member.email)::text AS "Email",
    (member.phone)::text AS "Phone",
        CASE
            WHEN ((((member.dues_data ->> 'Expires'::text))::date > CURRENT_DATE) AND (member.waiver_agreement = true) AND (member.policy_agreement = true) AND (member.holds IS NULL)) THEN concat('Yes ', to_char((((CURRENT_DATE)::text)::date)::timestamp with time zone, 'MM/DD'::text))
            ELSE (((('No'::text ||
            CASE
                WHEN ((member.dues_data IS NULL) OR (((member.dues_data ->> 'Expires'::text))::date < CURRENT_DATE)) THEN ' Dues'::text
                ELSE ''::text
            END) ||
            CASE
                WHEN ((member.policy_agreement IS NULL) OR (NOT (member.policy_agreement = true))) THEN ' IPA'::text
                ELSE ''::text
            END) ||
            CASE
                WHEN ((member.waiver_agreement IS NULL) OR (NOT (member.waiver_agreement = true))) THEN ' CSW'::text
                ELSE ''::text
            END) ||
            CASE
                WHEN (member.holds IS NOT NULL) THEN ' HOLDS'::text
                ELSE ''::text
            END)
        END AS "Active",
    (member.policy_agreement)::text AS "Policy",
    (member.waiver_agreement)::text AS "Waiver",
        CASE
            WHEN (((member.first_aid_data ->> 'Expires'::text))::date > CURRENT_DATE) THEN concat((member.first_aid_data ->> 'Type'::text), ' ', to_char((((member.first_aid_data ->> 'Expires'::text))::date)::timestamp with time zone, 'MM/YYYY'::text))
            ELSE NULL::text
        END AS "First Aid",
        CASE
            WHEN (((member.driver_data ->> 'Expires'::text))::date > CURRENT_DATE) THEN concat('Valid ', to_char((((member.driver_data ->> 'Expires'::text))::date)::timestamp with time zone, 'MM/YYYY'::text))
            ELSE NULL::text
        END AS "Driver",
        CASE
            WHEN (member.car_data IS NOT NULL) THEN concat((member.car_data ->> 'Capacity'::text), ' ', (member.car_data ->> 'Model'::text), ', ', (member.car_data ->> 'Nickname'::text))
            ELSE NULL::text
        END AS "Car",
        CASE
            WHEN (member.medical_data IS NOT NULL) THEN 'Info Available'::text
            ELSE NULL::text
        END AS "Medical",
    (member.emergency_data ->> 'Email'::text) AS "Emergency Email",
    (member.emergency_data ->> 'Phone'::text) AS "Emergency Phone"
   FROM public.member
  WHERE (NOT ((member.email)::text = 'poc@purdue.edu'::text))
  ORDER BY member.name;


--
-- Name: driver_expired; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.driver_expired AS
 SELECT member.name,
    member.email,
    member.driver_data
   FROM public.member
  WHERE (((member.driver_data ->> 'Expires'::text))::date < CURRENT_DATE);


--
-- Name: gear; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gear (
    gear_id integer NOT NULL,
    lastcheckedout timestamp without time zone,
    datereturned timestamp without time zone,
    gear_data json NOT NULL
);


--
-- Name: gear_out; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.gear_out (
    gear_id integer NOT NULL,
    member_id integer NOT NULL,
    due_date timestamp without time zone NOT NULL
);


--
-- Name: invalid_members; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.invalid_members AS
 SELECT member.member_id,
    member.name,
    member.email,
    member.dues_data,
    member.policy_agreement,
    member.waiver_agreement
   FROM public.member
  WHERE (NOT (member.member_id IN ( SELECT member_1.member_id
           FROM public.member member_1
          WHERE ((member_1.dues_data IS NOT NULL) AND (member_1.waiver_agreement = true) AND (member_1.policy_agreement = true)))))
  ORDER BY member.member_id;


--
-- Name: officer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.officer (
    member_id integer NOT NULL,
    "position" character varying(255) NOT NULL,
    year integer NOT NULL,
    officer_data json
);


--
-- Name: trip_leader; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_leader (
    member_id integer NOT NULL,
    sport character varying(100) DEFAULT 'Not Specified'::character varying,
    process json DEFAULT '{"certified": false, "shadow": false, "approved": false}'::json,
    lead_count integer DEFAULT 0,
    gmail character varying(100)
);


--
-- Name: pofficers; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.pofficers AS
 SELECT member.member_id,
    member.name,
    officer."position",
    member.email AS "Purdue Email",
    trip_leader.gmail AS "Personal Email"
   FROM ((public.member
     JOIN public.officer ON ((member.member_id = officer.member_id)))
     LEFT JOIN public.trip_leader ON ((member.member_id = trip_leader.member_id)))
  ORDER BY officer."position";


--
-- Name: potential_dues_fails; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.potential_dues_fails AS
 SELECT member.member_id,
    member.name,
    member.pronouns,
    member.email,
    member.phone,
    member.dues_data,
    member.first_aid_data,
    member.car_data,
    member.driver_data,
    member.emergency_data,
    member.policy_agreement,
    member.waiver_agreement,
    member.school_year,
    member.medical_data,
    member.trip_count,
    member.holds
   FROM public.member
  WHERE ((member.waiver_agreement IS NOT NULL) AND (member.policy_agreement IS NOT NULL) AND (member.dues_data IS NULL))
  ORDER BY member.member_id;


--
-- Name: trip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip (
    trip_id integer NOT NULL,
    name character varying(255) NOT NULL,
    startdate timestamp with time zone NOT NULL,
    enddate timestamp with time zone NOT NULL,
    category character varying(255),
    sport character varying(255),
    location character varying,
    description character varying,
    logs json,
    signup boolean DEFAULT false,
    difficulty integer,
    is_cancelled boolean DEFAULT false
);


--
-- Name: TABLE trip; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.trip IS 'startdate and enddate columns are in UTC!!';


--
-- Name: trip_roster; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trip_roster (
    trip_id integer NOT NULL,
    member_id integer NOT NULL,
    is_leader boolean NOT NULL
);


--
-- Name: rosters; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.rosters AS
 SELECT concat(trip.name, ' | ', trip.category, ' | ', trip.sport, ' | ', to_char(trip.startdate, 'Mon DD, YYYY'::text), ' to ', to_char(trip.enddate, 'Mon DD, YYYY'::text)) AS trip,
    string_agg(((member.name)::text ||
        CASE
            WHEN trip_roster.is_leader THEN ' (Leader)'::text
            ELSE ''::text
        END), ', '::text ORDER BY trip_roster.is_leader DESC, member.name) AS roster
   FROM ((public.trip_roster
     JOIN public.trip ON ((trip_roster.trip_id = trip.trip_id)))
     JOIN public.member ON ((trip_roster.member_id = member.member_id)))
  GROUP BY trip.trip_id, trip.name, trip.category, trip.sport, trip.startdate, trip.enddate;


--
-- Name: trip_leader_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.trip_leader_status AS
 SELECT m.name,
    m.pronouns,
    tl.sport,
    tl.lead_count,
        CASE
            WHEN (((tl.process ->> 'certified'::text) = 'true'::text) AND ((tl.process ->> 'shadow'::text) = 'true'::text) AND ((tl.process ->> 'approved'::text) = 'true'::text)) THEN 'Fully Approved'::text
            ELSE concat_ws(', '::text,
            CASE
                WHEN ((tl.process ->> 'certified'::text) = 'false'::text) THEN 'Not Certified Yet / Certification Expired'::text
                ELSE NULL::text
            END,
            CASE
                WHEN ((tl.process ->> 'shadow'::text) = 'false'::text) THEN 'Has not shadowed a trip yet'::text
                ELSE NULL::text
            END,
            CASE
                WHEN ((tl.process ->> 'approved'::text) = 'false'::text) THEN 'Yet to be approved by Admin Board'::text
                ELSE NULL::text
            END)
        END AS status
   FROM (public.trip_leader tl
     JOIN public.member m ON ((tl.member_id = m.member_id)));


--
-- Name: trip_logs; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.trip_logs AS
 SELECT trip.name,
    concat(to_char(trip.startdate, 'Mon DD, YYYY'::text), ' - ', to_char(trip.enddate, 'Mon DD, YYYY'::text)) AS trip_dates_eastern,
    trip.trip_id,
    trip.category,
    trip.sport,
    concat(trip.location, ' - ', (trip.logs ->> 'Location Details'::text)) AS location_with_details,
    concat('What went well: ', (trip.logs ->> 'What went well'::text), '
What went wrong: ', (trip.logs ->> 'What went wrong'::text), '
Additional notes/tips: ', (trip.logs ->> 'Additional notes/tips'::text)) AS summary_feedback,
    (trip.logs ->> 'Link to Photos'::text) AS photos_link
   FROM public.trip
  WHERE (((trip.category)::text !~~* '%weekly%'::text) AND ((trip.category)::text !~~* '%meeting%'::text))
  ORDER BY trip.startdate
 LIMIT 500000;


--
-- Name: trip_trip_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.trip ALTER COLUMN trip_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.trip_trip_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: gear_out gear_out_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gear_out
    ADD CONSTRAINT gear_out_pkey PRIMARY KEY (gear_id, member_id);


--
-- Name: gear gear_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gear
    ADD CONSTRAINT gear_pkey PRIMARY KEY (gear_id);


--
-- Name: member member_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.member
    ADD CONSTRAINT member_pkey PRIMARY KEY (member_id);


--
-- Name: officer officer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer
    ADD CONSTRAINT officer_pkey PRIMARY KEY (member_id, "position");


--
-- Name: trip_leader trip_leader_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_leader
    ADD CONSTRAINT trip_leader_pkey PRIMARY KEY (member_id);


--
-- Name: trip trip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip
    ADD CONSTRAINT trip_pkey PRIMARY KEY (trip_id);


--
-- Name: trip_roster trip_roster_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_roster
    ADD CONSTRAINT trip_roster_pkey PRIMARY KEY (member_id, trip_id);


--
-- Name: officer unique_officer; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer
    ADD CONSTRAINT unique_officer UNIQUE (member_id, "position", year);


--
-- Name: trip_roster after_delete_trip_roster; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_delete_trip_roster AFTER DELETE ON public.trip_roster FOR EACH ROW EXECUTE FUNCTION public.update_trip_count_after_delete();


--
-- Name: trip_roster after_insert_trip_roster; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_insert_trip_roster AFTER INSERT ON public.trip_roster FOR EACH ROW EXECUTE FUNCTION public.update_trip_count_after_insert();


--
-- Name: trip_roster after_leader_deletion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_leader_deletion AFTER DELETE ON public.trip_roster FOR EACH ROW EXECUTE FUNCTION public.handle_lead_count_deletion();


--
-- Name: trip_roster after_leader_insertion; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_leader_insertion AFTER INSERT ON public.trip_roster FOR EACH ROW EXECUTE FUNCTION public.handle_lead_count_insertion();


--
-- Name: member driver_set_verified_false; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER driver_set_verified_false BEFORE INSERT OR UPDATE ON public.member FOR EACH ROW WHEN ((((new.driver_data ->> 'Expires'::text))::date < CURRENT_DATE)) EXECUTE FUNCTION public.set_verified_false_if_expired();


--
-- Name: member update_certified_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_certified_trigger AFTER UPDATE OF first_aid_data ON public.member FOR EACH ROW EXECUTE FUNCTION public.update_certified_status();


--
-- Name: gear_out gear_out_gear_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gear_out
    ADD CONSTRAINT gear_out_gear_id_fkey FOREIGN KEY (gear_id) REFERENCES public.gear(gear_id) ON DELETE CASCADE;


--
-- Name: gear_out gear_out_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.gear_out
    ADD CONSTRAINT gear_out_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(member_id) ON DELETE CASCADE;


--
-- Name: officer member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.officer
    ADD CONSTRAINT member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(member_id) NOT VALID;


--
-- Name: trip_leader trip_leader_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_leader
    ADD CONSTRAINT trip_leader_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(member_id);


--
-- Name: trip_roster trip_roster_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_roster
    ADD CONSTRAINT trip_roster_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.member(member_id) ON DELETE CASCADE;


--
-- Name: trip_roster trip_roster_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trip_roster
    ADD CONSTRAINT trip_roster_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trip(trip_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

