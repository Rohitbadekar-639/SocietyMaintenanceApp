package com.society.core.service;

import com.society.core.domain.MaintenanceCharge;
import com.society.core.domain.MaintenanceStatus;
import com.society.core.domain.PaymentClaim;
import com.society.core.dto.PaymentClaimDtos.*;
import com.society.core.exception.ApiExceptions.BadRequestException;
import com.society.core.exception.ApiExceptions.ConflictException;
import com.society.core.exception.ApiExceptions.NotFoundException;
import com.society.core.repository.MaintenanceChargeRepository;
import com.society.core.repository.PaymentClaimRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class PaymentClaimService {

    private final PaymentClaimRepository claimRepository;
    private final MaintenanceChargeRepository chargeRepository;

    public PaymentClaimService(PaymentClaimRepository claimRepository,
                               MaintenanceChargeRepository chargeRepository) {
        this.claimRepository = claimRepository;
        this.chargeRepository = chargeRepository;
    }

    @Transactional
    public PaymentClaimResponse submit(UUID societyId, UUID memberId, String memberName, String flatNumber,
                                       SubmitPaymentClaimRequest req) {
        UUID chargeId = UUID.fromString(req.chargeId());
        MaintenanceCharge charge = chargeRepository.findByIdAndSocietyId(chargeId, societyId)
                .orElseThrow(() -> new NotFoundException("Maintenance charge not found"));

        if (flatNumber == null || flatNumber.isBlank()) {
            throw new BadRequestException("Your profile needs a flat number before submitting payment claims");
        }
        if (!flatNumber.equalsIgnoreCase(charge.getFlatNumber())) {
            throw new BadRequestException("You can only claim payment for your own flat");
        }
        if (charge.getStatus() == MaintenanceStatus.PAID) {
            throw new ConflictException("This maintenance charge is already marked paid");
        }
        if (claimRepository.existsBySocietyIdAndChargeIdAndStatus(societyId, chargeId, "SUBMITTED")) {
            throw new ConflictException("A payment claim is already pending for this charge");
        }

        PaymentClaim claim = new PaymentClaim();
        claim.setSocietyId(societyId);
        claim.setChargeId(chargeId);
        claim.setMemberId(memberId);
        claim.setMemberName(memberName);
        claim.setFlatNumber(charge.getFlatNumber());
        claim.setAmount(charge.getAmount());
        claim.setPaymentMode(req.paymentMode() == null ? "BANK_TRANSFER" : req.paymentMode());
        claim.setReferenceNumber(req.referenceNumber());
        claim.setNotes(req.notes());
        claim.setStatus("SUBMITTED");
        return toResponse(claimRepository.save(claim));
    }

    @Transactional(readOnly = true)
    public List<PaymentClaimResponse> listForSociety(UUID societyId, String status) {
        List<PaymentClaim> claims = (status == null || status.isBlank())
                ? claimRepository.findBySocietyIdOrderByCreatedAtDesc(societyId)
                : claimRepository.findBySocietyIdAndStatusOrderByCreatedAtDesc(societyId, status.toUpperCase());
        return claims.stream().map(PaymentClaimService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentClaimResponse> listForMember(UUID societyId, UUID memberId) {
        return claimRepository.findBySocietyIdAndMemberIdOrderByCreatedAtDesc(societyId, memberId)
                .stream().map(PaymentClaimService::toResponse).toList();
    }

    @Transactional
    public PaymentClaimResponse review(UUID societyId, UUID adminId, UUID claimId, ReviewPaymentClaimRequest req) {
        PaymentClaim claim = claimRepository.findByIdAndSocietyId(claimId, societyId)
                .orElseThrow(() -> new NotFoundException("Payment claim not found"));
        if (!"SUBMITTED".equals(claim.getStatus())) {
            throw new ConflictException("Only submitted claims can be reviewed");
        }

        String decision = req.decision().trim().toUpperCase();
        if (!decision.equals("APPROVED") && !decision.equals("REJECTED")) {
            throw new BadRequestException("decision must be APPROVED or REJECTED");
        }

        claim.setStatus(decision);
        claim.setReviewedBy(adminId);
        claim.setReviewedAt(Instant.now());
        claim.setReviewNotes(req.reviewNotes());

        if ("APPROVED".equals(decision)) {
            MaintenanceCharge charge = chargeRepository.findByIdAndSocietyId(claim.getChargeId(), societyId)
                    .orElseThrow(() -> new NotFoundException("Maintenance charge not found"));
            charge.setStatus(MaintenanceStatus.PAID);
            charge.setPaidAt(Instant.now());
            charge.setPaymentMode(req.paymentMode() != null ? req.paymentMode() : claim.getPaymentMode());
            String note = "Verified via payment claim";
            if (claim.getReferenceNumber() != null && !claim.getReferenceNumber().isBlank()) {
                note = note + " (ref: " + claim.getReferenceNumber() + ")";
            }
            charge.setNotes(note);
            chargeRepository.save(charge);
        }

        return toResponse(claimRepository.save(claim));
    }

    static PaymentClaimResponse toResponse(PaymentClaim c) {
        return new PaymentClaimResponse(
                c.getId().toString(),
                c.getChargeId().toString(),
                c.getMemberId().toString(),
                c.getMemberName(),
                c.getFlatNumber(),
                c.getAmount(),
                c.getPaymentMode(),
                c.getReferenceNumber(),
                c.getNotes(),
                c.getStatus(),
                c.getReviewNotes(),
                c.getCreatedAt(),
                c.getReviewedAt()
        );
    }
}
