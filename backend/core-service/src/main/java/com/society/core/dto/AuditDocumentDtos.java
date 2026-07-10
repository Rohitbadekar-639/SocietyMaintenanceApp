package com.society.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AuditDocumentDtos {

    public record UpsertAuditDocumentRequest(
            @NotBlank String title,
            String description,
            @NotBlank String periodType,
            @NotNull @Min(2000) @Max(2100) Integer periodYear,
            @Min(1) @Max(12) Integer periodMonth,
            @NotBlank String documentUrl,
            String fileName
    ) {}

    public record AuditDocumentResponse(
            String id,
            String title,
            String description,
            String periodType,
            int periodYear,
            Integer periodMonth,
            String documentUrl,
            String fileName,
            String createdByName,
            String createdAt
    ) {}
}
