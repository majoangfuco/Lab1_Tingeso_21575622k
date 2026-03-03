package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

// ENDPOINT DATA: This class defines the "Catalog" or "Menu" of tools.
// Why: We distinguish between the abstract definition of a tool (e.g., "Bosch Drill 500W")
// and the physical instances in the warehouse (e.g., "Drill #45 with serial number XYZ").
// This entity holds the shared properties (Price, Name) for all physical units of this type.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "information_tool")
public class InformationToolEntity {

    /*
     * Tool ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Why: Acts as the Foreign Key Parent for the inventory table.
    // All physical tools will reference this ID to know what they are and how much they cost.
    @Column(name = "id_information_tool")
    private Long idInformationTool;

    /*
     * Name´s tool
     */
    @Column(name = "name_tool")
    private String nameTool;

    /*
     * Reposition price of tool
     */
    // Why: Risk Management. If a client loses or breaks a tool beyond repair,
    // this is the penalty fee charged to replace the asset completely.
    @Column(name = "reposition_price")
    private Integer repositionPrice;

    /*
     * Category´s Tool
     */
    // Why: Classification. Used for filtering and reporting (e.g., "Show me all Electric Tools").
    // Storing it as a String is simpler for small projects, though a separate CategoryEntity
    // would be better for data normalization in larger systems.
    @Column(name = "category_tool")
    private String categoryTool;

    /*
     * Tool's rent price
     */
    // Why: Revenue Model. This is the daily rate used by the RentalService
    // to calculate the total cost (rentPrice * days).
    @Column(name = "rent_price")
    private Integer rentPrice;

    /*
     * Tool's due price
     */
    // Why: Penalty Logic. If the tool is returned late, this price (usually higher than rentPrice)
    // is applied to the extra days to discourage delays.
    @Column(name = "due_price")
    private Integer duePrice;

}