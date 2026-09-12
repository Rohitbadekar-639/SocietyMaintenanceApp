package com.society.core.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Read-only lookups against identity tables in the shared Neon database.
 * Uses JDBC (not JPA entities) so Hibernate ddl-auto never mutates identity schema.
 */
@Service
public class SocietyDirectoryLookup {

    public record MemberRef(UUID id, String flatNumber, String fullName, boolean active) {}

    private final JdbcTemplate jdbc;

    public SocietyDirectoryLookup(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /** Active residents only — inactive members are excluded from tracker/digest math. */
    public List<MemberRef> listMembers(UUID societyId) {
        if (societyId == null) return List.of();
        return jdbc.query(
                """
                SELECT id, flat_number, full_name, active
                FROM users
                WHERE society_id = ? AND role = 'MEMBER' AND active = TRUE
                ORDER BY full_name ASC
                """,
                (rs, i) -> new MemberRef(
                        (UUID) rs.getObject("id"),
                        rs.getString("flat_number"),
                        rs.getString("full_name"),
                        rs.getBoolean("active")),
                societyId);
    }

    public Optional<MemberRef> findMember(UUID societyId, UUID memberId) {
        if (societyId == null || memberId == null) return Optional.empty();
        List<MemberRef> rows = jdbc.query(
                """
                SELECT id, flat_number, full_name, active
                FROM users
                WHERE society_id = ? AND id = ? AND role = 'MEMBER'
                LIMIT 1
                """,
                (rs, i) -> new MemberRef(
                        (UUID) rs.getObject("id"),
                        rs.getString("flat_number"),
                        rs.getString("full_name"),
                        rs.getBoolean("active")),
                societyId,
                memberId);
        return rows.stream().findFirst();
    }

    public Optional<String> findSocietyName(UUID societyId) {
        if (societyId == null) return Optional.empty();
        List<String> rows = jdbc.query(
                "SELECT name FROM societies WHERE id = ? LIMIT 1",
                (rs, i) -> rs.getString(1),
                societyId);
        return rows.stream().filter(n -> n != null && !n.isBlank()).findFirst();
    }

    public Optional<String> findMemberName(UUID societyId, UUID memberId, String flatNumber) {
        if (memberId != null) {
            List<String> byId = jdbc.query(
                    "SELECT full_name FROM users WHERE id = ? AND society_id = ? LIMIT 1",
                    (rs, i) -> rs.getString(1),
                    memberId,
                    societyId);
            Optional<String> name = byId.stream().filter(n -> n != null && !n.isBlank()).findFirst();
            if (name.isPresent()) return name;
        }
        if (flatNumber != null && !flatNumber.isBlank()) {
            List<String> byFlat = jdbc.query(
                    """
                    SELECT full_name FROM users
                    WHERE society_id = ? AND LOWER(TRIM(flat_number)) = LOWER(TRIM(?))
                    ORDER BY created_at DESC
                    LIMIT 1
                    """,
                    (rs, i) -> rs.getString(1),
                    societyId,
                    flatNumber.trim());
            return byFlat.stream().filter(n -> n != null && !n.isBlank()).findFirst();
        }
        return Optional.empty();
    }
}
