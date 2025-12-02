package com.example.demo.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
// Why: Enables the usage of annotations like @PreAuthorize("hasRole('ADMIN')") at the controller/method level.
// This allows for granular security controls directly on your business logic.
@EnableMethodSecurity
public class SecurityConfig {

    // ENDPOINT CONFIG: The Main Security Gatekeeper.
    // This bean defines the rules of engagement for all incoming HTTP traffic.
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // Why: We must explicitly allow the React Frontend (running on a different port)
                // to talk to this Backend. Without this, the browser's Same-Origin Policy will block requests.
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Why: "Zero Trust" approach. We mandate that every single request must carry valid credentials.
                // We do not allow anonymous access to any part of the API by default.
                .authorizeHttpRequests(authorize -> authorize
                        .anyRequest().authenticated()
                )
                // ENDPOINT SECURITY: Configures this app as a Resource Server.
                // Why: We tell Spring NOT to handle logins (no login forms here). Instead, it should expect
                // a JWT (JSON Web Token) in the "Authorization: Bearer" header, signed by Keycloak.
                // We inject our custom converter to correctly read Roles from that token.
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt ->
                        jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                ));

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Why: Security Whitelist. We only allow the specific URL of our frontend.
        // Accepting "*" (everyone) is dangerous in production environments.
        configuration.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173", // URL de desarrollo original
                "http://localhost",      // URL de Docker/Nginx (puerto 80)
                "http://localhost:80"    // Redundante, pero seguro
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        // Why: Required if the frontend needs to send Cookies or Authorization headers.
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Why: Even if Keycloak handles passwords, this bean might be needed if the app
        // performs any internal hashing operations. BCrypt is the industry standard.
        return new BCryptPasswordEncoder();
    }

    // --- KEYCLOAK ROLE CONVERTER ---
    // Why: Bridge logic. Spring Security doesn't know where Keycloak hides the user Roles inside the JSON.
    // We plug in our custom logic here to tell Spring exactly where to look.
    private Converter<Jwt, AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(new KeycloakRealmRoleConverter());
        return jwtConverter;
    }

    // ENDPOINT DATA TRANSFORMATION: Internal Logic Class.
    class KeycloakRealmRoleConverter implements Converter<Jwt, Collection<GrantedAuthority>> {
        @Override
        public Collection<GrantedAuthority> convert(Jwt jwt) {
            // Why: Debug logs allow developers to inspect the raw Token payload during development
            // to verify if Keycloak is actually sending the expected data.
            System.out.println("--- DEBUG JWT CLAIMS ---");
            System.out.println(jwt.getClaims());

            // Why: Keycloak specific structure. Realm roles are nested inside "realm_access",
            // unlike standard OAuth2 scopes. We must navigate this JSON path manually.
            Map<String, Object> realmAccess = (Map<String, Object>) jwt.getClaims().get("realm_access");

            if (realmAccess == null || realmAccess.isEmpty()) {
                System.out.println("--- DEBUG: realm_access is null or empty ---");
                return List.of();
            }

            List<String> roles = (List<String>) realmAccess.get("roles");
            System.out.println("--- DEBUG: Roles found in Keycloak: " + roles + " ---");

            return roles.stream()
                    // Why: Spring Security Standardization.
                    // Spring defaults to checking for "ROLE_Admin". Keycloak sends just "Admin".
                    // We must append the prefix manually so @PreAuthorize works correctly.
                    .map(roleName -> "ROLE_" + roleName)
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());
        }
    }
}