package com.example.demo.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

@Table(name = "client")

public class ClientEntity {

    /*
     * Client ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_category_tool", unique = true, nullable = false)
    private Long idCategoryTool;

    /*
     * RUT's clint
     */
    @Column(name = "rut")
    private String rut;

    /*
     * Phones's client
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
    @Column(name = "client_status")
    private Boolean clientStatus;

}
