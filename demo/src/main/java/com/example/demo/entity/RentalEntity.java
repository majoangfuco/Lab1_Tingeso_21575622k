package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

// ENDPOINT DATA: The Core Transaction.
// Why: This entity binds all other domains together (Client + Inventory + Time + Money).
// It represents the legal contract between the company and the customer.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "rental")
public class RentalEntity {

    /*
     * Rental ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rental_id")
    private Long rentalId;

    /*
    Rental bussines code
     */
    // Why: Human-Readable Identifier. While 'rentalId' (1, 2, 3) is for the database,
    // 'rentalCode' (e.g., "R-2023-XYZ") is what appears on the printed receipt.
    // It allows us to mask the actual database volume from competitors or customers.
    @Column(name = "rental_code", unique = true)
    private String rentalCode;


    /*
     * Client associeted
     */
    // Why: Mandatory Relationship. A rental cannot exist in a vacuum; it requires a responsible party
    // for legal liability and billing. The 'optional = false' enforces this constraint at the API level.
    @ManyToOne(optional = false)
    @JoinColumn(name = "clien_id") // Note: Double-check spelling in your DB ('client_id' vs 'clien_id')
    private ClientEntity client;

    /*
     * Rental creation date
     */
    // Why: Billing Start Point. This timestamp marks exactly when the inventory left the warehouse,
    // starting the clock for daily charges.
    @Column(name = "rental_date")
    private LocalDateTime rentalDate;

    /*
     * Rental return date
     */
    // Why: Deadline Trigger. This is the agreed-upon return time. The system uses this
    // to automatically calculate the status (Active vs. Overdue) and apply late fees if exceeded.
    @Column(name = "return_date")
    private LocalDateTime returnDate;

    /*
     * Amount Due (if any)
     */
    // Why: Financial Snapshot. We store the final calculated cost here.
    @Column(name = "amount_due")
    private int amountDue;

    /**
     * ID of the user (from Keycloak) who created the rental
     */
    // Why: Audit Trail. We store the Clerk's ID as a raw String (from Keycloak) rather than a database relationship.
    // This ensures that even if an employee is fired and their account deleted, the historical record
    // of "Who processed this rental" remains intact and readable.
    @Column(name = "created_by_user_id", nullable = false)
    private String createdByUserId;

    /**
     * Rental Status where:
     * 0 = current ; 1 = overdue ; 2 = returned ;
     */
    // Why: Lifecycle State Machine.
    // 0 or 1: Implies inventory is "Locked" (out of stock).
    // 2: Implies transaction is closed and inventory is "Released" (back in stock).
    @Column(name = "rental_status")
    private Integer rentalStatus;
}