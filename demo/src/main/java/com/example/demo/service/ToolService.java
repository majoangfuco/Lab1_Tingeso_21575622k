package com.example.demo.service;

import com.example.demo.entity.InformationToolEntity;
import com.example.demo.entity.RentalEntity;
import com.example.demo.entity.ToolEntity;
import com.example.demo.repository.InformationToolRepository;
import com.example.demo.repository.ToolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// ENDPOINT LOGIC: Manages the lifecycle of physical assets (Create, Repair, Rent, Retire).
@Service
public class ToolService {

    private final ToolRepository toolRepo;
    private final InformationToolRepository infoRepo;
    private final KardexService kardexService;

    @Autowired
    public ToolService(ToolRepository toolRepo,
                       InformationToolRepository infoRepo,
                       KardexService kardexService) {
        this.toolRepo = toolRepo;
        this.infoRepo = infoRepo;
        this.kardexService = kardexService;
    }

    /**
     * ENDPOINT DISCOVERY: Full Inventory Audit.
     */
    public List<ToolEntity> findAll() {
        return toolRepo.findAll();
    }

    /**
     * ENDPOINT ANALYTICS: Inventory Health Check.
     * Why: We separate 'Total' vs 'Available' counts to give the procurement manager
     * a clear picture of stock utilization. If Total=100 but Available=0, they need to buy more.
     * If Total=100 and Available=100, marketing needs to push sales.
     */
    public Map<String, Long> getToolStatistics(Long infoId) {
        Map<String, Long> stats = new HashMap<>();

        // ENDPOINT QUERY: Efficient Database Counting (SQL COUNT(*)).
        long total = toolRepo.countTotalUnitsByInfoId(infoId);
        long available = toolRepo.countAvailableUnitsByInfoId(infoId);

        stats.put("totalUnits", total);
        stats.put("availableUnits", available);

        return stats;
    }

    /**
     * ENDPOINT ACTION: Asset Provisioning.
     * Creates the physical item and immediately logs its "Birth" in the history books (Kardex).
     */
    @Transactional
    public ToolEntity createTool(ToolEntity tool, Long informationToolId) {
        // 1. Dependency Validation
        InformationToolEntity infoTool = infoRepo.findById(informationToolId)
                .orElseThrow(() -> new RuntimeException("No se a encontrado la información asocida a la herramienta bajo el código : " + informationToolId));

        // 2. Uniqueness Constraint
        if (tool.getToolCode() != null && toolRepo.findByToolCode(tool.getToolCode()).isPresent()) {
                throw new RuntimeException("Ya existe una herramienta bajo el código " + tool.getToolCode());
        }

        tool.setInformationTool(infoTool);

        // 3. Default State (Ready for use)
        if (tool.getToolStatus() == null) {
            tool.setToolStatus(0);
        }

        ToolEntity savedTool = toolRepo.save(tool);

        // 4. Audit Log: "Initial Registration"
        kardexService.createKardex(0, savedTool, null);

        return savedTool;
    }

    public List<ToolEntity> getToolsByIdInfoTool(Long idInfoTool) {
        // ENDPOINT CONTEXT: Filter inventory by category/type.
        return toolRepo.findByInformationToolIdInformationTool(idInfoTool);
    }

    /**
     * ENDPOINT MODIFICATION: Status Override.
     * Handles manual interventions like sending to repair or scrapping.
     */
    @Transactional
    public ToolEntity updateTool(Long toolId, ToolEntity toolDetails) {
        ToolEntity existingTool = toolRepo.findById(toolId)
                .orElseThrow(() -> new RuntimeException("No se a encontrado le herramienta bajo el código: " + toolId));

        // State Transition Logic
        if (toolDetails.getRental() != null) {
            existingTool.setRental(toolDetails.getRental());
        }

        // Special Case: "Decommissioning" (Scrap).
        // Why: This destroys company value/assets. Only an Admin is trusted to make this financial decision.
        if (toolDetails.getToolStatus() == 3) {
            validateAdminRole();
            if (existingTool.getToolStatus() != 3) {
                kardexService.createKardex(2, existingTool, null); // Log "Decommissioned" event
            }
        }

        // Special Case: "Repair".
        if(toolDetails.getToolStatus() == 2) {
            kardexService.createKardex(3, existingTool, null); // Log "Repair" event
        }

        // Standard Status Update
        if (toolDetails.getToolStatus() != null && existingTool.getToolStatus() != 3) {
            existingTool.setToolStatus(toolDetails.getToolStatus());
        }

        return toolRepo.save(existingTool);
    }

    /**
     * ENDPOINT SECURITY: Manual Role Check.
     * Why: Used inside service methods where standard @PreAuthorize annotation might be insufficient
     * or when we need to enforce checks deep inside business logic.
     */
    private void validateAdminRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(r -> r.getAuthority().equalsIgnoreCase("Admin") ||
                        r.getAuthority().equalsIgnoreCase("ROLE_Admin"));

        if (!isAdmin) {
            throw new AccessDeniedException("Access Denied: Only administrators can perform this action.");
        }
    }

    /**
     * ENDPOINT LOGIC: Lock Inventory.
     * Called when a rental contract is signed.
     */
    @Transactional
    public void rentTool(RentalEntity rental, ToolEntity tool) {
        // Why: Race Condition Protection.
        // Even if the UI showed "Available", another user might have rented it 1 millisecond ago.
        // We verify the status again right before writing to disk.
        if (tool.getToolStatus() != 0) {
            throw new RuntimeException("La herramienta " + tool.getToolCode() + " no está habilitada para ser rentada. La herramienta se encuentra: " + tool.getToolStatus());
        }

        tool.setToolStatus(1); // Locked / Rented
        tool.setRental(rental);
        toolRepo.save(tool);

        kardexService.createKardex(4, tool, rental);
    }

    // --- FINANCIAL CALCULATOR ENGINE ---

    private int getRentPrice(LocalDateTime startDate, LocalDateTime endDate, ToolEntity tool) {
        long days = ChronoUnit.DAYS.between(startDate, endDate);
        // Why: Business Rule. Minimum charge is 1 day, even for 1-hour rentals.
        if (days == 0) days = 1;

        int dailyPrice = tool.getInformationTool().getRentPrice();
        return (int) (days * dailyPrice);
    }

    private int getMultPrice(LocalDateTime endDate, ToolEntity tool) {
        LocalDateTime now = LocalDateTime.now();

        // Why: Penalty Calculation.
        // If 'Now' is after 'Expected Return Date', we calculate the gap in days
        // and apply the punitive 'DuePrice' rate instead of the standard rate.
        if (endDate.isBefore(now)) {
            long days = ChronoUnit.DAYS.between(endDate, now);
            int dailyMult = tool.getInformationTool().getDuePrice();
            return (int) (days * dailyMult);
        }
        return 0;
    }

    /**
     * ENDPOINT LOGIC: Final Bill Generation.
     * Why: This function aggregates all costs: Base Rent + Late Fees + Damages + Extra Charges.
     */
    public int debtForToolReturn(RentalEntity rental, ToolEntity tool, Integer amountExtraDue, int statusReturned, boolean amountAdd) {
        int rentCost = getRentPrice(rental.getRentalDate(), rental.getReturnDate(), tool);
        int fineCost = getMultPrice(rental.getReturnDate(), tool);

        int totalDue = rentCost + fineCost;

        // Why: Asset Replacement Clause. If the tool comes back destroyed (Status 3),
        // the client buys it. We add the full replacement cost to the bill.
        if (statusReturned == 3) {
            totalDue += tool.getInformationTool().getRepositionPrice();
        }

        // Why: One-Time Fee logic. 'amountAdd' boolean ensures that contract-level fees (like delivery)
        // are added only once to the total, not repeated for every single tool in the list.
        if (amountExtraDue != null && amountExtraDue > 0 && amountAdd) {
            validateAdminRole();
            totalDue += amountExtraDue;
        }

        return totalDue;
    }

    // --- List Helpers ---

    public List<ToolEntity> addToTheRentList(List<ToolEntity> list, ToolEntity tool) {
        for(ToolEntity toolInList : list) {
            // Why: Anti-Hoarding Rule. Prevents adding duplicates of the same type to a single cart.
            if(toolInList.getInformationTool().getIdInformationTool().equals(tool.getInformationTool().getIdInformationTool())) {
                return list;
            }
        }
        list.add(tool);
        return list;
    }

    public boolean removeFromTheRentList(List<ToolEntity> list, ToolEntity tool) {
        return list.remove(tool);
    }
}