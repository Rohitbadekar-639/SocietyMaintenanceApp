package com.society.core.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "society_bank_accounts",
        indexes = @Index(name = "idx_bank_society", columnList = "society_id,active"))
public class SocietyBankAccount {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "society_id", nullable = false)
    private UUID societyId;

    @Column(name = "account_name", nullable = false, length = 150)
    private String accountName;

    @Column(name = "bank_name", nullable = false, length = 150)
    private String bankName;

    @Column(name = "account_number", nullable = false, length = 40)
    private String accountNumber;

    @Column(name = "ifsc_code", nullable = false, length = 20)
    private String ifscCode;

    @Column(name = "branch_name", length = 150)
    private String branchName;

    @Column(name = "upi_id", length = 100)
    private String upiId;

    @Column(name = "is_primary", nullable = false)
    private boolean primaryAccount = false;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSocietyId() { return societyId; }
    public void setSocietyId(UUID societyId) { this.societyId = societyId; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String ifscCode) { this.ifscCode = ifscCode; }
    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }
    public String getUpiId() { return upiId; }
    public void setUpiId(String upiId) { this.upiId = upiId; }
    public boolean isPrimaryAccount() { return primaryAccount; }
    public void setPrimaryAccount(boolean primaryAccount) { this.primaryAccount = primaryAccount; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
