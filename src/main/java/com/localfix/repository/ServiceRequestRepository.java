package com.localfix.repository;

import com.localfix.model.RequestStatus;
import com.localfix.model.ServiceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRequestRepository extends JpaRepository<ServiceRequest, Long> {
    
    Optional<ServiceRequest> findByRequestId(String requestId);

    List<ServiceRequest> findByStatus(RequestStatus status);

    List<ServiceRequest> findByCustomerPhone(String customerPhone);

    List<ServiceRequest> findAllByOrderByCreatedAtDesc();
}
