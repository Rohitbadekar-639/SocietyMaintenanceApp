package com.society.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;

public class PaymentClaimDtos {

    public record SubmitPaymentClaimRequest(
            @NotBlank String chargeId,
            String paymentMode,
            String referenceNumber,
            String notes
    ) {}

    public record ReviewPaymentClaimRequest(
            @NotBlank String decision,
            String reviewNotes,
            String paymentMode
    ) {}

    public record PaymentClaimResponse(
            String id,
            String chargeId,
            String memberId,
            String memberName,
            String flatNumber,
            BigDecimal amount,
            String paymentMode,
            String referenceNumber,
            String notes,
            String status,
            String reviewNotes,
            Instant createdAt,
            Instant reviewedAt
    ) {}
}
