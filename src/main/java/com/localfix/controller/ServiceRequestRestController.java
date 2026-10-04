package com.localfix.controller;

import com.localfix.model.RequestStatus;
import com.localfix.model.ServiceRequest;
import com.localfix.model.Technician;
import com.localfix.service.ServiceRequestService;
import com.localfix.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Spring REST Controller for CRUD operations & API integrations
 */
@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ServiceRequestRestController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private TechnicianService technicianService;

    // GET /api/requests - Get all requests
    @GetMapping("/requests")
    public List<ServiceRequest> getAllRequests() {
        return serviceRequestService.getAllRequests();
    }

    // GET /api/requests/{id} - Get single request by database ID
    @GetMapping("/requests/{id}")
    public ResponseEntity<ServiceRequest> getRequestById(@PathVariable Long id) {
        return serviceRequestService.getRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/requests/track/{trackingId} - Customer tracking API
    @GetMapping("/requests/track/{trackingId}")
    public ResponseEntity<ServiceRequest> getRequestByTrackingId(@PathVariable String trackingId) {
        return serviceRequestService.getRequestByTrackingId(trackingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/requests - Create request
    @PostMapping("/requests")
    public ResponseEntity<ServiceRequest> createRequest(@Valid @RequestBody ServiceRequest serviceRequest) {
        ServiceRequest created = serviceRequestService.createRequest(serviceRequest);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // POST /api/requests/{id}/assign - Assign technician
    @PostMapping("/requests/{id}/assign")
    public ResponseEntity<ServiceRequest> assignTechnician(
            @PathVariable Long id,
            @RequestBody Map<String, Long> payload) {
        Long technicianId = payload.get("technicianId");
        ServiceRequest updated = serviceRequestService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(updated);
    }

    // POST /api/requests/{id}/status - Update status, costs & notes
    @PostMapping("/requests/{id}/status")
    public ResponseEntity<ServiceRequest> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        
        RequestStatus status = payload.containsKey("status") ? 
                RequestStatus.valueOf(payload.get("status").toString()) : null;
        
        Double estimatedCost = payload.get("estimatedCost") != null ? 
                Double.valueOf(payload.get("estimatedCost").toString()) : null;
        
        Double actualCost = payload.get("actualCost") != null ? 
                Double.valueOf(payload.get("actualCost").toString()) : null;
        
        String notes = payload.get("notes") != null ? payload.get("notes").toString() : null;

        ServiceRequest updated = serviceRequestService.updateRequestDetails(id, status, estimatedCost, actualCost, notes);
        return ResponseEntity.ok(updated);
    }

    // GET /api/technicians - List technicians
    @GetMapping("/technicians")
    public List<Technician> getTechnicians() {
        return technicianService.getAllTechnicians();
    }
}
