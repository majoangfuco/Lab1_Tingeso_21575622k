package com.example.demo.Repository;

import com.example.demo.Entity.KardexEntity;
import com.example.demo.Entity.ToolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface KardexRepository extends JpaRepository<KardexEntity, Long> {

    // ENDPOINT DATA: Reverse Lookup.
    // Why: The Rental Entity knows *who* rented, but the Kardex knows *exactly what* was rented.
    // We navigate from the Log Entry -> Tool to reconstruct the packing list for a specific contract.
    @Query("SELECT k.tool FROM KardexEntity k WHERE k.rental.rentalId = :idRental")
    List<ToolEntity> findToolsByRentalId(@Param("idRental") Long idRental);

    // Why: Lifecycle Audit. Counts how many times a specific physical item has moved.
    // High numbers might indicate wear and tear, suggesting the tool needs maintenance soon.
    @Query("SELECT COUNT(k) FROM KardexEntity k WHERE k.tool.toolId = :idTool")
    Integer countKardexEntitiesByTool(@Param("idTool") Long idTool);

    // ENDPOINT AUDIT: Transaction History.
    // Why: Retrieves the timeline of events (Picked up, Returned, Damaged) linked to one rental ID.
    @Query("SELECT k FROM KardexEntity k WHERE k.rental.rentalId = :idRental")
    List<KardexEntity> findKardexByRental(@Param("idRental") Long idRental);

    // Why: Precise Auditing. Allows checking the history of a specific physical asset
    // within a specific time window (e.g., "Where was Drill #5 last week?").
    @Query("SELECT k FROM KardexEntity k WHERE k.tool = :tool AND k.kardexDate BETWEEN :startDate AND :endDate")
    List<KardexEntity> findKardexBetweenAndTool(@Param("startDate") LocalDateTime startDate,
                                                @Param("endDate") LocalDateTime endDate,
                                                @Param("tool") ToolEntity tool);

    /**
     * ENDPOINT ANALYTICS: "Best Sellers" Report.
     * Why: We use a custom aggregation query because JPA repositories cannot automatically
     * map complex "GROUP BY" results into standard Entity classes.
     * We filter by 'Type = 4' (Rentals) to ignore internal movements like repairs or purchases.
     * Returns a raw array: [InformationToolEntity, Count(Long)]
     */
    @Query("SELECT k.tool.informationTool, COUNT(k) " +
            "FROM KardexEntity k " +
            "WHERE k.kardexType = 4 " +
            "AND k.kardexDate BETWEEN :startDate AND :endDate " +
            "GROUP BY k.tool.informationTool " +
            "ORDER BY COUNT(k) DESC")
    List<Object[]> findRankingRaw(@Param("startDate") LocalDateTime startDate,
                                  @Param("endDate") LocalDateTime endDate);


    /**
     * ENDPOINT REPORT: Flexible Search Engine.
     * Why: The '(:infoId IS NULL OR ...)' pattern is a SQL optimization technique.
     * It allows this single query to handle two scenarios:
     * 1. If infoId is provided: Filter results by that specific Tool Type.
     * 2. If infoId is NULL: Ignore the filter completely and return all records.
     * This avoids writing two separate Java methods for "Search All" vs "Search One".
     */
    @Query("SELECT k FROM KardexEntity k " +
            "WHERE k.kardexDate BETWEEN :startDate AND :endDate " +
            "AND (:infoId IS NULL OR k.tool.informationTool.idInformationTool = :infoId) " +
            "ORDER BY k.kardexDate DESC")
    List<KardexEntity> findKardexByFilters(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("infoId") Long infoId
    );
}