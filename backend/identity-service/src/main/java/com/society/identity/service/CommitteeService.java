package com.society.identity.service;

import com.society.identity.domain.CommitteeProfile;
import com.society.identity.dto.CommitteeDtos.*;
import com.society.identity.exception.ApiExceptions.BadRequestException;
import com.society.identity.exception.ApiExceptions.NotFoundException;
import com.society.identity.repository.CommitteeProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class CommitteeService {

    private static final Set<String> TITLES = Set.of(
            "CHAIRMAN", "SECRETARY", "TREASURER", "COMMITTEE_MEMBER");

    private final CommitteeProfileRepository repository;

    public CommitteeService(CommitteeProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<CommitteeResponse> listActive(UUID societyId) {
        return repository.findBySocietyIdAndActiveTrueOrderByDisplayOrderAscFullNameAsc(societyId)
                .stream().map(CommitteeService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<CommitteeResponse> listAll(UUID societyId) {
        return repository.findBySocietyIdOrderByDisplayOrderAscFullNameAsc(societyId)
                .stream().map(CommitteeService::toResponse).toList();
    }

    @Transactional
    public CommitteeResponse create(UUID societyId, UpsertCommitteeRequest req) {
        CommitteeProfile profile = new CommitteeProfile();
        profile.setSocietyId(societyId);
        apply(profile, req);
        return toResponse(repository.save(profile));
    }

    @Transactional
    public CommitteeResponse update(UUID societyId, UUID id, UpsertCommitteeRequest req) {
        CommitteeProfile profile = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Committee profile not found"));
        apply(profile, req);
        return toResponse(repository.save(profile));
    }

    @Transactional
    public void deactivate(UUID societyId, UUID id) {
        CommitteeProfile profile = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Committee profile not found"));
        profile.setActive(false);
        repository.save(profile);
    }

    private void apply(CommitteeProfile profile, UpsertCommitteeRequest req) {
        String title = req.title().trim().toUpperCase();
        if (!TITLES.contains(title)) {
            throw new BadRequestException("Title must be CHAIRMAN, SECRETARY, TREASURER or COMMITTEE_MEMBER");
        }
        profile.setFullName(req.fullName().trim());
        profile.setTitle(title);
        profile.setMobile(req.mobile());
        profile.setEmail(req.email());
        profile.setDisplayOrder(req.displayOrder() == null ? 0 : req.displayOrder());
        if (req.userId() != null && !req.userId().isBlank()) {
            profile.setUserId(UUID.fromString(req.userId()));
        } else {
            profile.setUserId(null);
        }
        profile.setActive(true);
    }

    static CommitteeResponse toResponse(CommitteeProfile p) {
        return new CommitteeResponse(
                p.getId().toString(),
                p.getUserId() == null ? null : p.getUserId().toString(),
                p.getFullName(),
                p.getTitle(),
                p.getMobile(),
                p.getEmail(),
                p.getDisplayOrder(),
                p.isActive()
        );
    }
}
