package com.society.core.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public class SocietyAiDtos {

    public record DuesWhatsAppDraftRequest(
            @NotBlank @Size(max = 8) String language,
            @NotBlank @Size(max = 150) String societyName,
            @NotBlank @Size(max = 120) String memberName,
            @NotBlank @Size(max = 40) String flatNumber,
            @Size(max = 15) String memberMobile,
            @NotNull @DecimalMin("0.0") BigDecimal amount,
            @NotNull @Min(1) @Max(12) Integer billingMonth,
            @NotNull @Min(2000) @Max(2100) Integer billingYear,
            @Size(max = 200) String paymentHint
    ) {}

    public record DuesWhatsAppDraftResponse(
            String language,
            String message
    ) {}

    public record NoticeDraftRequest(
            @NotBlank @Size(max = 8) String language,
            @NotBlank @Size(max = 150) String societyName,
            @NotBlank @Size(min = 5, max = 800) String topic,
            @Size(max = 20) String priorityHint
    ) {}

    public record NoticeDraftResponse(
            String language,
            String title,
            String body,
            String priority
    ) {}

    public record AttentionDigestRequest(
            @NotBlank @Size(max = 8) String language,
            @Size(max = 150) String societyName
    ) {}

    public record AttentionDigestResponse(
            String language,
            String summary,
            List<AttentionItem> items,
            AttentionStats stats
    ) {}

    public record AttentionItem(
            String type,
            String title,
            String detail,
            String actionTab
    ) {}

    public record AttentionStats(
            long pendingDuesCount,
            BigDecimal pendingDuesAmount,
            long submittedClaims,
            long openComplaints,
            long unnotifiedNotices,
            boolean hasBankAccount,
            int billingMonth,
            int billingYear
    ) {}
}
