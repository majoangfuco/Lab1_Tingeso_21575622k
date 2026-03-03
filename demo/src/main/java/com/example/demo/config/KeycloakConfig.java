package com.example.demo.config;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class KeycloakConfig {

    // ENDPOINT CONFIG: Dependency Injection.
    // Why: We inject these sensitive values from the environment (application.properties)
    // instead of hardcoding them here. This allows for different credentials in Dev/Prod
    // and keeps secrets out of the source code (Security Best Practice).
    @Value("${keycloak.realm}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.username}")
    private String username;

    @Value("${keycloak.password}")
    private String password;

    // ENDPOINT FACTORY: Creates the "Super Admin" client.
    @Bean
    public Keycloak keycloak() {
        // Why: The Builder Pattern constructs a heavy, complex object step-by-step.
        // This instance represents the Backend itself logging into Keycloak with admin privileges
        // (usually via the 'admin-cli' client) to gain permission to create/delete other users programmatically.
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm(realm)
                // Why: We use the 'password' grant type (Direct Access Grant) here because this is a
                // trusted backend service communicating directly with the Auth Server, not a user browser.
                .grantType("password")
                .clientId(clientId)
                .username(username)
                .password(password)
                .build();
    }
}