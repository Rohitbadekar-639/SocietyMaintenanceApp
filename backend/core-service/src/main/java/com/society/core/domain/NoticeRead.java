package com.society.core.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "notice_reads",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_notice_read_member",
                columnNames = {"notice_id", "member_id"}
        ),
        indexes = {
                @Index(name = "idx_notice_read_member", columnList = "society_id,member_id"),
                @Index(name = "idx_notice_read_notice", columnList = "notice_id")
        }
)
public class NoticeRead {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "society_id", nullable = false)
    private UUID societyId;

    @Column(name = "notice_id", nullable = false)
    private UUID noticeId;

    @Column(name = "member_id", nullable = false)
    private UUID memberId;

    @Column(name = "read_at", nullable = false)
    private Instant readAt = Instant.now();

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getSocietyId() { return societyId; }
    public void setSocietyId(UUID societyId) { this.societyId = societyId; }
    public UUID getNoticeId() { return noticeId; }
    public void setNoticeId(UUID noticeId) { this.noticeId = noticeId; }
    public UUID getMemberId() { return memberId; }
    public void setMemberId(UUID memberId) { this.memberId = memberId; }
    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }
}
