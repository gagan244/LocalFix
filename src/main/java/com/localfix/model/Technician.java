package com.localfix.model;

import jakarta.persistence.*;

/**
 * Technician Entity representing local repair personnel
 */
@Entity
@Table(name = "technicians")
public class Technician {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(nullable = false, length = 100)
    private String specialty;

    @Column(nullable = false, length = 20)
    private String status = "AVAILABLE"; // AVAILABLE, ON_JOB, OFFLINE

    @Column(name = "hourly_rate")
    private Double hourlyRate = 50.00;

    public Technician() {
    }

    public Technician(String name, String phone, String specialty, String status, Double hourlyRate) {
        this.name = name;
        this.phone = phone;
        this.specialty = specialty;
        this.status = status;
        this.hourlyRate = hourlyRate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}
