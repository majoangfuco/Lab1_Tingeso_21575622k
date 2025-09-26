package com.example.demo.Entity;


import jakarta.persistence.*;
import lombok.*;

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
    @ManyToOne(optional = false)
    @JoinColumn(name = "information_tool_id", referencedColumnName = "id")
    private InformationToolEntity informationTool;


    /*
     * Tool state
     * where 0 = Disponible ; 1 = Prestada ;  2 = En reparación ; 3 = Dada de Baja
     */
    @Column(name = "tool_status")
    private Integer toolStatus;

    /*
     * Internal code of the tool in the business
     */
    @Column(name = "tool_code")
    private String toolCode;

    /*
     * Associated rental; if the tool isn’t rented, this attribute is NULL
     */
    @ManyToOne(optional = true)
    @JoinColumn(name = "rental_id", referencedColumnName = "id")
    private RentalEntity rental;


}
