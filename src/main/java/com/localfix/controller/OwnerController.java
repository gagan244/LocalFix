package com.localfix.controller;

import com.localfix.model.RequestStatus;
import com.localfix.model.ServiceRequest;
import com.localfix.model.Technician;
import com.localfix.model.User;
import com.localfix.repository.UserRepository;
import com.localfix.service.ServiceRequestService;
import com.localfix.service.TechnicianService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Optional;

@Controller
@RequestMapping("/owner")
public class OwnerController {

    @Autowired
    private ServiceRequestService serviceRequestService;

    @Autowired
    private TechnicianService technicianService;

    @Autowired
    private UserRepository userRepository;

    /**
     * Show Owner Login Page
     */
    @GetMapping("/login")
    public String showLoginForm() {
        return "login";
    }

    /**
     * Process Simple Owner Login
     */
    @PostMapping("/login")
    public String processLogin(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            HttpSession session,
            RedirectAttributes redirectAttributes) {

        // Check against users table or simple fallback
        Optional<User> userOpt = userRepository.findByUsernameAndPassword(username, password);

        if (userOpt.isPresent() || ("owner".equals(username) && "password123".equals(password))) {
            session.setAttribute("loggedInUser", username);
            return "redirect:/owner/dashboard";
        }

        redirectAttributes.addFlashAttribute("errorMessage", "Invalid username or password. (Hint: owner / password123)");
        return "redirect:/owner/login";
    }

    /**
     * Logout
     */
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    /**
     * Owner Dashboard: View and Manage Requests
     */
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        if (session.getAttribute("loggedInUser") == null) {
            return "redirect:/owner/login";
        }

        List<ServiceRequest> requests = serviceRequestService.getAllRequests();
        List<Technician> technicians = technicianService.getAllTechnicians();

        model.addAttribute("requests", requests);
        model.addAttribute("technicians", technicians);
        model.addAttribute("statuses", RequestStatus.values());

        return "owner-dashboard";
    }

    /**
     * Assign Technician to a Request
     */
    @PostMapping("/requests/{id}/assign")
    public String assignTechnician(
            @PathVariable("id") Long id,
            @RequestParam(value = "technicianId", required = false) Long technicianId,
            RedirectAttributes redirectAttributes) {

        serviceRequestService.assignTechnician(id, technicianId);
        redirectAttributes.addFlashAttribute("successMessage", "Technician assignment updated.");
        return "redirect:/owner/dashboard";
    }

    /**
     * Update Status, Cost, Notes
     */
    @PostMapping("/requests/{id}/update")
    public String updateRequest(
            @PathVariable("id") Long id,
            @RequestParam(value = "status", required = false) RequestStatus status,
            @RequestParam(value = "estimatedCost", required = false) Double estimatedCost,
            @RequestParam(value = "actualCost", required = false) Double actualCost,
            @RequestParam(value = "notes", required = false) String notes,
            RedirectAttributes redirectAttributes) {

        serviceRequestService.updateRequestDetails(id, status, estimatedCost, actualCost, notes);
        redirectAttributes.addFlashAttribute("successMessage", "Request status and details updated.");
        return "redirect:/owner/dashboard";
    }
}
