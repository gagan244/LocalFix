-- Sample Initial Data for LocalFix

-- Default Owner User (username: owner, password: password123)
INSERT INTO users (username, password, full_name, role) 
VALUES ('owner', 'password123', 'Shop Manager', 'OWNER')
ON DUPLICATE KEY UPDATE id=id;

-- Initial Technicians
INSERT INTO technicians (name, phone, specialty, status, hourly_rate) VALUES
('Ramesh Kumar', '9876543210', 'Laptop & Computer Repair', 'AVAILABLE', 45.00),
('Anita Sharma', '9876543211', 'Smartphone & Tablet Repair', 'AVAILABLE', 40.00),
('Vikram Singh', '9876543212', 'AC & Refrigerator Repair', 'AVAILABLE', 55.00),
('Suresh Verma', '9876543213', 'Washing Machine & Appliances', 'AVAILABLE', 50.00);

-- Initial Service Requests
INSERT INTO service_requests (request_id, customer_name, customer_phone, customer_email, service_address, device_type, brand_model, problem_description, priority, status, technician_id, estimated_cost, actual_cost, resolution_notes) VALUES
('REQ-1001', 'Rahul Verma', '9811223344', 'rahul@example.com', 'Flat 402, Sunshine Apts, Sector 14', 'Laptop', 'Dell Inspiron 15', 'Screen flickering and battery draining fast within 20 minutes.', 'HIGH', 'IN_PROGRESS', 1, 65.00, NULL, 'Replacement battery ordered. Display connector reseated.'),
('REQ-1002', 'Priya Patel', '9822334455', 'priya@example.com', 'House 12, Green Park', 'Smartphone', 'Samsung Galaxy S21', 'Charging port loose, device only charges when cable is held at an angle.', 'MEDIUM', 'ASSIGNED', 2, 35.00, NULL, 'Assigned to Anita Sharma for USB-C dock flex cable replacement.'),
('REQ-1003', 'Amit Joshi', '9833445566', 'amit@example.com', 'Shop 5, Main Market', 'AC', 'Voltas 1.5 Ton Split AC', 'Compressor starting with humming sound but no cold air blowing.', 'EMERGENCY', 'PENDING', NULL, 80.00, NULL, 'Pending technician assignment. High priority cooling issue.'),
('REQ-1004', 'Sunita Reddy', '9844556677', 'sunita@example.com', 'B-104, Royal Palms', 'Washing Machine', 'LG Front Load 7kg', 'Drum not spinning during rinse cycle, showing error code dE.', 'LOW', 'COMPLETED', 4, 50.00, 48.00, 'Replaced door safety lock switch and tested 2 complete rinse & spin cycles.');
