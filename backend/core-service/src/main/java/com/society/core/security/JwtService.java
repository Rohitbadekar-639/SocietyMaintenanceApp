package com.society.core.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;

/**
 * Core service only validates tokens issued by the identity-service.
 * The signing secret must be identical across both services.
 */
@Service
public class JwtService {

    private final SecretKey key;

    public JwtService(@Value("${security.jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static boolean isSocietySubscriptionClaimActive(Claims claims) {
        Object raw = claims.get("subExp");
        if (raw == null) {
            return true;
        }
        long epochMs;
        if (raw instanceof Number number) {
            epochMs = number.longValue();
        } else {
            try {
                epochMs = Long.parseLong(raw.toString());
            } catch (NumberFormatException ex) {
                return true;
            }
        }
        return Instant.ofEpochMilli(epochMs).isAfter(Instant.now());
    }
}
