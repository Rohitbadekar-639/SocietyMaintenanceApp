package com.society.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CommitteeDtos {

    public record UpsertCommitteeRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120, message = "Full name must be 2–120 characters")
            String fullName,
            @NotBlank(message = "Title is required")
            String title,
            @Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
            String mobile,
            @Email(message = "Enter a valid email address")
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
