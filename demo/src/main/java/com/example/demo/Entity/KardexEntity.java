package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

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

    @ManyToOne(optional = false)
    @JoinColumn(name = "tool_id", referencedColumnName = "id")
    private ToolEntity tool;


    /*
     * Specific rental asociated to Kardex
     */
    @ManyToOne(optional = true)
    @JoinColumn(name = "rental_id", referencedColumnName = "id")
    private RentalEntity rental;


    /*
     * Type of Kardex
     * where:
     * 0 = register ; 1 = return ; 2 = Decommissioned ; 3 = in reparation ; 4 = rentend
     */
    @Column(name = "kardex_type")
    private Integer kardexType;

    /*
    * Date when the kardex was modified
     */
    @Column(name = "kardex_date")
    private LocalDateTime kardexDate;

}
