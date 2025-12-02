package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// ENDPOINT DATA: The "Black Box" or "Flight Recorder" of the system.
// Why: This entity represents the immutable history of inventory. Unlike the 'ToolEntity' which shows
// the *current* state (snapshot), the Kardex shows the *sequence of events* (movie) that led there.
// It answers the question: "Who had this drill last Tuesday at 4 PM?"
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "kardex")
public class KardexEntity {

    /*
     * Kardex ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "kadex_id")
    private Long kardexId;

    /*
     * Specific tool asociated to Kardex
     */
    // Why: Mandatory Link. You cannot record a movement for "nothing".
    // Every log entry must point to a specific physical asset (Tool ID) to track its individual lifecycle.
    @ManyToOne(optional = false)
    @JoinColumn(name = "tool_id")
    private ToolEntity tool;


    /*
     * Specific rental asociated to Kardex
     */
    // Why: Optional Link. Not all movements are commercial rentals.
    // Examples: Buying new tools (Status 0), sending to repair (Status 3), or discarding broken ones (Status 2).
    // These internal movements happen inside the warehouse without a customer contract, so this field can be null.
    @ManyToOne(optional = true)
    @JoinColumn(name = "rental_id")
    private RentalEntity rental;


    /*
     * Type of Kardex
     * where:
     * 0 = register ; 1 = return ; 2 = Decommissioned ; 3 = in reparation ; 4 = rentend
     */
    // Why: State Transition Logic. This integer defines the "Verb" of the sentence
    // (e.g., "Tool X was [RETURNED] by User Y"). It drives the inventory availability logic.
    @Column(name = "kardex_type")
    private Integer kardexType;

    /*
     * Date when the kardex was modified
     */
    // Why: Time-Series Data. Essential for reporting and sorting the history chronologically.
    @Column(name = "kardex_date")
    private LocalDateTime kardexDate;

    /**
     * Who made the modification
     */
    // Why: Audit Trail / Accountability. We store the User ID (likely the Keycloak Username or UUID) as a String
    // rather than a Foreign Key relation. This ensures the log remains readable even if the employee's
    // account is deleted from the system in the future.
    @Column(name = "created_by_user_id")
    private String createdByUserId;

}