package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

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
    @Column(name = "reposition_price")
    private Integer repositionPrice;

    /*
    * Category´s Tool
    */
    @Column(name = "category_tool")
    private String categoryTool;

}
