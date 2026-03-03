package com.example.demo.controller;

import com.example.demo.entity.KardexEntity;
import com.example.demo.entity.ToolEntity;
import com.example.demo.service.KardexService;
import com.example.demo.repository.ToolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
// ENDPOINT ROUTING: Defines the base URL for the inventory tracking system (Kardex).
@RequestMapping("/api/toolrent/kardex")
// Why: Security Whitelist. We allow the frontend (running on different ports)
// to fetch these reports without triggering Cross-Origin Resource Sharing (CORS) blocks.
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"},
        allowCredentials = "true",
        maxAge = 3600)
public class KardexController {

    @Autowired
    private KardexService kardexService;

    @Autowired
    // Why: Direct Repository Injection. Ideally, this should be wrapped in a Service,
    // but we use it here for a quick "Fail Fast" validation to ensure a Tool exists
    // before attempting to generate a complex report for it.
    private ToolRepository toolRepository;

    /**
     * ENDPOINT AUDIT: Dumps the entire history log.
     * Why: Useful for 'Super Admin' auditing or data export, but potentially heavy performance-wise.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<KardexEntity>> getAll() {
        return ResponseEntity.ok(kardexService.findAll());
    }

    /**
     * ENDPOINT DETAILS: Retrieves the physical items associated with a specific transaction.
     * Why: When viewing a Rental Receipt, the user needs to know exactly WHICH drill (ID 123)
     * was taken, not just that "a drill" was taken.
     */
    @GetMapping("/rental/{idRental}/tools")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<ToolEntity>> getToolsByRental(@PathVariable Long idRental) {
        return ResponseEntity.ok(kardexService.getToolsByRental(idRental));
    }

    /**
     * ENDPOINT LOGS: Fetches the timeline of events for a specific rental.
     * Why: This provides the "Story" of the transaction (Created -> Delivered -> Returned).
     */
    @GetMapping("/rental/{idRental}/history")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<KardexEntity>> getKardexByRental(@PathVariable Long idRental) {
        return ResponseEntity.ok(kardexService.findKardexByRental(idRental));
    }

    /**
     * ENDPOINT FILTER: Specific Tool History.
     * Example URL: /api/toolrent/kardex/filter?startDate=...&toolId=5
     */
    @GetMapping("/filter")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> getKardexByFilter(
            // Why: ISO Standardization. We force the frontend to send dates in a strict format (YYYY-MM-DDTHH:MM:SS)
            // so the server doesn't misinterpret "10/02" as October 2nd vs February 10th.
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam Long toolId
    ) {
        // 1. Validation Logic: We check if the tool exists *before* asking the service to process the date range.
        // This saves processing power on invalid requests.
        ToolEntity tool = toolRepository.findById(toolId).orElse(null);

        if (tool == null) {
            return ResponseEntity.badRequest().body("Error: Tool not found with ID: " + toolId);
        }

        // 2. Service Delegation: Once validated, we let the service handle the business logic.
        List<KardexEntity> result = kardexService.findKardexByDateRangeAndTool(startDate, endDate, tool);

        return ResponseEntity.ok(result);
    }

    /**
     * ENDPOINT REPORT: Main Search Engine.
     * Why: Supports filtering by Date Range AND optionally by "Tool Type" (InfoId).
     * This allows answering questions like "Show me all movements for DRILLS in January".
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<KardexEntity>> searchKardex(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            // Why: Optional Parameter. If null, the service returns EVERYTHING for that date range.
            @RequestParam(required = false) Long infoId
    ) {
        return ResponseEntity.ok(kardexService.getKardexReport(startDate, endDate, infoId));
    }

    /**
     * ENDPOINT ANALYTICS: "Top Used Tools".
     * Why: We return a List of Maps (Key-Value pairs) instead of a specific Java Entity class.
     * This is a "Lightweight DTO" approach, useful for read-only statistics where creating a
     * full Java class just to hold "Tool Name" and "Count" is unnecessary overhead.
     */
    @GetMapping("/ranking")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<Map<String, Object>>> getRanking(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ResponseEntity.ok(kardexService.getToolRanking(startDate, endDate));
    }
}