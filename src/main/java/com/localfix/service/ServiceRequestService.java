package com.localfix.service;

import com.localfix.model.RequestStatus;
import com.localfix.model.ServiceRequest;
import com.localfix.model.Technician;
import com.localfix.repository.ServiceRequestRepository;
import com.localfix.repository.TechnicianRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class ServiceRequestService {

    @Autowired
    private ServiceRequestRepository serviceRequestRepository;

    @Autowired
    private TechnicianRepository technicianRepository;

    public List<ServiceRequest> getAllRequests() {
        return serviceRequestRepository.findAllByOrderByCreatedAtDesc();
    }

    public Optional<ServiceRequest> getRequestById(Long id) {
        return serviceRequestRepository.findById(id);
    }

    public Optional<ServiceRequest> getRequestByTrackingId(String trackingId) {
        if (trackingId == null) return Optional.empty();
        return serviceRequestRepository.findByRequestId(trackingId.trim().toUpperCase());
    }

    /**
     * Customer Creates a Service Request
     */
    public ServiceRequest createRequest(ServiceRequest request) {
        // Auto-generate clean tracking ID like REQ-1005
        long count = serviceRequestRepository.count();
        String generatedId = "REQ-" + (1001 + count);
        request.setRequestId(generatedId);
        
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());
        request.setUpdatedAt(LocalDateTime.now());

        // Basic default cost estimate based on device type
        if (request.getEstimatedCost() == null || request.getEstimatedCost() == 0.0) {
            request.setEstimatedCost(calculateInitialEstimate(request.getDeviceType()));
        }

        return serviceRequestRepository.save(request);
    }

    /**
     * Owner Assigns Technician to Request
     */
    public ServiceRequest assignTechnician(Long requestId, Long technicianId) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        if (technicianId != null) {
            Technician technician = technicianRepository.findById(technicianId)
                    .orElseThrow(() -> new RuntimeException("Technician not found"));
            request.setTechnician(technician);
            request.setStatus(RequestStatus.ASSIGNED);
            
            // Mark technician as on job
            technician.setStatus("ON_JOB");
            technicianRepository.save(technician);
        } else {
            request.setTechnician(null);
            request.setStatus(RequestStatus.PENDING);
        }

        request.setUpdatedAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    /**
     * Owner Updates Status & Cost
     */
    public ServiceRequest updateRequestDetails(Long requestId, RequestStatus status, Double estimatedCost, Double actualCost, String notes) {
        ServiceRequest request = serviceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Service request not found"));

        if (status != null) {
            request.setStatus(status);

            // If request completed or cancelled, set technician back to available
            if ((status == RequestStatus.COMPLETED || status == RequestStatus.CANCELLED) && request.getTechnician() != null) {
                Technician tech = request.getTechnician();
                tech.setStatus("AVAILABLE");
                technicianRepository.save(tech);
            }
        }

        if (estimatedCost != null) {
            request.setEstimatedCost(estimatedCost);
        }

        if (actualCost != null) {
            request.setActualCost(actualCost);
        }

        if (notes != null) {
            request.setResolutionNotes(notes);
        }

        request.setUpdatedAt(LocalDateTime.now());
        return serviceRequestRepository.save(request);
    }

    private Double calculateInitialEstimate(String deviceType) {
        if (deviceType == null) return 40.0;
        return switch (deviceType.toLowerCase()) {
            case "laptop" -> 60.0;
            case "smartphone" -> 35.0;
            case "ac", "air conditioner" -> 75.0;
            case "refrigerator" -> 70.0;
            case "washing machine" -> 55.0;
            case "television", "tv" -> 50.0;
            default -> 45.0;
        };
    }
}
