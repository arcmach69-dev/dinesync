package com.dinesync.user_service.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET = 
        "dinesync-secret-key-must-be-32-characters-long!";
    private static final long EXPIRATION = 86400000; // 24 hours

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET.getBytes());
    }

    public String generateToken(String email, String role) {
    return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(new Date(
                System.currentTimeMillis() + EXPIRATION))
            .signWith(getSigningKey())
            .compact();
}

public String extractEmail(String token) {
    return Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) getSigningKey())
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
}

public boolean validateToken(String token) {
    try {
        Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) getSigningKey())
            .build()
            .parseSignedClaims(token);
        return true;
    } catch (Exception e) {
        return false;
    }
}
}