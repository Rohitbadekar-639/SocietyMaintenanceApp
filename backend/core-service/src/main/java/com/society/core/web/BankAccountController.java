package com.society.core.web;

import com.society.core.dto.BankAccountDtos.*;
import com.society.core.security.AuthenticatedUser;
import com.society.core.service.BankAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bank-accounts")
public class BankAccountController {

    private final BankAccountService service;

    public BankAccountController(BankAccountService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<BankAccountResponse>> list(@AuthenticationPrincipal AuthenticatedUser user) {
        return ResponseEntity.ok(service.listActive(user.societyId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BankAccountResponse> create(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody UpsertBankAccountRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(user.societyId(), user.userId(), req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BankAccountResponse> update(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id,
            @Valid @RequestBody UpsertBankAccountRequest req) {
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
