package com.society.identity.repository;

import com.society.identity.domain.CommitteeProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommitteeProfileRepository extends JpaRepository<CommitteeProfile, UUID> {
    List<CommitteeProfile> findBySocietyIdAndActiveTrueOrderByDisplayOrderAscFullNameAsc(UUID societyId);
    List<CommitteeProfile> findBySocietyIdOrderByDisplayOrderAscFullNameAsc(UUID societyId);
    Optional<CommitteeProfile> findByIdAndSocietyId(UUID id, UUID societyId);
}
