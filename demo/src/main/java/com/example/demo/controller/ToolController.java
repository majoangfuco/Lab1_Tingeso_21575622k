package com.example.demo.controller;

import com.example.demo.entity.ToolEntity;
import com.example.demo.service.ToolService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
// ENDPOINT ROUTING: Manages the lifecycle of "Physical Assets" (The actual items in the warehouse),
// distinct from the "Catalog Definitions" handled by InformationToolController.
@RequestMapping("/api/toolrent/tool")
// Why: We whitelist specific origins to prevent CORS errors when the React frontend
// tries to fetch data from a different port (5173 vs 8090).
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"},
        allowCredentials = "true",
        maxAge = 3600)
public class ToolController {

    @Autowired
    private ToolService toolService;

    /**
     * ENDPOINT DISCOVERY: Inventory Audit.
     * Why: Returns the complete list of every physical object owned by the company.
     * Essential for stocktaking and global availability checks.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<ToolEntity>> getAllTools() {
        return ResponseEntity.ok(toolService.findAll());
    }

    /**
     * ENDPOINT CREATION: Asset Tagging.
     * Why: We bind the new physical item to a parent Definition ID (infoId) immediately.
     * An item cannot exist in isolation; it must be an instance of a specific "Type" (e.g., this is a Drill).
     */
    @PostMapping("/{infoId}")
    // ENDPOINT SECURITY: Restricted to Admins.
    // Creating new assets implies financial investment and inventory expansion,
    // a responsibility usually above the pay grade of a regular counter employee.
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<?> createTool(@RequestBody ToolEntity tool, @PathVariable Long infoId) {
        try {
            ToolEntity createdTool = toolService.createTool(tool, infoId);
            return ResponseEntity.ok(createdTool);
        } catch (RuntimeException e) {
            // Why: User Feedback. If the barcode is duplicate or the type doesn't exist,
            // we catch the exception and return a readable error message instead of a generic 500 crash.
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }

    /**
     * ENDPOINT CONTEXT: Filter by Type.
     * Why: When a user selects "Drills" in the catalog, they need to see only the physical drills available,
     * not every item in the warehouse. This performs that specific database filtering.
     */
    @GetMapping("/{infoId}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<List<ToolEntity>> getToolsByType(@PathVariable Long infoId) {
        return ResponseEntity.ok(toolService.getToolsByIdInfoTool(infoId));
    }

    /**
     * ENDPOINT ANALYTICS: Real-time Stock Check.
     * Why: Calculating "Available vs Total" on the frontend is risky (pagination might hide items).
     * We let the database count the items efficiently and return just the numbers.
     * Returns: { "totalUnits": 10, "availableUnits": 8 }
     */
    @GetMapping("/stats/{infoId}")
    @PreAuthorize("hasAnyRole('Admin', 'employee')")
    public ResponseEntity<Map<String, Long>> getToolStats(@PathVariable Long infoId) {
        return ResponseEntity.ok(toolService.getToolStatistics(infoId));
    }

    /**
     * ENDPOINT MODIFICATION: Status Override.
     * Why: Allows manual intervention. If a tool breaks or is lost, an Admin needs
     * to pull it out of circulation (change status to 'Maintenance' or 'Retired')
     * without deleting the historical record of its existence.
     */
    @PutMapping("/{toolId}")
    @PreAuthorize("hasRole('Admin')")
    public ResponseEntity<?> updateToolStatus(@PathVariable Long toolId, @RequestBody ToolEntity toolDetails) {
        try {
            ToolEntity updatedTool = toolService.updateTool(toolId, toolDetails);
            return ResponseEntity.ok(updatedTool);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}