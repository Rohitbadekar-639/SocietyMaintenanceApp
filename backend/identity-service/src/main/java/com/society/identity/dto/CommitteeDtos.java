package com.society.identity.dto;

import jakarta.validation.constraints.NotBlank;

public class CommitteeDtos {

    public record UpsertCommitteeRequest(
            @NotBlank String fullName,
            @NotBlank String title,
            String mobile,
            String email,
            String userId,
            Integer displayOrder
    ) {}

    public record CommitteeResponse(
            String id,
            String userId,
            String fullName,
            String title,
            String mobile,
            String email,
            int displayOrder,
            boolean active
    ) {}
}
