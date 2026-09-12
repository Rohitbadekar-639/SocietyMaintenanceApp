package com.society.identity.service;

import com.society.identity.domain.User;
import com.society.identity.exception.ApiExceptions.BadRequestException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Blocks member deactivate when tracker-aligned maintenance is still unpaid.
 * Reads core maintenance tables in the shared Neon database (JDBC only).
 */
@Service
public class MemberExitDuesGuard {

    private static final int MAX_LOOKBACK_MONTHS = 24;
    private static final String[] MONTHS = {
            "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    private final JdbcTemplate jdbc;

    public MemberExitDuesGuard(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void assertClearToDeactivate(User member) {
        UUID societyId = member.getSocietyId();
        UUID memberId = member.getId();
        String flat = member.getFlatNumber() == null ? "" : member.getFlatNumber().trim();

        LocalDate today = LocalDate.now();
        LocalDate start = earliestPeriod(societyId, today);

        BigDecimal total = BigDecimal.ZERO;
        int periods = 0;
        StringBuilder detail = new StringBuilder();

        for (LocalDate cursor = start; !cursor.isAfter(today); cursor = cursor.plusMonths(1)) {
            int year = cursor.getYear();
            int month = cursor.getMonthValue();
            ChargeRow charge = findCharge(societyId, memberId, flat, year, month);
            BigDecimal due;
            if (charge != null) {
                if ("PAID".equalsIgnoreCase(charge.status())) {
                    continue;
                }
                due = charge.amount() != null ? charge.amount() : BigDecimal.ZERO;
            } else {
                due = resolveScheduledAmount(societyId, memberId, flat, year, month);
                if (due == null || due.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }
            }
            if (due.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            periods++;
            total = total.add(due);
            if (detail.length() > 0) {
                detail.append("; ");
            }
            detail.append(MONTHS[month]).append(' ').append(year)
                    .append(" ₹").append(due.stripTrailingZeros().toPlainString());
        }

        if (periods > 0) {
            throw new BadRequestException(
                    "Payment left before making inactive: "
                            + periods + " period(s), total ₹"
                            + total.stripTrailingZeros().toPlainString()
                            + " (" + detail + "). Mark dues paid in Maintenance Tracker first.");
        }
    }

    private LocalDate earliestPeriod(UUID societyId, LocalDate today) {
        LocalDate floor = today.minusMonths(MAX_LOOKBACK_MONTHS - 1L).withDayOfMonth(1);
        LocalDate earliest = today.withDayOfMonth(1);

        List<LocalDate> fromCharges = jdbc.query(
                """
                SELECT billing_year, billing_month FROM maintenance_charges
                WHERE society_id = ?
                """,
                (rs, i) -> LocalDate.of(rs.getInt(1), rs.getInt(2), 1),
                societyId);
        for (LocalDate d : fromCharges) {
            if (d.isBefore(earliest)) earliest = d;
        }

        List<LocalDate> fromRates = jdbc.query(
                """
                SELECT effective_from_year, effective_from_month FROM maintenance_rate_schedules
                WHERE society_id = ?
                """,
                (rs, i) -> LocalDate.of(rs.getInt(1), rs.getInt(2), 1),
                societyId);
        for (LocalDate d : fromRates) {
            if (d.isBefore(earliest)) earliest = d;
        }

        List<LocalDate> fromDefaults = jdbc.query(
                """
                SELECT effective_from_year, effective_from_month FROM member_maintenance_defaults
                WHERE society_id = ?
                """,
                (rs, i) -> LocalDate.of(rs.getInt(1), rs.getInt(2), 1),
                societyId);
        for (LocalDate d : fromDefaults) {
            if (d.isBefore(earliest)) earliest = d;
        }

        return earliest.isBefore(floor) ? floor : earliest;
    }

    private record ChargeRow(String status, BigDecimal amount) {}

    private ChargeRow findCharge(UUID societyId, UUID memberId, String flat, int year, int month) {
        List<ChargeRow> byMember = jdbc.query(
                """
                SELECT status, amount FROM maintenance_charges
                WHERE society_id = ? AND billing_year = ? AND billing_month = ?
                  AND member_id = ?
                LIMIT 1
                """,
                (rs, i) -> new ChargeRow(rs.getString(1), rs.getBigDecimal(2)),
                societyId, year, month, memberId);
        if (!byMember.isEmpty()) {
            return byMember.get(0);
        }
        if (flat.isEmpty()) {
            return null;
        }
        List<ChargeRow> byFlat = jdbc.query(
                """
                SELECT status, amount FROM maintenance_charges
                WHERE society_id = ? AND billing_year = ? AND billing_month = ?
                  AND LOWER(TRIM(flat_number)) = LOWER(TRIM(?))
                LIMIT 1
                """,
                (rs, i) -> new ChargeRow(rs.getString(1), rs.getBigDecimal(2)),
                societyId, year, month, flat);
        return byFlat.isEmpty() ? null : byFlat.get(0);
    }

    private BigDecimal resolveScheduledAmount(
            UUID societyId, UUID memberId, String flat, int year, int month) {
        String mode = billingMode(societyId);
        if ("VARIABLE".equalsIgnoreCase(mode)) {
            BigDecimal memberAmt = jdbc.query(
                    """
                    SELECT amount FROM member_maintenance_defaults
                    WHERE society_id = ?
                      AND (member_id = ? OR LOWER(TRIM(flat_number)) = LOWER(TRIM(?)))
                      AND (effective_from_year < ? OR (effective_from_year = ? AND effective_from_month <= ?))
                    ORDER BY effective_from_year DESC, effective_from_month DESC
                    LIMIT 1
                    """,
                    (rs, i) -> rs.getBigDecimal(1),
                    societyId, memberId, flat, year, year, month)
                    .stream().findFirst().orElse(null);
            return memberAmt;
        }
        List<BigDecimal> rates = jdbc.query(
                """
                SELECT amount FROM maintenance_rate_schedules
                WHERE society_id = ?
                  AND (effective_from_year < ? OR (effective_from_year = ? AND effective_from_month <= ?))
                ORDER BY effective_from_year DESC, effective_from_month DESC
                LIMIT 1
                """,
                (rs, i) -> rs.getBigDecimal(1),
                societyId, year, year, month);
        return rates.isEmpty() ? null : rates.get(0);
    }

    private String billingMode(UUID societyId) {
        List<String> modes = jdbc.query(
                """
                SELECT billing_mode FROM society_maintenance_settings
                WHERE society_id = ?
                LIMIT 1
                """,
                (rs, i) -> rs.getString(1),
                societyId);
        return modes.isEmpty() ? "SAME" : modes.get(0);
    }
}
