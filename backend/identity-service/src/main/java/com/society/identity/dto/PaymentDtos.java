package com.society.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class PaymentDtos {

    public record SubscriptionPricingResponse(
            boolean enabled,
            String keyId,
            String currency,
            int baseMaintenanceRupees,
            int minFlatCount,
            int maxFlatCount,
            String planLabel,
            String billingPeriod,
            String note
    ) {}

    public record QuoteRequest(
            @NotNull(message = "Number of flats is required")
            @Min(value = 1, message = "Enter at least 1 flat")
            @Max(value = 5000, message = "Number of flats looks too high — contact support if your society is larger")
            Integer flatCount
    ) {}

    public record QuoteResponse(
            int flatCount,
            long amountPaise,
            String amountDisplay,
            int baseMaintenanceRupees,
            String note
    ) {}

    public record CreateOrderRequest(
            @NotBlank(message = "Society name is required")
            @Size(min = 2, max = 150)
            String societyName,
            @NotBlank(message = "Society code is required")
            @Size(min = 2, max = 40)
            @Pattern(regexp = "^[A-Za-z0-9][A-Za-z0-9_-]*$", message = "Society code may use letters, numbers, hyphen and underscore")
            String societyCode,
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120)
            String adminName,
            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email address")
            String adminEmail,
            @NotNull(message = "Number of flats is required")
            @Min(value = 1, message = "Enter at least 1 flat")
            @Max(value = 5000, message = "Number of flats looks too high — contact support if your society is larger")
            Integer flatCount
    ) {}

    public record CreateOrderResponse(
            String keyId,
            String orderId,
            long amountPaise,
            String amountDisplay,
            String currency,
            String receiptNumber,
            int flatCount,
            int baseMaintenanceRupees,
            String planLabel
    ) {}
}
