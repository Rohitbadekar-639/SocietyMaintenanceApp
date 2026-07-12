package com.society.core.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("h2")
public class H2ProfileWarning implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(H2ProfileWarning.class);

    @Override
    public void run(ApplicationArguments args) {
        log.warn("""
                ============================================================
                Core is using EMPTY in-memory H2 — Neon data is NOT loaded.
                For real data run: .\\scripts\\start-backend-neon.ps1 -Service core
                ============================================================
                """);
    }
}
