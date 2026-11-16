package com.colegio.plataforma.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
            throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .authorizeHttpRequests(auth -> auth

                // Permitir preflight de React Native y otras solicitudes CORS
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Inicio de sesión público
                .requestMatchers(HttpMethod.POST, "/login").permitAll()

                // Salud del servidor
                .requestMatchers("/actuator/health").permitAll()

                // Administración: solamente administradores
                .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                // Calificaciones: solamente docentes
                .requestMatchers("/api/calificaciones/**")
                    .hasRole("DOCENTE")

                // Los demás módulos requieren JWT válido
                .requestMatchers("/api/**").authenticated()

                // Cualquier otra ruta también requiere autenticación
                .anyRequest().authenticated()
            )

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, ex) -> {
                    response.setStatus(401);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(
                        "{\"mensaje\":\"Debes iniciar sesión para acceder.\"}"
                    );
                })
                .accessDeniedHandler((request, response, ex) -> {
                    response.setStatus(403);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(
                        "{\"mensaje\":\"No tienes permisos para acceder a este recurso.\"}"
                    );
                })
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
