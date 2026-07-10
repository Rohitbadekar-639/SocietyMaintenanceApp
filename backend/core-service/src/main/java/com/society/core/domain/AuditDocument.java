package com.society.core.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_documents",
        indexes = @Index(name = "idx_audit_docs_society", columnList = "society_id,period_year,period_month"))
public class AuditDocument {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "society_id", nullable = false)
    private UUID societyId;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "period_type", nullable = false, length = 20)
    private String periodType;

    @Column(name = "period_year", nullable = false)
    private int periodYear;

    @Column(name = "period_month")
    private Integer periodMonth;

    @Column(name = "document_url", nullable = false, length = 1000)
    private String documentUrl;

    @Column(name = "file_name", length = 255)
    private String fileName;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_by_name", length = 150)
    private String createdByName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSocietyId() { return societyId; }
    public void setSocietyId(UUID societyId) { this.societyId = societyId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPeriodType() { return periodType; }
    public void setPeriodType(String periodType) { this.periodType = periodType; }
    public int getPeriodYear() { return periodYear; }
    public void setPeriodYear(int periodYear) { this.periodYear = periodYear; }
    public Integer getPeriodMonth() { return periodMonth; }
    public void setPeriodMonth(Integer periodMonth) { this.periodMonth = periodMonth; }
    public String getDocumentUrl() { return documentUrl; }
    public void setDocumentUrl(String documentUrl) { this.documentUrl = documentUrl; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public UUID getCreatedBy() { return createdBy; }
    public void setCreatedBy(UUID createdBy) { this.createdBy = createdBy; }
    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
