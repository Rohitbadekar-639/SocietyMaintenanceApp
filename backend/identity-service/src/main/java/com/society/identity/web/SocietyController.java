package com.society.identity.web;

import com.society.identity.dto.SocietyDtos.SocietyOption;
import com.society.identity.repository.SocietyRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/societies")
public class SocietyController {

    private final SocietyRepository societyRepository;

    public SocietyController(SocietyRepository societyRepository) {
        this.societyRepository = societyRepository;
    }

    /** Public list of society codes + names for member signup dropdown. */
    @GetMapping
    public List<SocietyOption> listOptions() {
        return societyRepository.findAllByOrderByNameAsc().stream()
                .map(s -> new SocietyOption(s.getSocietyCode(), s.getName()))
                .toList();
    }
}
