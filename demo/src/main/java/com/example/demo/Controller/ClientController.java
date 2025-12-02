package com.example.demo.Controller;

import com.example.demo.Entity.ClientEntity;
import com.example.demo.Service.ClientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
// ENDPOINT ROUTING: Defines the base URL path for all resources handled by this class.
@RequestMapping("/api/toolrent/client")
// Why: We explicitly allow Cross-Origin requests from specific frontend origins (Port 80, 3000)
// to bypass browser security restrictions during development and production.
@CrossOrigin(origins = {"http://localhost", "http://localhost:3000", "http://localhost:80"})
public class ClientController {

    @Autowired
    private ClientService clientService;

    /**
     * ENDPOINT DISCOVERY: Retrieves the client directory.
     * Supports hybrid filtering: Database search + In-Memory filtering.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<ClientEntity>> getAll(
            @RequestParam(required = false) String keyword,
            // Why: We accept 'status' as an optional Boolean to allow the frontend to request
            // specifically "Active" or "Blocked" clients without creating a separate endpoint.
            @RequestParam(required = false) Boolean status
    ) {
        // 1. Database Layer: We let the SQL query handle the text search (Keyword)
        // because searching text in large datasets is expensive to do in Java memory.
        List<ClientEntity> clients = clientService.getClients(keyword);

        // 2. Application Layer: We filter by 'Status' in-memory using Java Streams.
        // Why: Since the result set from step 1 is likely small (paginated or specific),
        // it is faster and cleaner to filter the boolean flag here than to create
        // multiple complex query permutations in the Repository.
        if (status != null) {
            clients = clients.stream()
                    .filter(c -> status.equals(c.getClientStatus()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(clients);
    }


    /**
     * ENDPOINT DATA: Fetches detailed context for a single client using their unique ID (RUT).
     */
    @GetMapping("/{rut}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> getByRut(@PathVariable String rut) {
        ClientEntity client = clientService.findByRut(rut);
        // Why: Standard HTTP 404 response. If the resource doesn't exist, we must inform
        // the client explicitly rather than returning a null body or 200 OK with empty data.
        if (client == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(client);
    }

    /**
     * ENDPOINT CREATION: Onboards a new client into the system.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> create(@RequestBody ClientEntity client) {
        try {
            ClientEntity newClient = clientService.createClient(client);
            return ResponseEntity.ok(newClient);
        } catch (RuntimeException e) {
            // Why: Exception Interception. The Service layer throws a RuntimeException if business rules fail
            // (e.g., "RUT already exists"). We catch it here to convert a potential 500 Server Error
            // into a controlled 400 Bad Request with a readable JSON error message for the frontend.
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * ENDPOINT MODIFICATION: Updates static data (Phone, Email) for an existing client.
     */
    @PutMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> update(@RequestBody ClientEntity client) {
        try {
            ClientEntity updatedClient = clientService.updateClient(client);
            return ResponseEntity.ok(updatedClient);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * ENDPOINT REPORT: Specialized query to identify risk.
     * Why: This separates the operational logic (Show me all clients) from the risk logic (Show me debtors),
     * allowing the frontend to build a dedicated "Risk Dashboard" without filtering data manually.
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<ClientEntity>> getOverdueClients() {
        return ResponseEntity.ok(clientService.getClientsWithOverdueRentals());
    }

    /**
     * ENDPOINT LOGIC: Manually triggers the business rule engine.
     * Why: Useful for edge cases where the automatic status update failed or when an admin
     * overrides a block manually and wants to re-validate the client's standing immediately.
     */
    @PostMapping("/{rut}/verify")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> verifyClientStatus(@PathVariable String rut) {
        ClientEntity client = clientService.findByRut(rut);
        if (client == null) {
            return ResponseEntity.notFound().build();
        }

        // Why: Side Effect. This method doesn't just calculate; it mutates the database state
        // (sets ClientStatus = false) if the client has debts.
        clientService.verifiedState(client);

        return ResponseEntity.ok("{\"message\": \"Client status verified and updated.\"}");
    }

    /**
     * ENDPOINT TRANSACTION: Processes a financial payment to reduce debt.
     */
    @PostMapping("/{rut}/pay")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> payDebt(@PathVariable String rut, @RequestBody Map<String, Integer> payload) {
        try {
            // Why: Validation. We check the payload structure manually here because we are using a raw Map
            // instead of a DTO class. Using a Map is a shortcut for simple endpoints with 1 field.
            if (!payload.containsKey("amount")) {
                return ResponseEntity.badRequest().body("{\"error\": \"Debe enviar el campo 'amount'.\"}");
            }

            Integer amount = payload.get("amount");
            ClientEntity updatedClient = clientService.processPayment(rut, amount);

            return ResponseEntity.ok(updatedClient);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("{\"error\": \"Error interno al procesar el pago.\"}");
        }
    }
}