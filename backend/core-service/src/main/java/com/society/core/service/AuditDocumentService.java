package com.society.core.service;

import com.society.core.domain.AuditDocument;
import com.society.core.dto.AuditDocumentDtos.*;
import com.society.core.exception.ApiExceptions.BadRequestException;
import com.society.core.exception.ApiExceptions.NotFoundException;
import com.society.core.repository.AuditDocumentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class AuditDocumentService {

    private static final Set<String> PERIOD_TYPES = Set.of("MONTHLY", "ANNUAL", "OTHER");

    private final AuditDocumentRepository repository;

    public AuditDocumentService(AuditDocumentRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<AuditDocumentResponse> list(UUID societyId) {
        return repository.findBySocietyIdOrderByPeriodYearDescPeriodMonthDescCreatedAtDesc(societyId)
                .stream().map(AuditDocumentService::toResponse).toList();
    }

    @Transactional
    public AuditDocumentResponse create(UUID societyId, UUID createdBy, String createdByName, UpsertAuditDocumentRequest req) {
        AuditDocument doc = new AuditDocument();
        doc.setSocietyId(societyId);
        doc.setCreatedBy(createdBy);
        doc.setCreatedByName(createdByName);
        apply(doc, req);
        return toResponse(repository.save(doc));
    }

    @Transactional
    public AuditDocumentResponse update(UUID societyId, UUID id, UpsertAuditDocumentRequest req) {
        AuditDocument doc = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Audit document not found"));
        apply(doc, req);
        return toResponse(repository.save(doc));
    }

    @Transactional
    public void delete(UUID societyId, UUID id) {
        AuditDocument doc = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Audit document not found"));
        repository.delete(doc);
    }

    private void apply(AuditDocument doc, UpsertAuditDocumentRequest req) {
        String periodType = req.periodType().trim().toUpperCase();
        if (!PERIOD_TYPES.contains(periodType)) {
            throw new BadRequestException("periodType must be MONTHLY, ANNUAL or OTHER");
        }
        if ("MONTHLY".equals(periodType) && req.periodMonth() == null) {
            throw new BadRequestException("periodMonth is required for MONTHLY documents");
        }
        doc.setTitle(req.title().trim());
        doc.setDescription(req.description());
        doc.setPeriodType(periodType);
        doc.setPeriodYear(req.periodYear());
        doc.setPeriodMonth("MONTHLY".equals(periodType) ? req.periodMonth() : req.periodMonth());
        doc.setDocumentUrl(req.documentUrl().trim());
        doc.setFileName(req.fileName());
    }

    static AuditDocumentResponse toResponse(AuditDocument d) {
        return new AuditDocumentResponse(
                d.getId().toString(),
                d.getTitle(),
                d.getDescription(),
                d.getPeriodType(),
                d.getPeriodYear(),
                d.getPeriodMonth(),
                d.getDocumentUrl(),
                d.getFileName(),
                d.getCreatedByName(),
                d.getCreatedAt() == null ? null : d.getCreatedAt().toString()
        );
    }
}
