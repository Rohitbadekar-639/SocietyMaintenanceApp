package com.society.core.repository;

import com.society.core.domain.SocietyBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SocietyBankAccountRepository extends JpaRepository<SocietyBankAccount, UUID> {
    List<SocietyBankAccount> findBySocietyIdAndActiveTrueOrderByPrimaryAccountDescCreatedAtDesc(UUID societyId);
    List<SocietyBankAccount> findBySocietyIdOrderByPrimaryAccountDescCreatedAtDesc(UUID societyId);
    Optional<SocietyBankAccount> findByIdAndSocietyId(UUID id, UUID societyId);
}
