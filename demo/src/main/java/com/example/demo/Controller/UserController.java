package com.example.demo.Controller;

import com.example.demo.Entity.UserEntity;
import com.example.demo.Repository.KardexRepository;
import com.example.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
// ENDPOINT ROUTING: Manages internal system accounts (Employees/Admins).
// Why: Distinct from 'ClientController'. Clients are customers who rent tools;
// Users are staff members who log in to the software to manage those rentals.
@RequestMapping("/api/toolrent/users")
@CrossOrigin(origins = {"http://localhost", "http://localhost:3000", "http://localhost:80"})
public class UserController {

    @Autowired
    private UserService userService;

    // ENDPOINT REGISTRATION: Provisions a new staff account.
    @PostMapping("/register")
    // ENDPOINT SECURITY: Privilege Escalation Prevention.
    // Why: Only an existing Administrator allows new people into the system.
    // If we didn't lock this, anyone could register themselves as an Admin and take over the software.
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> registerUser(@RequestBody UserEntity user) {
        try {
            // 1. Local DB Mirror (Optional)
            // Why: Some architectures keep a local copy of users for foreign key constraints in rentals.
            // userRepo.save(user);

            // 2. EXTERNAL SYNC: The "Source of Truth".
            // Why: We delegate the actual identity creation to Keycloak via API.
            // This ensures the user exists in the Security Server so they can actually log in later.
            userService.createUserInKeycloak(user);

            return ResponseEntity.ok("Usuario creado exitosamente en Keycloak y Base de Datos.");
        } catch (RuntimeException e) {
            // Why: Exception Masking. We catch internal errors (like "Keycloak connection failed" or "Username exists")
            // and return a safe JSON error message to the frontend so the UI can display an alert.
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}