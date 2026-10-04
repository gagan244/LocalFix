package com.localfix.controller;

import com.localfix.model.ServiceRequest;
import com.localfix.service.ServiceRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Optional;

@Controller
public class CustomerController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    /**
     * Home Page
     */
    @GetMapping("/")
    public String home() {
        return "index";
    }

    /**
     * Form to create a new service request
     */
    @GetMapping("/create-request")
    public String showCreateRequestForm(Model model) {
        if (!model.containsAttribute("serviceRequest")) {
            model.addAttribute("serviceRequest", new ServiceRequest());
        }
        return "create-request";
    }

    /**
     * Process new service request submission
     */
    @PostMapping("/create-request")
    public String submitServiceRequest(
            @Valid @ModelAttribute("serviceRequest") ServiceRequest serviceRequest,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {

        if (bindingResult.hasErrors()) {
            return "create-request";
        }

        ServiceRequest savedRequest = serviceRequestService.createRequest(serviceRequest);
        redirectAttributes.addFlashAttribute("successMessage", 
                "Service Request created successfully! Your Tracking ID is: " + savedRequest.getRequestId());
        redirectAttributes.addFlashAttribute("newRequestId", savedRequest.getRequestId());

        return "redirect:/track?id=" + savedRequest.getRequestId();
    }

    /**
     * Track status by Request ID
     */
    @GetMapping("/track")
    public String trackStatus(@RequestParam(value = "id", required = false) String id, Model model) {
        if (id != null && !id.trim().isEmpty()) {
            Optional<ServiceRequest> requestOpt = serviceRequestService.getRequestByTrackingId(id.trim());
            if (requestOpt.isPresent()) {
                model.addAttribute("foundRequest", requestOpt.get());
            } else {
                model.addAttribute("errorMessage", "No request found for ID: " + id);
            }
            model.addAttribute("searchId", id);
        }
        return "track-request";
    }
}
