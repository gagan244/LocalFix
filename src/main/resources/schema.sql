-- LocalFix MySQL Database Schema
CREATE DATABASE IF NOT EXISTS localfix_db;
USE localfix_db;

-- 1. Users table (for Owner / Staff login)
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'OWNER'
);

-- 2. Technicians table
CREATE TABLE IF NOT EXISTS technicians (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    hourly_rate DECIMAL(10,2) DEFAULT 50.00
);

-- 3. Service Requests table
CREATE TABLE IF NOT EXISTS service_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(30) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(100),
    service_address VARCHAR(255) NOT NULL,
    device_type VARCHAR(50) NOT NULL,
    brand_model VARCHAR(100) NOT NULL,
    problem_description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    status VARCHAR(20) DEFAULT 'PENDING',
    technician_id BIGINT,
    estimated_cost DECIMAL(10,2) DEFAULT 0.00,
    actual_cost DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolution_notes TEXT,
    FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL
);
