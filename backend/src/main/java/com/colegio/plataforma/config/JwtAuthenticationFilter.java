package com.colegio.plataforma.config;

import com.colegio.plataforma.service.JwtService;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    // No procesar JWT en login ni en peticiones OPTIONS.
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        return request.getMethod().equalsIgnoreCase("OPTIONS")
                || (
                    request.getMethod().equalsIgnoreCase("POST")
                    && request.getServletPath().equals("/login")
                );
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorization =
                request.getHeader(HttpHeaders.AUTHORIZATION);

        // DIAGNOSTICO: comprobar si llega el encabezado JWT.
        System.out.println(
                "========== DIAGNOSTICO JWT =========="
        );

        System.out.println(
                "Ruta: " + request.getRequestURI()
        );

        System.out.println(
                "Metodo: " + request.getMethod()
        );

        System.out.println(
                "Authorization recibido: "
                + (authorization == null ? "NULL" : "PRESENTE")
        );

        // Si no se envía token, Spring Security decide
        // si permite o rechaza la petición.
        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {

            System.out.println(
                    "JWT: No se recibió un Bearer token válido."
            );

            System.out.println(
                    "====================================="
            );

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorization.substring(7).trim();

        try {

            // Validar firma y expiración del token.
            Claims claims = jwtService.validarToken(token);

            String codigo = claims.getSubject();
            String rol = claims.get("rol", String.class);

            System.out.println(
                    "JWT validado correctamente."
            );

            System.out.println(
                    "Usuario autenticado: " + codigo
            );

            System.out.println(
                    "Rol: " + rol
            );

            if (codigo == null || codigo.isBlank()) {
                throw new IllegalArgumentException(
                        "El token no contiene un usuario válido."
                );
            }

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                List<SimpleGrantedAuthority> authorities =
                        rol == null || rol.isBlank()
                                ? List.of()
                                : List.of(
                                    new SimpleGrantedAuthority(
                                        rol.startsWith("ROLE_")
                                                ? rol
                                                : "ROLE_" + rol
                                    )
                                );

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                codigo,
                                null,
                                authorities
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

                System.out.println(
                        "JWT: Autenticacion establecida en Spring Security."
                );
            }

        } catch (JwtException | IllegalArgumentException e) {

            // DIAGNOSTICO: mostrar la causa sin imprimir el token.
            System.out.println(
                    "ERROR VALIDANDO JWT: " + e.getMessage()
            );

            SecurityContextHolder.clearContext();

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");

            response.getWriter().write(
                    "{\"mensaje\":\"Token inválido o expirado.\"}"
            );

            System.out.println(
                    "====================================="
            );

            return;
        }

        System.out.println(
                "====================================="
        );

        filterChain.doFilter(request, response);
    }
}
