package com.society.core.repository;

import com.society.core.domain.PaymentClaim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentClaimRepository extends JpaRepository<PaymentClaim, UUID> {
    List<PaymentClaim> findBySocietyIdOrderByCreatedAtDesc(UUID societyId);
    List<PaymentClaim> findBySocietyIdAndMemberIdOrderByCreatedAtDesc(UUID societyId, UUID memberId);
    List<PaymentClaim> findBySocietyIdAndStatusOrderByCreatedAtDesc(UUID societyId, String status);
    Optional<PaymentClaim> findByIdAndSocietyId(UUID id, UUID societyId);
    boolean existsBySocietyIdAndChargeIdAndStatus(UUID societyId, UUID chargeId, String status);
}
