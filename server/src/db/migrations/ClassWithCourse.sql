-- New Class table without redundant class_name
CREATE TABLE Class (
    class_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    course_id INT NOT NULL REFERENCES Course(course_id) ON DELETE CASCADE,
    lecturer_id INT NOT NULL REFERENCES Lecturer(lecturer_id) ON DELETE CASCADE,
    venue_id INT NOT NULL REFERENCES Venue(venue_id) ON DELETE CASCADE,
    scheduled_time TIME NOT NULL
);

-- View that automatically builds the class name
CREATE OR REPLACE VIEW ClassWithCourseName AS
SELECT 
    c.class_id,
    cr.course_code || ' - ' || cr.course_name AS class_name,
    c.course_id,
    c.lecturer_id,
    c.venue_id,
    c.scheduled_time
FROM Class c
JOIN Course cr ON c.course_id = cr.course_id;
