package com.example.demo.Controller;

import com.example.demo.Entity.RentalEntity;
import com.example.demo.Service.RentalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
// ENDPOINT ROUTING: Centralizes all rental transaction logic under one URL path.
@RequestMapping("/api/toolrent/rental")
// Why: We explicitly whitelist the frontend development ports (3000, 5173 via localhost)
// to prevent browser CORS blocks while rejecting requests from unknown domains.
@CrossOrigin(origins = {"http://localhost", "http://localhost:3000", "http://localhost:80"})
public class RentalController {

    @Autowired
    private RentalService rentalService;

    // ENDPOINT DISCOVERY: Fetches the master ledger of all rentals.
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<RentalEntity>> getAllRentals(){
        return ResponseEntity.ok(rentalService.findAll());
    }

    // ENDPOINT DETAILS: Fetches a single transaction context.
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<RentalEntity> getRentalById(@PathVariable Long id) {
        return ResponseEntity.ok(rentalService.findById(id));
    }

    @GetMapping("/client/{idClient}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<RentalEntity>> getRentalsByClient(@PathVariable Long idClient) {
        // Why: Overloading Logic. We reuse the same service method for both filtered and unfiltered queries.
        // Passing 'null' acts as a wildcard instructing the service to fetch "All statuses".
        return ResponseEntity.ok(rentalService.getRentalsByClient(idClient, null));
    }

    // ENDPOINT FILTER: Specific query for subsets (e.g., only "Active" or "Overdue").
    // Why: We expose a distinct URL structure for filtered views to keep the REST API clean and predictable.
    @GetMapping("/client/{idClient}/status/{status}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<RentalEntity>> getRentalsByClientFiltered(@PathVariable Long idClient, @PathVariable Integer status) {
        return ResponseEntity.ok(rentalService.getRentalsByClient(idClient, status));
    }

    /**
     * ENDPOINT CREATION: Creates a new rental contract.
     * * Why: "Quick & Dirty" DTO approach. Instead of creating a formal Java Class (DTO)
     * to represent the incoming JSON, we accept a raw Map. This speeds up development
     * but requires manual type casting and validation logic inside the controller.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> createRental(@RequestBody Map<String, Object> payload) {
        try {
            // 1. Manual Extraction
            // Why: Since 'payload' is a generic Map<String, Object>, Java loses type safety.
            // We must manually cast objects back to Strings, Lists, etc.
            String clientRut = (String) payload.get("clientRut");

            // Why: JSON arrays are deserialized as generic Lists. We stream and map them
            // to ensure they are strictly Longs (Database IDs), avoiding ClassCastExceptions.
            List<?> rawToolIds = (List<?>) payload.get("toolIds");
            List<Long> toolIds = rawToolIds.stream()
                    .map(id -> ((Number) id).longValue())
                    .collect(Collectors.toList());

            // Why: Date Handling. JavaScript sends ISO-8601 strings. Java requires LocalDateTime objects.
            // We parse them here to ensure the data is valid before hitting the service layer.
            LocalDateTime startDate = LocalDateTime.parse((String) payload.get("startDate"));
            LocalDateTime endDate = LocalDateTime.parse((String) payload.get("endDate"));

            // 2. Service Delegation
            RentalEntity newRental = rentalService.createRental(
                    clientRut,
                    toolIds,
                    startDate,
                    endDate
            );

            return ResponseEntity.ok(newRental);

        } catch (RuntimeException e) {
            // Why: Business Logic Error (e.g., Client not found, Tool out of stock).
            // We translate the internal exception into a readable JSON response for the frontend.
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            e.printStackTrace();
            // Why: System Error (e.g., Database down, parsing failure).
            return ResponseEntity.internalServerError()
                    .body("{\"error\": \"Internal Server Error parsing request: " + e.getMessage() + "\"}");
        }
    }

    /**
     * ENDPOINT TRANSACTION: Closes the rental lifecycle.
     */
    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> returnRental(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            // Why: This is a high-stakes operation involving inventory updates and financial calculations.
            // We delegate the entire logic block to 'finalizeReturn' to maintain ACID properties (Atomicity).
            RentalEntity closedRental = rentalService.finalizeReturn(id, payload);
            return ResponseEntity.ok(closedRental);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("{\"error\": \"Server error processing return\"}");
        }
    }

}