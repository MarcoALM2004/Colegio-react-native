package com.colegio.plataforma.service;

import com.colegio.plataforma.models.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;

@Service
public class JwtService {

    private static final long DURACION_TOKEN = 24 * 60 * 60 * 1000;

    private final SecretKey secretKey;

    public JwtService(@Value("${app.jwt.secret}") String secretBase64) {
        byte[] keyBytes = Base64.getDecoder().decode(secretBase64);

        if (keyBytes.length < 32) {
            throw new IllegalArgumentException(
                "La clave JWT debe tener al menos 256 bits."
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        Date expiracion = new Date(ahora.getTime() + DURACION_TOKEN);

        return Jwts.builder()
            .subject(usuario.codigo())
            .claim("id", usuario.id())
            .claim("rol", usuario.rol())
            .issuedAt(ahora)
            .expiration(expiracion)
            .signWith(secretKey)
            .compact();
    }

    public Claims validarToken(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    public String obtenerCodigoUsuario(String token) {
        return validarToken(token).getSubject();
    }
}
