package com.society.core.service;

import com.society.core.domain.MaintenanceCharge;
import com.society.core.domain.MaintenanceStatus;
import com.society.core.dto.MaintenanceBillingDtos.ResolvedAmountResponse;
import com.society.core.repository.MaintenanceChargeRepository;
import com.society.core.repository.MaintenanceRateScheduleRepository;
import com.society.core.repository.MemberMaintenanceDefaultRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Outstanding maintenance aligned with Maintenance Tracker:
 * members without a charge row for a billable period count as pending
 * ("Not recorded yet"), not only DB rows with status PENDING.
 */
@Service
public class MaintenanceOutstandingService {

    private static final int MAX_LOOKBACK_MONTHS = 24;

    public record OutstandingSnapshot(
            long pendingCount,
            BigDecimal pendingAmount,
            long currentMonthPendingCount,
            BigDecimal currentMonthPendingAmount,
            int billingMonth,
            int billingYear
    ) {}

    private final MaintenanceChargeRepository chargeRepository;
    private final MaintenanceBillingService billingService;
    private final MaintenanceRateScheduleRepository rateRepository;
    private final MemberMaintenanceDefaultRepository defaultRepository;
    private final SocietyDirectoryLookup directoryLookup;

    public MaintenanceOutstandingService(
            MaintenanceChargeRepository chargeRepository,
            MaintenanceBillingService billingService,
            MaintenanceRateScheduleRepository rateRepository,
            MemberMaintenanceDefaultRepository defaultRepository,
            SocietyDirectoryLookup directoryLookup) {
        this.chargeRepository = chargeRepository;
        this.billingService = billingService;
        this.rateRepository = rateRepository;
        this.defaultRepository = defaultRepository;
        this.directoryLookup = directoryLookup;
    }

    @Transactional(readOnly = true)
    public OutstandingSnapshot snapshot(UUID societyId) {
        LocalDate today = LocalDate.now();
        int endYear = today.getYear();
        int endMonth = today.getMonthValue();

        List<SocietyDirectoryLookup.MemberRef> members = directoryLookup.listMembers(societyId);
        List<MaintenanceCharge> charges = chargeRepository
                .findBySocietyIdOrderByBillingYearDescBillingMonthDesc(societyId);

        Map<String, MaintenanceCharge> byKey = new HashMap<>();
        for (MaintenanceCharge c : charges) {
            byKey.put(chargeKey(c.getMemberId(), c.getFlatNumber(), c.getBillingYear(), c.getBillingMonth()), c);
            // Flat-only fallback key when memberId missing on older rows
            byKey.putIfAbsent(flatKey(c.getFlatNumber(), c.getBillingYear(), c.getBillingMonth()), c);
        }

        LocalDate start = earliestPeriod(societyId, charges, today);
        long pendingCount = 0;
        BigDecimal pendingAmount = BigDecimal.ZERO;
        long currentMonthCount = 0;
        BigDecimal currentMonthAmount = BigDecimal.ZERO;

        for (LocalDate cursor = start; !cursor.isAfter(today); cursor = cursor.plusMonths(1)) {
            int year = cursor.getYear();
            int month = cursor.getMonthValue();
            boolean isCurrent = year == endYear && month == endMonth;

            for (SocietyDirectoryLookup.MemberRef member : members) {
                MaintenanceCharge charge = findCharge(byKey, member, year, month);
                BigDecimal dueAmount;
                boolean unpaid;

                if (charge != null) {
                    if (charge.getStatus() == MaintenanceStatus.PAID) {
                        continue;
                    }
                    unpaid = true;
                    dueAmount = charge.getAmount() != null ? charge.getAmount() : BigDecimal.ZERO;
                } else {
                    ResolvedAmountResponse resolved = billingService.resolveAmount(
                            societyId, member.id(), member.flatNumber(), year, month);
                    if (!resolved.configured() || resolved.amount() == null
                            || resolved.amount().compareTo(BigDecimal.ZERO) <= 0) {
                        continue;
                    }
                    unpaid = true;
                    dueAmount = resolved.amount();
                }

                if (!unpaid || dueAmount.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                pendingCount++;
                pendingAmount = pendingAmount.add(dueAmount);
                if (isCurrent) {
                    currentMonthCount++;
                    currentMonthAmount = currentMonthAmount.add(dueAmount);
                }
            }
        }

        return new OutstandingSnapshot(
                pendingCount,
                pendingAmount,
                currentMonthCount,
                currentMonthAmount,
                endMonth,
                endYear
        );
    }

    private LocalDate earliestPeriod(UUID societyId, List<MaintenanceCharge> charges, LocalDate today) {
        LocalDate floor = today.minusMonths(MAX_LOOKBACK_MONTHS - 1L).withDayOfMonth(1);
        LocalDate earliest = today.withDayOfMonth(1);

        for (MaintenanceCharge c : charges) {
            LocalDate d = LocalDate.of(c.getBillingYear(), c.getBillingMonth(), 1);
            if (d.isBefore(earliest)) {
                earliest = d;
            }
        }
        for (var r : rateRepository.findBySocietyIdOrderByEffectiveFromYearDescEffectiveFromMonthDesc(societyId)) {
            LocalDate d = LocalDate.of(r.getEffectiveFromYear(), r.getEffectiveFromMonth(), 1);
            if (d.isBefore(earliest)) {
                earliest = d;
            }
        }
        for (var r : defaultRepository
                .findBySocietyIdOrderByEffectiveFromYearDescEffectiveFromMonthDescFlatNumberAsc(societyId)) {
            LocalDate d = LocalDate.of(r.getEffectiveFromYear(), r.getEffectiveFromMonth(), 1);
            if (d.isBefore(earliest)) {
                earliest = d;
            }
        }
        return earliest.isBefore(floor) ? floor : earliest;
    }

    private static MaintenanceCharge findCharge(
            Map<String, MaintenanceCharge> byKey,
            SocietyDirectoryLookup.MemberRef member,
            int year,
            int month) {
        MaintenanceCharge byMember = byKey.get(chargeKey(member.id(), member.flatNumber(), year, month));
        if (byMember != null) return byMember;
        return byKey.get(flatKey(member.flatNumber(), year, month));
    }

    private static String chargeKey(UUID memberId, String flat, int year, int month) {
        String flatNorm = normalizeFlat(flat);
        String memberPart = memberId == null ? "" : memberId.toString();
        return memberPart + "|" + flatNorm + "|" + year + "|" + month;
    }

    private static String flatKey(String flat, int year, int month) {
        return "flat|" + normalizeFlat(flat) + "|" + year + "|" + month;
    }

    private static String normalizeFlat(String flat) {
        return flat == null ? "" : flat.trim().toLowerCase(Locale.ROOT);
    }
}
