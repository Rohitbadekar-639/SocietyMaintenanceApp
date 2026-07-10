package com.society.core.repository;

import com.society.core.domain.AuditDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditDocumentRepository extends JpaRepository<AuditDocument, UUID> {
    List<AuditDocument> findBySocietyIdOrderByPeriodYearDescPeriodMonthDescCreatedAtDesc(UUID societyId);
    Optional<AuditDocument> findByIdAndSocietyId(UUID id, UUID societyId);
}
