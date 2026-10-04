package com.localfix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main Spring Boot Application Entry Point
 * LocalFix - Simple Local Service Request Tracker
 */
@SpringBootApplication
public class LocalFixApplication {

    public static void main(String[] args) {
        SpringApplication.run(LocalFixApplication.class, args);
        System.out.println("LocalFix Service Request Tracker is running on: http://localhost:8080");
    }
}
