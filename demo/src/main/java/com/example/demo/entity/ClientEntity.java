package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

// Why: Imports 'BigDecimal' but uses 'int' below.
// Ideally, financial data should use BigDecimal to avoid rounding errors,
// but 'int' is sufficient if the business logic only handles whole numbers (no cents).


// ENDPOINT DATA: This class defines the JSON structure sent to the Frontend.
// Why: Using JPA (@Entity) maps this Java class directly to the 'client' table in Postgres,
// eliminating the need for manual SQL 'INSERT' or 'SELECT' queries.
@Entity

// Why: Lombok (@Data) automatically generates Getters, Setters, and toString() at compile time.
// This keeps the class file clean and readable by hiding boilerplate code.
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "client")
public class ClientEntity {

    /*
     * Client ID
     */
    @Id
    // Why: We use IDENTITY to delegate ID generation to the database (Auto-Increment).
    // This serves as the Technical Key (Foreign Key) for relationships because it is immutable and faster to index than a String RUT.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_client", unique = true, nullable = false)
    private Long idClient;

    /*
     * Client's RUT
     */
    // Why: Business Key. We use String instead of Number to accommodate the hyphen
    // and the letter 'K' verification digit specific to Chilean IDs.
    @Column(name = "rut")
    private String rut;

    /*
     *Client's names
     */
    @Column(name = "client_name")
    private String clientName;


    /*
     * Client's phone
     */
    @Column(name = "phone")
    private String phone;

    /*
     * mail's client
     */
    @Column(name = "mail")
    private String mail;


    /*
     * State of client
     * True = Activo ; False = restringido
     */
    // Why: Gatekeeper Flag. This boolean controls the business logic authorization.
    // If set to FALSE, the RentalService will immediately reject any new transaction attempts.
    @Column(name = "client_status")
    private Boolean clientStatus;

    /*
     * Amount associeated to the client
     */
    // Why: Denormalization / Cache.
    // Instead of summing up all historical rental records every time we show the client's profile (expensive operation),
    // we maintain the current total debt here for instant access.
    @Column(name = "amount_client")
    private int amountClient;
}