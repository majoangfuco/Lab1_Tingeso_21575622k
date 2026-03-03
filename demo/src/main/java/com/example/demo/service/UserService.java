package com.example.demo.service;

import com.example.demo.entity.UserEntity;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

// ENDPOINT LOGIC: Identity Provisioning.
// Why: This service acts as the bridge between your custom App Logic and the external Identity Provider (Keycloak).
// It abstracts the complex HTTP API calls required to provision new accounts securely.
@Service
public class UserService {

    @Autowired
    private Keycloak keycloak;

    // Why: We inject the target realm because the Admin Client has super-powers over the entire server.
    // We must ensure we are only modifying the specific "Tenant" (ToolRentRealm) and not the Master realm.
    @Value("${app.keycloak.target-realm}")
    private String targetRealm;

    public void createUserInKeycloak(UserEntity user) {
        // 1. Data Preparation (DTO)
        UserRepresentation kcUser = new UserRepresentation();
        kcUser.setUsername(user.getUsername());
        kcUser.setEmail(user.getEmail());
        kcUser.setEnabled(true);
        // Why: UX Optimization. We manually verify the email to bypass the "Click here to verify"
        // email flow, allowing the employee to log in immediately after creation.
        kcUser.setEmailVerified(true);

        // 2. Realm Connection
        RealmResource realmResource = keycloak.realm(targetRealm);
        UsersResource usersResource = realmResource.users();

        // 3. Execution
        // ENDPOINT ACTION: Sends the HTTP POST to Keycloak to create the skeleton user.
        Response response = usersResource.create(kcUser);

        if (response.getStatus() == 201) {
            // 4. ID Extraction
            // Why: The Create API returns a Location Header, not the User Object.
            // We use this utility to parse the generated UUID (e.g. "550e8400...") needed for subsequent steps.
            String userId = CreatedResponseUtil.getCreatedId(response);

            // 5. Credential Configuration
            // Why: Security Separation. Creating a user and setting a password are two distinct operations
            // in the Keycloak API. We must create a specific Credential representation to apply the password.
            CredentialRepresentation passwordCred = new CredentialRepresentation();
            // Why: Setting temporary=false prevents the "You must change your password on first login"
            // prompt, streamlining the onboarding process for the employee.
            passwordCred.setTemporary(false);
            passwordCred.setType(CredentialRepresentation.PASSWORD);
            passwordCred.setValue(user.getPassword());

            UserResource userResource = usersResource.get(userId);
            userResource.resetPassword(passwordCred);

            // 6. Role Assignment
            try {
                String roleNameFromFront = user.getRole();
                String keycloakRoleName;

                // ENDPOINT MAPPING: Case Sensitivity Handling.
                // Why: Keycloak Role IDs are strict ("Admin" != "admin").
                // We perform a manual mapping here to ensure the string sent by the frontend
                // matches the exact casing defined in the Keycloak Console, preventing "Role Not Found" errors.
                if ("Admin".equalsIgnoreCase(roleNameFromFront)) {
                    keycloakRoleName = "Admin";
                } else if ("employee".equalsIgnoreCase(roleNameFromFront)) {
                    keycloakRoleName = "employee";
                } else {
                    throw new RuntimeException("Rol no válido: " + roleNameFromFront);
                }

                // Why: We cannot assign a role by string name alone. We must fetch the full Role Representation
                // from the server to get its internal ID, then attach that object to the user.
                RoleRepresentation realmRole = realmResource.roles().get(keycloakRoleName).toRepresentation();
                userResource.roles().realmLevel().add(Collections.singletonList(realmRole));

            } catch (Exception e) {
                throw new RuntimeException("Error asignando rol: " + e.getMessage());
            }

        } else if (response.getStatus() == 409) {
            // Why: Standard HTTP Conflict code. Means username or email is already taken.
            throw new RuntimeException("El usuario ya existe en Keycloak.");
        } else {
            throw new RuntimeException("Error creando usuario en Keycloak. Su estado es: " + response.getStatus());
        }
    }
}