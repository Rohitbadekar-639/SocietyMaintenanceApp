package com.society.identity.dto;

/**
 * Public society directory payloads (member signup helpers).
 */
public class SocietyDtos {

    /** Minimal public listing for society-code selection. */
    public record SocietyOption(
            String societyCode,
            String societyName
    ) {}
}
