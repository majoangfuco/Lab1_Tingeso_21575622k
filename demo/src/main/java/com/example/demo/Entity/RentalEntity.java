package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;


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
     * Client associeted
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "clien_id", referencedColumnName = "id")
    private ClientEntity client;

    /*
     * Tool associeted
     */
    @ManyToOne(optional = false)
    @JoinColumn(name = "tool_id", referencedColumnName = "id")
    private ToolEntity tool;

    /*
    * Rental creation date
    */
    @Column(name = "rental_date")
    private LocalDateTime rentalDate;

    /*
     * Rental return date
     */
    @Column(name = "return_date")
    private LocalDateTime returnDate;

    /*
     * Amount Due (if any)
     */
    @Column(name = "amount_due")
    private BigDecimal amountDue;

    /**
     * ID of the user (from Keycloak) who created the rental
     */
    @Column(name = "created_by_user_id", nullable = false)
    private String createdByUserId;

    /**
     * Rental Status where:
     * 0 = current ; 1 = overdue ; 2 = returned
     */
    @Column(name = "rental_status")
    private Integer rentalStatus;
}
