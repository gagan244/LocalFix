package com.localfix.service;

import com.localfix.model.Technician;
import com.localfix.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TechnicianService {

    @Autowired
    private TechnicianRepository technicianRepository;

    public List<Technician> getAllTechnicians() {
        return technicianRepository.findAll();
    }

    public List<Technician> getAvailableTechnicians() {
        return technicianRepository.findByStatus("AVAILABLE");
    }

    public Optional<Technician> getTechnicianById(Long id) {
        return technicianRepository.findById(id);
    }

    public Technician saveTechnician(Technician technician) {
        return technicianRepository.save(technician);
    }

    public void updateTechnicianStatus(Long id, String status) {
        technicianRepository.findById(id).ifPresent(tech -> {
            tech.setStatus(status);
            technicianRepository.save(tech);
        });
    }
}
