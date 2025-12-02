package com.example.demo.Entity;

import jakarta.persistence.*;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// ENDPOINT DATA: Internal Staff Registry.
// Why: We explicitly name the table "app_users" because "USER" is a reserved keyword
// in Postgres/SQL. Using the default name would cause a syntax error on startup.
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_users")
public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Why: Identity Anchor. This must be unique to serve as the primary login handle.
    // If two people have the same username, the authentication system won't know which password to check.
    @Column(unique = true, nullable = false)
    private String username;

    // Why: Security Compliance. This field MUST hold a BCRYPT HASH, never plain text.
    // If the database is hacked, we want the attacker to see gibberish, not actual passwords.
    @Column(nullable = false)
    private String password;

    private String email;

    // Why: Authorization Scope. This simple string ("ADMIN" vs "EMPLOYEE") drives
    // the @PreAuthorize checks in the Controllers, determining who can press the "Delete" button.
    private String role;

    // Why: Soft Delete / Kill Switch. Instead of deleting a user (which breaks historical logs like
    // "Who created this rental?"), we simply set this to FALSE to prevent future logins while keeping history intact.
    private Boolean active = true;
}