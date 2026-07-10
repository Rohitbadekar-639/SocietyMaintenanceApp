package com.society.core.domain;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_claims",
        indexes = {
                @Index(name = "idx_payment_claims_society_status", columnList = "society_id,status,created_at"),
                @Index(name = "idx_payment_claims_member", columnList = "society_id,member_id,created_at")
        })
public class PaymentClaim {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "society_id", nullable = false)
    private UUID societyId;

    @Column(name = "charge_id", nullable = false)
    private UUID chargeId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "member_name", length = 150)
    private String memberName;

    @Column(name = "flat_number", nullable = false, length = 20)
    private String flatNumber;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_mode", length = 30)
    private String paymentMode;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false, length = 20)
    private String status = "SUBMITTED";

    @Column(name = "reviewed_by")
    private UUID reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_notes", length = 500)
    private String reviewNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSocietyId() { return societyId; }
    public void setSocietyId(UUID societyId) { this.societyId = societyId; }
    public UUID getChargeId() { return chargeId; }
    public void setChargeId(UUID chargeId) { this.chargeId = chargeId; }
    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public String getMemberName() { return memberName; }
    public void setMemberName(String memberName) { this.memberName = memberName; }
    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public UUID getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(UUID reviewedBy) { this.reviewedBy = reviewedBy; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
