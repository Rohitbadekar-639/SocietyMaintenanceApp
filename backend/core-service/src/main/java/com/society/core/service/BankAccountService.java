package com.society.core.service;

import com.society.core.domain.SocietyBankAccount;
import com.society.core.dto.BankAccountDtos.*;
import com.society.core.exception.ApiExceptions.NotFoundException;
import com.society.core.repository.SocietyBankAccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BankAccountService {

    private final SocietyBankAccountRepository repository;

    public BankAccountService(SocietyBankAccountRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<BankAccountResponse> listActive(UUID societyId) {
        return repository.findBySocietyIdAndActiveTrueOrderByPrimaryAccountDescCreatedAtDesc(societyId)
                .stream().map(BankAccountService::toResponse).toList();
    }

    @Transactional
    public BankAccountResponse create(UUID societyId, UUID createdBy, UpsertBankAccountRequest req) {
        SocietyBankAccount account = new SocietyBankAccount();
        account.setSocietyId(societyId);
        account.setCreatedBy(createdBy);
        apply(account, req);
        return toResponse(repository.save(account));
    }

    @Transactional
    public BankAccountResponse update(UUID societyId, UUID id, UpsertBankAccountRequest req) {
        SocietyBankAccount account = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));
        apply(account, req);
        return toResponse(repository.save(account));
    }

    @Transactional
    public void deactivate(UUID societyId, UUID id) {
        SocietyBankAccount account = repository.findByIdAndSocietyId(id, societyId)
                .orElseThrow(() -> new NotFoundException("Bank account not found"));
        account.setActive(false);
        repository.save(account);
    }

    private void apply(SocietyBankAccount account, UpsertBankAccountRequest req) {
        account.setAccountName(req.accountName().trim());
        account.setBankName(req.bankName().trim());
        account.setAccountNumber(req.accountNumber().trim());
        account.setIfscCode(req.ifscCode().trim().toUpperCase());
        account.setBranchName(req.branchName());
        account.setUpiId(req.upiId());
        account.setPrimaryAccount(Boolean.TRUE.equals(req.primaryAccount()));
        account.setNotes(req.notes());
        account.setActive(true);
    }

    static BankAccountResponse toResponse(SocietyBankAccount a) {
        return new BankAccountResponse(
                a.getId().toString(),
                a.getAccountName(),
                a.getBankName(),
                a.getAccountNumber(),
                a.getIfscCode(),
                a.getBranchName(),
                a.getUpiId(),
                a.isPrimaryAccount(),
                a.getNotes(),
                a.isActive()
        );
    }
}
