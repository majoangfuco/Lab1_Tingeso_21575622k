package com.example.demo.controller;

import com.example.demo.entity.InformationToolEntity;
import com.example.demo.service.InformationToolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
// ENDPOINT ROUTING: Defines the base path for "Catalog Definitions" (Abstract tools like 'Drill', not physical items).
@RequestMapping("/api/toolrent/information-tool")
// Why: Security Whitelist. Explicitly permits the React frontend to make requests
// from specific ports, bypassing the browser's Same-Origin Policy.
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"},
        allowCredentials = "true",
        maxAge = 3600)
public class InformationToolController {

    @Autowired
    private InformationToolService infoService;

    // ENDPOINT DISCOVERY: Serves the searchable catalog.
    // Why: Using an optional request param allows this single method to handle both
    // "Show me everything" and "Show me drills" scenarios efficiently.
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<InformationToolEntity>> getAll(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(infoService.getInfoTools(keyword));
    }

    // ENDPOINT REFERENCE: Dedicated endpoint for Dropdowns/Selects.
    // Why: Separation of concerns. While the method above handles searching,
    // this specific endpoint guarantees a full, unfiltered list for UI components (like Category Selectors).
    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public  ResponseEntity<List<InformationToolEntity>> getAll() {
        return ResponseEntity.ok(infoService.getAll());
    }

    // ENDPOINT CONTEXT: Retrieves details for a specific Tool Definition.
    @GetMapping("/{infoId}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> getInfoTool(@PathVariable Long infoId) {
        InformationToolEntity tool = infoService.getInfoToolById(infoId);
        // Why: Standard HTTP Protocol. If the ID doesn't exist, we must return 404 (Not Found)
        // rather than 200 OK with null, so the frontend knows to show an error page.
        if (tool == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(tool);
    }

    // ENDPOINT ADMINISTRATION: Master Data Creation.
    // Why: Strictly restricted to 'Admin' (via @PreAuthorize) because defining new tool types
    // affects global pricing and inventory structure. Regular employees consume this data; they don't define it.
    @PostMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> create(@RequestBody InformationToolEntity info) {
        try {
            return ResponseEntity.ok(infoService.createInfoTool(info));
        } catch (RuntimeException e) {
            // Why: Error Translation. The Service layer throws Java Exceptions (e.g. "Name already exists").
            // The Controller catches them and converts them into HTTP 400 (Bad Request) JSON responses
            // that the React frontend can display as alerts.
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    // ENDPOINT MODIFICATION: Updates existing definitions (e.g., Changing prices).
    @PutMapping
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateInfoTool(@RequestBody InformationToolEntity informationToolEntity) {
        try {
            InformationToolEntity updatedInfoTool = infoService.updateInfoTool(informationToolEntity);

            if (updatedInfoTool == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updatedInfoTool);

        } catch (RuntimeException e) {
            // Why: Consistent Error Handling. Ensures the API behaves predictably
            // regardless of whether we are creating or updating data.
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}