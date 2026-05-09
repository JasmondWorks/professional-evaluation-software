DO $$
DECLARE
    depts TEXT[] := ARRAY['mechanical engineering', 'electrical engineering', 'computer engineering', 'chemical engineering'];
    roles TEXT[] := ARRAY['lecturer', 'industrial-engineer', 'employee-w'];
    d TEXT;
    i INT;
    rand_role TEXT;
    phone_seq INT := 1000;
    uname TEXT;
    uemail TEXT;
BEGIN
    FOREACH d IN ARRAY depts LOOP
        -- Insert team lead
        uname := d || '_lead';
        uemail := lower(replace(d, ' ', '')) || '_lead@unilag.edu';

        INSERT INTO pesuser (
            name, email, password, gsm, role, address, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org, dept, tier
        ) VALUES (
            uname,
            uemail,
            'otonye',
            '+23480' || phone_seq::TEXT,
            'team lead',
            'Lagos',
            'engineering',
            '1980-01-01',
            '2010-09-01',
            'Full-time',
            'Staff ID',
            'Head of Dept',
            '2024-01-01',
            'Masters',
            d || '.png',
            'university of lagos',
            d,
            'gold'
        );
        phone_seq := phone_seq + 1;

        -- add related data for team lead
        INSERT INTO stress (pesuser_name, org, stress_category, stress_theme_form, stress_feeling_frequency_form, dept)
        VALUES (uname, 'university of lagos', 'workload', 'occupational', 'often', d);

        INSERT INTO appraisal (pesuser_name, org, teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, dept)
        VALUES (uname, 'university of lagos', 50 + random()*30, 50 + random()*30, 50 + random()*30, 50 + random()*30, d);

        INSERT INTO userperformance (pesuser_name, org, competence, integrity, compatibility, use_of_resources, dept)
        VALUES (uname, 'university of lagos', 60 + random()*40, 60 + random()*40, 60 + random()*40, 60 + random()*40, d);

        -- Insert 14 employees
        FOR i IN 1..14 LOOP
            rand_role := roles[1 + floor(random() * array_length(roles, 1))::int];
            uname := d || '_emp' || i;
            uemail := lower(replace(d, ' ', '')) || '_emp' || i || '@unilag.edu';

            INSERT INTO pesuser (
                name, email, password, gsm, role, address, faculty_college, dob, doa, poa, doc, post, dopp, level, image, org, dept, tier
            ) VALUES (
                uname,
                uemail,
                'otonye',
                '+23480' || phone_seq::TEXT,
                rand_role,
                'Lagos',
                'engineering',
                ('1990-01-01'::date + (i * interval '100 days')),
                ('2020-09-01'::date + (i * interval '30 days')),
                'Staff',
                'Staff ID',
                'Lecturer',
                ('2024-01-01'::date + (i * interval '15 days')),
                'BSc',
                uname || '.png',
                'university of lagos',
                d,
                CASE WHEN i % 3 = 0 THEN 'bronze' WHEN i % 3 = 1 THEN 'silver' ELSE 'gold' END
            );
            phone_seq := phone_seq + 1;

            -- only insert related data if not employee-w
            IF rand_role <> 'employee-w' THEN
                INSERT INTO stress (pesuser_name, org, stress_category, stress_theme_form, stress_feeling_frequency_form, dept)
                VALUES (uname, 'university of lagos', 'deadlines', 'personal', 'sometimes', d);

                INSERT INTO appraisal (pesuser_name, org, teaching_quality_evaluation, research_quality_evaluation, administrative_quality_evaluation, community_quality_evaluation, dept)
                VALUES (uname, 'university of lagos', 40 + random()*40, 40 + random()*40, 40 + random()*40, 40 + random()*40, d);

                INSERT INTO userperformance (pesuser_name, org, competence, integrity, compatibility, use_of_resources, dept)
                VALUES (uname, 'university of lagos', 50 + random()*50, 50 + random()*50, 50 + random()*50, 50 + random()*50, d);
            END IF;
        END LOOP;
    END LOOP;
END $$;
