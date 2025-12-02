package com.example.demo.Service;

import com.example.demo.Entity.KardexEntity;
import com.example.demo.Entity.RentalEntity;
import com.example.demo.Entity.ToolEntity;
import com.example.demo.Repository.KardexRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

// ENDPOINT LOGIC: Service Layer for Inventory Tracking.
// Why: This class acts as the "Central Logger". Any movement of any item (Rental, Return, Repair)
// MUST pass through here to ensure the chain of custody is recorded permanently.
@Service
public class KardexService {

    private final KardexRepository kardexRepo;

    @Autowired
    public KardexService(KardexRepository kardexRepo) {
        this.kardexRepo = kardexRepo;
    }

    /**
     * ENDPOINT AUDIT: Creates the immutable log entry.
     * @param kardexType 0=register, 1=return, 2=decommissioned, 3=reparation, 4=rented
     */
    public KardexEntity createKardex(Integer kardexType, ToolEntity toolEntity, RentalEntity rentalEntity) {
        KardexEntity kardex = new KardexEntity();

        // Why: Timestamps must be generated on the server side (Backend) rather than trusting
        // the client's clock, ensuring chronological integrity across different timezones.
        kardex.setKardexType(kardexType);
        kardex.setKardexDate(LocalDateTime.now());
        kardex.setTool(toolEntity);
        kardex.setRental(rentalEntity);

        // ENDPOINT SECURITY: Context Extraction.
        // Why: This method is often called internally by other services (e.g., RentalService).
        // We reach into the Spring Security Context (The global "Current User" storage)
        // to find out WHO initiated the original HTTP request that triggered this action.
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = "system-auto"; // Default fallback if triggered by a background job

        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            // Why: We prefer the 'preferred_username' from the Keycloak token as it is human-readable,
            // but fallback to the internal ID if necessary.
            if (principal instanceof Jwt) {
                Jwt jwt = (Jwt) principal;
                username = jwt.getClaimAsString("preferred_username");
            } else {
                username = auth.getName();
            }
        }

        kardex.setCreatedByUserId(username);

        return kardexRepo.save(kardex);
    }

    public List<KardexEntity> findAll() {
        return kardexRepo.findAll();
    }

    /**
     * ENDPOINT DATA: Reverse Lookup.
     * Why: Reconstructs the "Packing List" of a rental by querying the movement logs.
     */
    public List<ToolEntity> getToolsByRental(Long idRental) {
        return kardexRepo.findToolsByRentalId(idRental);
    }

    /**
     * Retrieves the full history (Kardex entries) for a specific rental.
     */
    public List<KardexEntity> findKardexByRental(Long idRental) {
        return kardexRepo.findKardexByRental(idRental);
    }

    /**
     * Filters Kardex records by date range and a specific tool.
     * Useful for generating usage reports.
     */
    public List<KardexEntity> findKardexByDateRangeAndTool(LocalDateTime startDate, LocalDateTime endDate, ToolEntity tool) {
        return kardexRepo.findKardexBetweenAndTool(startDate, endDate, tool);
    }

    /**
     * ENDPOINT REPORT: Data Transformation (Adapter Pattern).
     * Why: JPA Aggregation queries return 'Object[]' arrays (index 0, index 1), which are hard to read in JSON.
     * We convert this raw data into a structured 'Map' (key: value) so the React frontend receives
     * a clean, self-describing JSON object.
     */
    public List<Map<String, Object>> getToolRanking(LocalDateTime startDate, LocalDateTime endDate) {
        List<Object[]> rawData = kardexRepo.findRankingRaw(startDate, endDate);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> map = new HashMap<>();
            // Row[0] is the Entity, Row[1] is the Count (Long).
            // We map them to specific string keys for safe consumption by the frontend.
            map.put("tool", row[0]);
            map.put("count", row[1]);
            result.add(map);
        }
        return result;
    }

    public List<KardexEntity> getKardexReport(LocalDateTime startDate, LocalDateTime endDate, Long infoId) {
        // ENDPOINT QUERY: Delegates to the repository's dynamic filtering logic.
        return kardexRepo.findKardexByFilters(startDate, endDate, infoId);
    }
}