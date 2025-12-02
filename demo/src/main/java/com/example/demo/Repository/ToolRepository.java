package com.example.demo.Repository;

import com.example.demo.Entity.ToolEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

// ENDPOINT DATA ACCESS: Manages physical inventory persistence.
@Repository
public interface ToolRepository extends JpaRepository<ToolEntity,Long> {

    // Why: Business Logic requirement. We need to find a specific item by scanning its barcode/label (toolCode)
    // rather than guessing its database primary key ID. Optional handles the "Item not found" case safely.
    Optional<ToolEntity> findByToolCode(String toolCode);

    // Why: Contextual filtering. When a user clicks on "Drills" in the catalog, this retrieves
    // only the physical instances of drills (Type ID) to populate the inventory list view.
    List<ToolEntity> findByInformationToolIdInformationTool(Long infoId);

    // 1. Total Stock Count
    // Why: Performance optimization. Instead of fetching a list of 1000 objects into Java memory
    // just to count them (list.size()), we ask the database to return a single number.
    @Query("SELECT COUNT(t) FROM ToolEntity t WHERE t.informationTool.idInformationTool = :infoId")
    long countTotalUnitsByInfoId(@Param("infoId") Long infoId);

    // 2. Available Stock Count
    // Why: Real-time availability check. This query specifically isolates items with 'Status 0' (Available),
    // allowing the frontend to show "5 in stock" without needing to filter arrays on the client side.
    @Query("SELECT COUNT(t) FROM ToolEntity t WHERE t.informationTool.idInformationTool = :infoId AND t.toolStatus = 0")
    long countAvailableUnitsByInfoId(@Param("infoId") Long infoId);
}