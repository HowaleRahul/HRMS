-- Create database without deleting existing production data
CREATE DATABASE IF NOT EXISTS hrms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hrms_db;

-- ==============================================================================
-- MASTER TABLES
-- ==============================================================================

CREATE TABLE master_gender (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_gender (name) VALUES ('Male'), ('Female'), ('Other');

CREATE TABLE master_blood_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_blood_group (name) VALUES ('A+'), ('A-'), ('B+'), ('B-'), ('AB+'), ('AB-'), ('O+'), ('O-');

CREATE TABLE master_employment_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_employment_type (name) VALUES ('Full Time'), ('Part Time'), ('Contract'), ('Intern'), ('Probation');

CREATE TABLE master_marital_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_marital_status (name) VALUES ('Single'), ('Married'), ('Divorced'), ('Widowed');

CREATE TABLE master_leave_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_leave_type (name) VALUES ('Casual Leave'), ('Sick Leave'), ('Earned Leave'), ('Maternity Leave'), ('Paternity Leave'), ('Compensatory Off'), ('Loss of Pay');

CREATE TABLE master_asset_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_asset_type (name) VALUES ('Laptop'), ('Desktop'), ('Mobile'), ('ID Card'), ('Accessories'), ('Monitor'), ('Keyboard'), ('Mouse'), ('Headset');

CREATE TABLE master_document_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_document_type (name) VALUES ('Aadhaar Card'), ('PAN Card'), ('Passport'), ('Driving License'), ('Voter ID'), ('Offer Letter'), ('Appointment Letter'), ('Relieving Letter'), ('Experience Certificate'), ('Salary Slip'), ('Degree Certificate'), ('Mark Sheet'), ('Other');

CREATE TABLE master_interview_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_interview_status (name) VALUES ('Scheduled'), ('In Progress'), ('Completed'), ('Cancelled'), ('No Show');

CREATE TABLE master_candidate_status (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_candidate_status (name) VALUES ('Applied'), ('Screening'), ('Shortlisted'), ('Interview'), ('Selected'), ('Rejected'), ('Offered'), ('Joined'), ('Withdrawn');

CREATE TABLE master_performance_rating (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO master_performance_rating (name) VALUES ('Outstanding'), ('Exceeds Expectations'), ('Meets Expectations'), ('Needs Improvement'), ('Unsatisfactory');


-- ==============================================================================
-- CORE TABLES
-- ==============================================================================

-- --------------------------------------------------------
-- Roles & Permissions
-- --------------------------------------------------------
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO roles (name, display_name, description) VALUES 
('super_admin', 'Super Admin', 'Full access to all system features'),
('hr_admin', 'HR Admin', 'Administrative access to HR features'),
('hr_executive', 'HR Executive', 'Day-to-day HR operations access'),
('manager', 'Manager', 'Managerial access for team management'),
('employee', 'Employee', 'Basic access for regular employees');

CREATE TABLE permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

-- Insert permissions for modules
INSERT INTO permissions (module, action, display_name) VALUES
-- Employees
('employees', 'view', 'View Employees'), ('employees', 'create', 'Create Employees'), ('employees', 'update', 'Update Employees'), ('employees', 'delete', 'Delete Employees'), ('employees', 'export', 'Export Employees'),
-- Departments
('departments', 'view', 'View Departments'), ('departments', 'create', 'Create Departments'), ('departments', 'update', 'Update Departments'), ('departments', 'delete', 'Delete Departments'),
-- Designations
('designations', 'view', 'View Designations'), ('designations', 'create', 'Create Designations'), ('designations', 'update', 'Update Designations'), ('designations', 'delete', 'Delete Designations'),
-- Attendance
('attendance', 'view', 'View Attendance'), ('attendance', 'create', 'Create Attendance'), ('attendance', 'update', 'Update Attendance'), ('attendance', 'delete', 'Delete Attendance'), ('attendance', 'export', 'Export Attendance'),
-- Leaves
('leaves', 'view', 'View Leaves'), ('leaves', 'create', 'Create Leaves'), ('leaves', 'update', 'Update Leaves'), ('leaves', 'delete', 'Delete Leaves'), ('leaves', 'approve', 'Approve Leaves'),
-- Payroll
('payroll', 'view', 'View Payroll'), ('payroll', 'create', 'Create Payroll'), ('payroll', 'update', 'Update Payroll'), ('payroll', 'delete', 'Delete Payroll'), ('payroll', 'approve', 'Approve Payroll'), ('payroll', 'export', 'Export Payroll'),
-- Recruitment
('recruitment', 'view', 'View Recruitment'), ('recruitment', 'create', 'Create Recruitment'), ('recruitment', 'update', 'Update Recruitment'), ('recruitment', 'delete', 'Delete Recruitment'),
-- Documents
('documents', 'view', 'View Documents'), ('documents', 'create', 'Create Documents'), ('documents', 'update', 'Update Documents'), ('documents', 'delete', 'Delete Documents'), ('documents', 'approve', 'Verify Documents'),
-- Performance
('performance', 'view', 'View Performance'), ('performance', 'create', 'Create Performance'), ('performance', 'update', 'Update Performance'), ('performance', 'delete', 'Delete Performance'), ('performance', 'approve', 'Approve Performance'),
-- Assets
('assets', 'view', 'View Assets'), ('assets', 'create', 'Create Assets'), ('assets', 'update', 'Update Assets'), ('assets', 'delete', 'Delete Assets'),
-- Notices
('notices', 'view', 'View Notices'), ('notices', 'create', 'Create Notices'), ('notices', 'update', 'Update Notices'), ('notices', 'delete', 'Delete Notices'),
-- Reports
('reports', 'view', 'View Reports'), ('reports', 'export', 'Export Reports'),
-- Users
('users', 'view', 'View Users'), ('users', 'create', 'Create Users'), ('users', 'update', 'Update Users'), ('users', 'delete', 'Delete Users');

CREATE TABLE role_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    UNIQUE(role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Assign all permissions to super_admin (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;


-- --------------------------------------------------------
-- Users (Must be created before employees referencing them and vice versa; wait, we'll alter table later or make references nullable)
-- --------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NULL, -- Will add FK later if employees table created later
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_active TINYINT DEFAULT 1,
    last_login DATETIME NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires DATETIME NULL,
    login_attempts INT DEFAULT 0,
    locked_until DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Departments & Designations
-- --------------------------------------------------------
CREATE TABLE departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT NULL,
    head_employee_id INT NULL,
    parent_department_id INT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO departments (name, code, description) VALUES
('Human Resources', 'HR', 'Human Resources Department'),
('Engineering', 'ENG', 'Engineering Department'),
('Marketing', 'MKT', 'Marketing Department'),
('Sales', 'SLS', 'Sales Department'),
('Finance', 'FIN', 'Finance Department'),
('Operations', 'OPS', 'Operations Department'),
('IT', 'IT', 'Information Technology Department'),
('Admin', 'ADM', 'Administration Department');

CREATE TABLE designations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL UNIQUE,
    level INT DEFAULT 0,
    department_id INT NULL,
    description TEXT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

INSERT INTO designations (title, level, department_id) VALUES
('CEO', 1, NULL),
('CTO', 2, (SELECT id FROM departments WHERE code='ENG')),
('VP', 3, NULL),
('Director', 4, NULL),
('Senior Manager', 5, NULL),
('Manager', 6, NULL),
('Team Lead', 7, NULL),
('Senior Engineer', 8, (SELECT id FROM departments WHERE code='ENG')),
('Engineer', 9, (SELECT id FROM departments WHERE code='ENG')),
('Junior Engineer', 10, (SELECT id FROM departments WHERE code='ENG')),
('HR Manager', 6, (SELECT id FROM departments WHERE code='HR')),
('HR Executive', 8, (SELECT id FROM departments WHERE code='HR')),
('Intern', 11, NULL);

-- --------------------------------------------------------
-- Employees
-- --------------------------------------------------------
CREATE TABLE employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20) NULL,
    date_of_birth DATE NOT NULL,
    gender_id INT NOT NULL,
    blood_group_id INT NULL,
    marital_status_id INT NULL,
    nationality VARCHAR(100) DEFAULT 'Indian',
    photo VARCHAR(255) NULL,
    current_address TEXT NOT NULL,
    permanent_address TEXT NULL,
    department_id INT NOT NULL,
    designation_id INT NOT NULL,
    reporting_manager_id INT NULL,
    employment_type_id INT NOT NULL,
    joining_date DATE NOT NULL,
    confirmation_date DATE NULL,
    resignation_date DATE NULL,
    last_working_date DATE NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (gender_id) REFERENCES master_gender(id) ON DELETE RESTRICT,
    FOREIGN KEY (blood_group_id) REFERENCES master_blood_group(id) ON DELETE SET NULL,
    FOREIGN KEY (marital_status_id) REFERENCES master_marital_status(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE RESTRICT,
    FOREIGN KEY (reporting_manager_id) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (employment_type_id) REFERENCES master_employment_type(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Add FK references that had circular dependencies
ALTER TABLE users ADD CONSTRAINT fk_user_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE departments ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_employee_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE INDEX idx_emp_dept ON employees(department_id);
CREATE INDEX idx_emp_status ON employees(is_active, is_deleted);


-- --------------------------------------------------------
-- Employee Details
-- --------------------------------------------------------
CREATE TABLE employee_bank_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(30) NOT NULL,
    ifsc_code VARCHAR(15) NOT NULL,
    branch_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) DEFAULT 'Savings',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE employee_emergency_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alternate_phone VARCHAR(20) NULL,
    address TEXT NULL,
    is_primary TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE salary_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL UNIQUE,
    basic_salary DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) DEFAULT 0,
    da DECIMAL(12,2) DEFAULT 0,
    transport_allowance DECIMAL(12,2) DEFAULT 0,
    medical_allowance DECIMAL(12,2) DEFAULT 0,
    special_allowance DECIMAL(12,2) DEFAULT 0,
    pf_employee DECIMAL(12,2) DEFAULT 0,
    pf_employer DECIMAL(12,2) DEFAULT 0,
    professional_tax DECIMAL(12,2) DEFAULT 0,
    tds DECIMAL(12,2) DEFAULT 0,
    esi DECIMAL(12,2) DEFAULT 0,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + transport_allowance + medical_allowance + special_allowance) STORED,
    net_salary DECIMAL(12,2) GENERATED ALWAYS AS (basic_salary + hra + da + transport_allowance + medical_allowance + special_allowance - pf_employee - professional_tax - tds - esi - other_deductions) STORED,
    effective_from DATE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------
-- Attendance & Leaves
-- --------------------------------------------------------
CREATE TABLE attendance_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    office_start_time TIME DEFAULT '09:00:00',
    office_end_time TIME DEFAULT '18:00:00',
    late_threshold_minutes INT DEFAULT 15,
    half_day_hours DECIMAL(4,2) DEFAULT 4.00,
    full_day_hours DECIMAL(4,2) DEFAULT 8.00,
    overtime_threshold_minutes INT DEFAULT 30,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO attendance_settings (office_start_time) VALUES ('09:00:00');

CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME NULL,
    check_out TIME NULL,
    status ENUM('present','absent','half_day','late','on_leave','holiday','weekend') DEFAULT 'absent',
    work_hours DECIMAL(5,2) DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0,
    late_minutes INT DEFAULT 0,
    early_leaving_minutes INT DEFAULT 0,
    remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    UNIQUE(employee_id, date),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_att_date ON attendance(date);

CREATE TABLE leave_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    days_per_year INT NOT NULL,
    is_carry_forward TINYINT DEFAULT 0,
    max_carry_forward_days INT DEFAULT 0,
    is_paid TINYINT DEFAULT 1,
    is_active TINYINT DEFAULT 1,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO leave_types (name, code, days_per_year, is_paid) VALUES
('Casual Leave', 'CL', 12, 1),
('Sick Leave', 'SL', 12, 1),
('Earned Leave', 'EL', 15, 1),
('Maternity Leave', 'ML', 180, 1),
('Paternity Leave', 'PL', 15, 1),
('Compensatory Off', 'COFF', 0, 1),
('Loss of Pay', 'LOP', 0, 0);

CREATE TABLE leave_balances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    year YEAR NOT NULL,
    total_days INT NOT NULL,
    used_days INT DEFAULT 0,
    remaining_days INT GENERATED ALWAYS AS (total_days - used_days) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    UNIQUE(employee_id, leave_type_id, year),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE leave_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending','approved','rejected','cancelled') DEFAULT 'pending',
    applied_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_by INT NULL,
    approved_on DATETIME NULL,
    rejection_reason TEXT NULL,
    attachment VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE RESTRICT,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_leave_status ON leave_requests(status);


-- --------------------------------------------------------
-- Payroll
-- --------------------------------------------------------
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL,
    hra DECIMAL(12,2) NOT NULL,
    da DECIMAL(12,2) NOT NULL,
    transport_allowance DECIMAL(12,2) NOT NULL,
    medical_allowance DECIMAL(12,2) NOT NULL,
    special_allowance DECIMAL(12,2) NOT NULL,
    overtime_pay DECIMAL(12,2) DEFAULT 0,
    bonus DECIMAL(12,2) DEFAULT 0,
    gross_earnings DECIMAL(12,2) NOT NULL,
    pf_employee DECIMAL(12,2) NOT NULL,
    pf_employer DECIMAL(12,2) NOT NULL,
    professional_tax DECIMAL(12,2) NOT NULL,
    tds DECIMAL(12,2) NOT NULL,
    esi DECIMAL(12,2) NOT NULL,
    other_deductions DECIMAL(12,2) DEFAULT 0,
    total_deductions DECIMAL(12,2) NOT NULL,
    net_salary DECIMAL(12,2) NOT NULL,
    payment_status ENUM('pending','processed','paid','hold') DEFAULT 'pending',
    payment_date DATE NULL,
    transaction_reference VARCHAR(100) NULL,
    remarks TEXT NULL,
    generated_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    UNIQUE(employee_id, month, year),
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- --------------------------------------------------------
-- Recruitment
-- --------------------------------------------------------
CREATE TABLE job_openings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    department_id INT NOT NULL,
    designation_id INT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    vacancies INT DEFAULT 1,
    employment_type_id INT NOT NULL,
    location VARCHAR(200) NOT NULL,
    min_experience INT DEFAULT 0,
    max_experience INT NULL,
    min_salary DECIMAL(12,2) NULL,
    max_salary DECIMAL(12,2) NULL,
    status ENUM('draft','open','closed','on_hold') DEFAULT 'draft',
    posted_by INT NULL,
    posted_date DATE NOT NULL,
    closing_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL,
    FOREIGN KEY (employment_type_id) REFERENCES master_employment_type(id) ON DELETE RESTRICT,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    resume VARCHAR(255) NULL,
    current_company VARCHAR(200) NULL,
    current_designation VARCHAR(200) NULL,
    experience_years DECIMAL(4,1) DEFAULT 0,
    current_salary DECIMAL(12,2) NULL,
    expected_salary DECIMAL(12,2) NULL,
    notice_period_days INT DEFAULT 0,
    skills TEXT NULL,
    source VARCHAR(100) NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

CREATE TABLE job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_opening_id INT NOT NULL,
    candidate_id INT NOT NULL,
    applied_date DATE DEFAULT (CURRENT_DATE),
    status_id INT NOT NULL,
    remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    UNIQUE(job_opening_id, candidate_id),
    FOREIGN KEY (job_opening_id) REFERENCES job_openings(id) ON DELETE CASCADE,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES master_candidate_status(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE interviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_application_id INT NOT NULL,
    interviewer_id INT NOT NULL,
    interview_date DATETIME NOT NULL,
    interview_type ENUM('phone','video','in_person','technical','hr') DEFAULT 'in_person',
    status_id INT NOT NULL,
    feedback TEXT NULL,
    rating INT NULL CHECK(rating BETWEEN 1 AND 10),
    location VARCHAR(200) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (status_id) REFERENCES master_interview_status(id) ON DELETE RESTRICT
) ENGINE=InnoDB;


-- --------------------------------------------------------
-- Performance
-- --------------------------------------------------------
CREATE TABLE performance_reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    reviewer_id INT NOT NULL,
    review_period_start DATE NOT NULL,
    review_period_end DATE NOT NULL,
    rating_id INT NULL,
    self_rating INT NULL CHECK(self_rating BETWEEN 1 AND 5),
    manager_rating INT NULL CHECK(manager_rating BETWEEN 1 AND 5),
    self_comments TEXT NULL,
    manager_comments TEXT NULL,
    goals_achieved TEXT NULL,
    areas_of_improvement TEXT NULL,
    training_needs TEXT NULL,
    status ENUM('draft','self_review','manager_review','completed') DEFAULT 'draft',
    completed_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewer_id) REFERENCES employees(id) ON DELETE RESTRICT,
    FOREIGN KEY (rating_id) REFERENCES master_performance_rating(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE performance_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    review_id INT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_date DATE NULL,
    status ENUM('not_started','in_progress','completed','deferred') DEFAULT 'not_started',
    weightage INT DEFAULT 0,
    achievement_percentage INT DEFAULT 0,
    employee_remarks TEXT NULL,
    manager_remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (review_id) REFERENCES performance_reviews(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- --------------------------------------------------------
-- Assets
-- --------------------------------------------------------
CREATE TABLE assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    asset_type_id INT NOT NULL,
    brand VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    serial_number VARCHAR(100) NULL,
    purchase_date DATE NULL,
    purchase_cost DECIMAL(12,2) NULL,
    warranty_expiry DATE NULL,
    `condition` ENUM('new','good','fair','poor','damaged','disposed') DEFAULT 'new',
    status ENUM('available','assigned','in_repair','disposed') DEFAULT 'available',
    specifications TEXT NULL,
    notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (asset_type_id) REFERENCES master_asset_type(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE asset_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    employee_id INT NOT NULL,
    assigned_date DATE NOT NULL,
    assigned_by INT NULL,
    return_date DATE NULL,
    returned_date DATE NULL,
    condition_on_assign ENUM('new','good','fair','poor') DEFAULT 'good',
    condition_on_return ENUM('new','good','fair','poor','damaged') NULL,
    remarks TEXT NULL,
    status ENUM('active','returned','lost','damaged') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- --------------------------------------------------------
-- Documents
-- --------------------------------------------------------
CREATE TABLE documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    document_type_id INT NOT NULL,
    document_number VARCHAR(100) NULL,
    title VARCHAR(200) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INT NULL,
    mime_type VARCHAR(100) NULL,
    expiry_date DATE NULL,
    verified_by INT NULL,
    verified_at DATETIME NULL,
    remarks TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (document_type_id) REFERENCES master_document_type(id) ON DELETE RESTRICT,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;


-- --------------------------------------------------------
-- Notices & Holidays
-- --------------------------------------------------------
CREATE TABLE notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type ENUM('general','important','urgent') DEFAULT 'general',
    target_audience ENUM('all','department','role') DEFAULT 'all',
    target_id INT NULL,
    published_by INT NULL,
    published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (published_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE holidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    type ENUM('national','regional','company','optional') DEFAULT 'company',
    description TEXT NULL,
    year YEAR NOT NULL,
    is_active TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL
) ENGINE=InnoDB;

INSERT INTO holidays (name, date, type, year) VALUES
('Republic Day', '2025-01-26', 'national', 2025),
('Independence Day', '2025-08-15', 'national', 2025),
('Gandhi Jayanti', '2025-10-02', 'national', 2025),
('Diwali', '2025-10-21', 'company', 2025),
('Christmas', '2025-12-25', 'company', 2025),
('Republic Day', '2026-01-26', 'national', 2026),
('Independence Day', '2026-08-15', 'national', 2026),
('Gandhi Jayanti', '2026-10-02', 'national', 2026);


-- --------------------------------------------------------
-- Audit Logs & Notifications
-- --------------------------------------------------------
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    module VARCHAR(50) NOT NULL,
    record_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    reference_module VARCHAR(50) NULL,
    reference_id INT NULL,
    is_read TINYINT DEFAULT 0,
    read_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT DEFAULT 0,
    deleted_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
