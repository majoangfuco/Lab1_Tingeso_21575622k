package com.example.demo.entity;


import jakarta.persistence.*;
import lombok.*;

// ENDPOINT DATA: Represents a specific, physical asset in the warehouse.
// Why: Distinct from 'InformationToolEntity' (The Concept/Catalog Entry), this entity tracks
// the actual object (The Reality) that can be touched, broken, or lost.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tool")

public class ToolEntity {

    /*
     * Tool ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tool_id")
    private Long toolId;

    /*
     * Indentifier information of the tool
     */
    // Why: Mandatory Parent. A physical tool cannot exist without a definition.
    // This link allows the specific item to inherit pricing and category data from the catalog.
    @ManyToOne(optional = false)
    @JoinColumn(name = "information_tool_id")
    private InformationToolEntity informationTool;


    /*
     * Tool state
     * where 0 = Disponible ; 1 = Prestada ;  2 = En reparación ; 3 = Dada de Baja
     */
    // Why: Inventory Availability Logic. The rental service checks this specific integer
    // to decide if this item can be added to a cart (0) or if it is blocked (1, 2, 3).
    @Column(name = "tool_status")
    private Integer toolStatus;

    /*
     * Internal code of the tool in the business
     */
    // Why: Asset Tagging / Barcode. This is the human-readable identifier printed on the physical sticker.
    // It separates business operations (scanning a label) from database internals (Primary Keys).
    @Column(name = "tool_code")
    private String toolCode;

    /*
     * Associated rental; if the tool isn’t rented, this attribute is NULL
     */
    // Why: Transient State. This acts as a "Current Location" pointer.
    // If null, the tool is physically in the warehouse. If set, it points to the active contract holding the tool.
    @ManyToOne(optional = true)
    @JoinColumn(name = "rental_id")
    private RentalEntity rental;


}