package com.society.identity.web;

import com.society.identity.dto.CommitteeDtos.*;
import com.society.identity.security.AuthenticatedUser;
import com.society.identity.service.CommitteeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/committee")
public class CommitteeController {

    private final CommitteeService service;

    public CommitteeController(CommitteeService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<CommitteeResponse>> list(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(defaultValue = "false") boolean includeInactive) {
        if (includeInactive && "ADMIN".equals(user.role())) {
            return ResponseEntity.ok(service.listAll(user.societyId()));
        }
        return ResponseEntity.ok(service.listActive(user.societyId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommitteeResponse> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpsertCommitteeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(user.societyId(), req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommitteeResponse> update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpsertCommitteeRequest req) {
        return ResponseEntity.ok(service.update(user.societyId(), id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id) {
        service.deactivate(user.societyId(), id);
        return ResponseEntity.noContent().build();
    }
}
