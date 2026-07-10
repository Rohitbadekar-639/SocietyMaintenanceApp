package com.society.core.web;

import com.society.core.dto.PaymentClaimDtos.*;
import com.society.core.security.AuthenticatedUser;
import com.society.core.service.PaymentClaimService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payment-claims")
public class PaymentClaimController {

    private final PaymentClaimService service;

    public PaymentClaimController(PaymentClaimService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<PaymentClaimResponse>> list(
            @AuthenticationPrincipal AuthenticatedUser user,
            @RequestParam(required = false) String status) {
        if ("ADMIN".equals(user.role())) {
            return ResponseEntity.ok(service.listForSociety(user.societyId(), status));
        }
        return ResponseEntity.ok(service.listForMember(user.societyId(), user.userId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('MEMBER')")
    public ResponseEntity<PaymentClaimResponse> submit(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody SubmitPaymentClaimRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                service.submit(user.societyId(), user.userId(), user.name(), user.flatNumber(), req));
    }

    @PostMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentClaimResponse> review(
            @AuthenticationPrincipal AuthenticatedUser user,
            @PathVariable UUID id,
            @Valid @RequestBody ReviewPaymentClaimRequest req) {
        return ResponseEntity.ok(service.review(user.societyId(), user.userId(), id, req));
    }
}
