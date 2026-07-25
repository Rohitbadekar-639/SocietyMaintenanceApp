package com.society.core.web;

import com.society.core.dto.SocietyAiDtos.*;
import com.society.core.security.AuthenticatedUser;
import com.society.core.service.SocietyAiService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class SocietyAiController {

    private final SocietyAiService service;

    public SocietyAiController(SocietyAiService service) {
        this.service = service;
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Boolean>> status(@AuthenticationPrincipal AuthenticatedUser user) {
        requireAdmin(user);
        return ResponseEntity.ok(Map.of("configured", service.isConfigured()));
    }

    @PostMapping("/dues-whatsapp-draft")
    public ResponseEntity<DuesWhatsAppDraftResponse> duesWhatsAppDraft(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody DuesWhatsAppDraftRequest req) {
        requireAdmin(user);
        return ResponseEntity.ok(service.duesWhatsAppDraft(req));
    }

    @PostMapping("/notice-draft")
    public ResponseEntity<NoticeDraftResponse> noticeDraft(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody NoticeDraftRequest req) {
        requireAdmin(user);
        return ResponseEntity.ok(service.noticeDraft(req));
    }

    @PostMapping("/attention-digest")
    public ResponseEntity<AttentionDigestResponse> attentionDigest(
            @AuthenticationPrincipal AuthenticatedUser user,
            @Valid @RequestBody AttentionDigestRequest req) {
        requireAdmin(user);
        String societyName = req.societyName() == null || req.societyName().isBlank()
                ? "Your society"
                : req.societyName().trim();
        return ResponseEntity.ok(service.attentionDigest(user.societyId(), societyName, req));
    }

    private static void requireAdmin(AuthenticatedUser user) {
        if (user == null || !"ADMIN".equalsIgnoreCase(user.role())) {
            throw new org.springframework.security.access.AccessDeniedException("Admin access required");
        }
    }
}
