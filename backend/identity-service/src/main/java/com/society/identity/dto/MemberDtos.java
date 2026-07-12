package com.society.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class MemberDtos {

    public record AddMemberRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120, message = "Full name must be 2–120 characters")
            String fullName,
            @NotBlank(message = "Flat number is required")
            @Size(min = 1, max = 30, message = "Flat number must be 1–30 characters")
            String flatNumber,
            @NotBlank(message = "Mobile number is required")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
            String mobile,
            @Email(message = "Enter a valid email address")
            String email,
            @Size(min = 6, max = 72, message = "Password must be 6–72 characters")
            String password
    ) {}

    public record UpdateMemberRequest(
            @NotBlank(message = "Full name is required")
            @Size(min = 2, max = 120, message = "Full name must be 2–120 characters")
            String fullName,
            @NotBlank(message = "Flat number is required")
            @Size(min = 1, max = 30, message = "Flat number must be 1–30 characters")
            String flatNumber,
            @NotBlank(message = "Mobile number is required")
            @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
            String mobile,
            @Email(message = "Enter a valid email address")
            String email
    ) {}

    /** If newPassword is blank, password is reset to the member's mobile number. */
    public record ResetMemberPasswordRequest(
            @Size(min = 6, message = "Password must be at least 6 characters") String newPassword
    ) {}

    public record ResetMemberPasswordResponse(
            String memberId,
            String fullName,
            String email,
            String temporaryPassword,
            String message
    ) {}

    public record MemberResponse(
            String id,
            String fullName,
            String flatNumber,
            String mobile,
            String email,
            String role,
            boolean active
    ) {}
}
