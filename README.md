# LocalFix - Local Service Request Tracker

A simple, practical Java Full Stack application designed for local device repair shops (Laptops, Mobile Phones, ACs, Washing Machines, Refrigerators, etc.) to manage incoming customer service requests, technician assignments, live request tracking, and repair cost estimations.

Built with clean, standard Spring Boot patterns appropriate for a junior developer (~1 year Java experience).

---

## 🛠 Tech Stack

- **Backend:** Java 17, Spring Boot 3.2, Spring MVC, Spring Data JPA (Hibernate)
- **Database:** MySQL (with `schema.sql` and `data.sql` seed scripts)
- **Frontend / Templates:** Thymeleaf & Bootstrap 5 (HTML/CSS)
- **Build & Dependency Tool:** Maven (`pom.xml`)
- **Web Preview:** Node.js / Express proxy runtime for instant browser interaction

---

## 📋 Main Workflows

### 1. Customer Workflow
1. **Submit Request:** Customer enters their contact info, device type (e.g. Laptop, Smartphone, AC), brand & model, problem description, and address.
2. **Get Tracking ID:** The system automatically generates a unique Request ID (e.g. `REQ-1001`).
3. **Track Status:** The customer navigates to the **Track Status** page and enters their Request ID to view live progress (`PENDING` &rarr; `ASSIGNED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`), assigned technician name, estimated repair cost, and completion remarks.

### 2. Shop Owner / Manager Workflow
1. **Login:** Owner logs in via the simple login page (Default credentials: `owner` / `password123`).
2. **Dashboard Table:** View all incoming service requests with search and status filters.
3. **Assign Technician:** Assign an available field technician from the technician roster.
4. **Update Status & Costs:** Change request status (`IN_PROGRESS`, `COMPLETED`), record estimated repair costs, final invoiced amounts, and write resolution notes.

---

## 📁 Project Architecture & Clean Layering

```text
src/main/java/com/localfix/
├── LocalFixApplication.java             # Spring Boot Main Class
├── model/
│   ├── ServiceRequest.java             # JPA Entity for Service Requests
│   ├── Technician.java                 # JPA Entity for Technicians
│   ├── User.java                       # JPA Entity for Owner authentication
│   └── RequestStatus.java              # Enum: PENDING, ASSIGNED, IN_PROGRESS, COMPLETED
├── repository/
│   ├── ServiceRequestRepository.java   # Spring Data JPA Repository
│   ├── TechnicianRepository.java       # Spring Data JPA Repository
│   └── UserRepository.java             # Spring Data JPA Repository
├── service/
│   ├── ServiceRequestService.java      # Core Business Logic & ID generation
│   └── TechnicianService.java          # Technician status and assignment logic
└── controller/
    ├── CustomerController.java         # Spring MVC controller (Thymeleaf forms & tracking)
    ├── OwnerController.java            # Spring MVC controller (Owner dashboard & actions)
    └── ServiceRequestRestController.java # REST API endpoints for integration
```

---

## 🗄️ MySQL Database Setup

1. Run the database schema script:
   ```bash
   mysql -u root -p < src/main/resources/schema.sql
   ```
2. Populate initial test data:
   ```bash
   mysql -u root -p < src/main/resources/data.sql
   ```
3. Update your credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/localfix_db?useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

---

## 🚀 How to Run with Maven

```bash
# Clone the repository
git clone https://github.com/gagan244/LocalFix.git
cd LocalFix

# Build and run the Spring Boot application
mvn spring-boot:run
```

Open your browser at: `http://localhost:8080`
- Customer Portal: `http://localhost:8080/`
- Track Status: `http://localhost:8080/track`
- Owner Dashboard: `http://localhost:8080/owner/login` (Username: `owner`, Password: `password123`)
