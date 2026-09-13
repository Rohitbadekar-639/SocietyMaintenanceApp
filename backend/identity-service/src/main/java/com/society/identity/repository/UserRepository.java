package com.society.identity.repository;

import com.society.identity.domain.Role;
import com.society.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, UUID id);
    boolean existsBySocietyIdAndMobile(UUID societyId, String mobile);
    boolean existsBySocietyIdAndMobileAndIdNot(UUID societyId, String mobile, UUID id);
    boolean existsBySocietyIdAndEmail(UUID societyId, String email);
    boolean existsBySocietyIdAndEmailAndIdNot(UUID societyId, String email, UUID id);

    @Query("""
            SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
            FROM User u
            WHERE u.societyId = :societyId
              AND u.flatNumber IS NOT NULL
              AND LOWER(TRIM(u.flatNumber)) = LOWER(TRIM(:flatNumber))
            """)
    boolean existsBySocietyIdAndFlatNumberIgnoreCase(
            @Param("societyId") UUID societyId,
            @Param("flatNumber") String flatNumber);

    @Query("""
            SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END
            FROM User u
            WHERE u.societyId = :societyId
              AND u.id <> :id
              AND u.flatNumber IS NOT NULL
              AND LOWER(TRIM(u.flatNumber)) = LOWER(TRIM(:flatNumber))
            """)
    boolean existsBySocietyIdAndFlatNumberIgnoreCaseAndIdNot(
            @Param("societyId") UUID societyId,
            @Param("flatNumber") String flatNumber,
            @Param("id") UUID id);

    List<User> findBySocietyIdAndRole(UUID societyId, Role role);
    List<User> findBySocietyIdAndRoleAndActiveTrue(UUID societyId, Role role);
    List<User> findBySocietyId(UUID societyId);
}
