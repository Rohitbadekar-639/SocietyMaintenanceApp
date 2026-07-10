package com.society.core.dto;

import jakarta.validation.constraints.NotBlank;

public class BankAccountDtos {

    public record UpsertBankAccountRequest(
            @NotBlank String accountName,
            @NotBlank String bankName,
            @NotBlank String accountNumber,
            @NotBlank String ifscCode,
            String branchName,
            String upiId,
            Boolean primaryAccount,
            String notes
    ) {}

    public record BankAccountResponse(
            String id,
            String accountName,
            String bankName,
            String accountNumber,
            String ifscCode,
            String branchName,
            String upiId,
            boolean primaryAccount,
            String notes,
            boolean active
    ) {}
}
