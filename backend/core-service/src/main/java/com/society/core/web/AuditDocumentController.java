package com.society.core.web;

import com.society.core.dto.AuditDocumentDtos.*;
import com.society.core.security.AuthenticatedUser;
import com.society.core.service.AuditDocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/audit-documents")
public class AuditDocumentController {

    private final AuditDocumentService service;

    public AuditDocumentController(AuditDocumentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<AuditDocumentResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(service.list(user.societyId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditDocumentResponse> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpsertAuditDocumentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(user.societyId(), user.userId(), user.name(), req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AuditDocumentResponse> update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpsertAuditDocumentRequest req) {
        return ResponseEntity.ok(service.update(user.societyId(), id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id) {
        service.delete(user.societyId(), id);
        return ResponseEntity.noContent().build();
    }
}
